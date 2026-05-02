/**
 * Compile and deploy ComputeRouter contract using solc + viem
 * No hardhat required - works with Node.js 20
 */

const solc = require('solc');
const { createWalletClient, createPublicClient, http, defineChain } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

const PRIVATE_KEY = '0xbee08246ca39778e583dcc1cf32e005ac3da4a3c1da50e80c57060066a52fc8a';
const AGENT_ADDRESS = '0xCE5E5d9cF100D9F6519BEA90345D408bB14eB5B5';

const adiTestnet = defineChain({
  id: 99999,
  name: 'ADI Testnet',
  nativeCurrency: { name: 'ADI', symbol: 'ADI', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.ab.testnet.adifoundation.ai'] } },
  testnet: true
});

// ComputeRouter V3 - simple, no USDC dependency, agent-based job tracking
const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ComputeRouter {
    struct Job {
        uint256 id;
        address user;
        bytes32 detailsHash;
        bytes32 routingHash;
        address provider;
        uint256 amount;
        bool isTracked;
        uint256 createdAt;
        uint256 routedAt;
    }

    mapping(uint256 => Job) private jobs;
    uint256 public jobCount;
    address public agent;

    event JobSubmitted(uint256 indexed jobId, address indexed user, bytes32 detailsHash, bool isTracked);
    event RoutingDecision(uint256 indexed jobId, address indexed provider, uint256 amount, bytes32 routingHash);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    modifier onlyAgent() {
        require(msg.sender == agent, "ComputeRouter: caller is not the agent");
        _;
    }

    constructor(address _agent) {
        require(_agent != address(0), "ComputeRouter: agent cannot be zero address");
        agent = _agent;
    }

    // Open to all - any address can submit a job
    function submitJob(address _user, bytes32 _detailsHash, bool _isTracked) external returns (uint256) {
        jobCount++;
        uint256 jobId = jobCount;
        address storedUser = _isTracked ? _user : address(0);
        jobs[jobId] = Job({
            id: jobId,
            user: storedUser,
            detailsHash: _detailsHash,
            routingHash: bytes32(0),
            provider: address(0),
            amount: 0,
            isTracked: _isTracked,
            createdAt: block.timestamp,
            routedAt: 0
        });
        emit JobSubmitted(jobId, storedUser, _detailsHash, _isTracked);
        return jobId;
    }

    function recordRoutingDecision(uint256 _jobId, address _provider, uint256 _amount, bytes32 _routingHash) external onlyAgent {
        require(_jobId > 0 && _jobId <= jobCount, "ComputeRouter: job does not exist");
        require(jobs[_jobId].routedAt == 0, "ComputeRouter: job already routed");
        require(_provider != address(0), "ComputeRouter: provider cannot be zero address");
        require(_routingHash != bytes32(0), "ComputeRouter: routing hash cannot be zero");
        Job storage job = jobs[_jobId];
        job.provider = _provider;
        job.amount = _amount;
        job.routingHash = _routingHash;
        job.routedAt = block.timestamp;
        emit RoutingDecision(_jobId, _provider, _amount, _routingHash);
    }

    function getJob(uint256 _jobId) external view returns (Job memory) {
        require(_jobId > 0 && _jobId <= jobCount, "ComputeRouter: job does not exist");
        return jobs[_jobId];
    }

    function updateAgent(address _newAgent) external onlyAgent {
        require(_newAgent != address(0), "ComputeRouter: new agent cannot be zero address");
        address oldAgent = agent;
        agent = _newAgent;
        emit AgentUpdated(oldAgent, _newAgent);
    }

    function setInitialAgent(address _agent) external {
        require(agent == address(0), "ComputeRouter: agent already set");
        require(_agent != address(0), "ComputeRouter: agent cannot be zero address");
        agent = _agent;
    }
}
`;

async function main() {
  console.log('Compiling ComputeRouter...');
  
  const input = {
    language: 'Solidity',
    sources: { 'ComputeRouter.sol': { content: CONTRACT_SOURCE } },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:', errors);
      process.exit(1);
    }
  }

  const contract = output.contracts['ComputeRouter.sol']['ComputeRouter'];
  const abi = contract.abi;
  const bytecode = '0x' + contract.evm.bytecode.object;
  
  console.log('✅ Compiled successfully');
  console.log('Bytecode length:', bytecode.length);

  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log('Deploying from:', account.address);

  const walletClient = createWalletClient({ account, chain: adiTestnet, transport: http() });
  const publicClient = createPublicClient({ chain: adiTestnet, transport: http() });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Balance:', (Number(balance) / 1e18).toFixed(6), 'ADI');

  if (balance === 0n) {
    console.error('ERROR: No ADI tokens. Fund the wallet first.');
    process.exit(1);
  }

  console.log('\nDeploying contract with agent:', AGENT_ADDRESS);
  
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [AGENT_ADDRESS],
  });

  console.log('Deploy tx:', hash);
  console.log('Waiting for confirmation...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  if (receipt.status === 'reverted') {
    console.error('Deployment reverted!');
    process.exit(1);
  }

  console.log('\n✅ ComputeRouter deployed!');
  console.log('Contract address:', receipt.contractAddress);
  console.log('Block:', receipt.blockNumber.toString());
  console.log('Explorer:', `https://explorer.ab.testnet.adifoundation.ai/address/${receipt.contractAddress}`);
  console.log('\n📝 Update this line in offchain/src/lib/contracts/compute-router.ts:');
  console.log(`export const COMPUTE_ROUTER_ADDRESS = '${receipt.contractAddress}' as \`0x\$\{string\}\``);
  
  // Save ABI for reference
  fs.writeFileSync('ComputeRouter-deployed.json', JSON.stringify({ 
    address: receipt.contractAddress,
    abi,
    deployedAt: new Date().toISOString()
  }, null, 2));
  console.log('\nSaved deployment info to ComputeRouter-deployed.json');
}

main().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});

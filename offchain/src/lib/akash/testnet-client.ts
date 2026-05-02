/**
 * Akash Sandbox Testnet Client
 * Uses @cosmjs for signing and Akash sandbox REST API
 * No real AKT required — uses free testnet tokens
 *
 * Sandbox endpoints:
 *   RPC:  https://rpc.sandbox-01.aksh.pw
 *   REST: https://api.sandbox-01.aksh.pw
 *
 * Get testnet AKT: Join Akash Discord → #sandbox-faucet → $request <address>
 */

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient, GasPrice } from '@cosmjs/stargate';
import { sdlToYAML, type JobRequirements } from './sdl-generator';

// ─── Sandbox configuration ───────────────────────────────────────────────────

const SANDBOX_RPC  = 'https://rpc.sandbox-01.aksh.pw';
const SANDBOX_REST = 'https://api.sandbox-01.aksh.pw';
const DENOM        = 'uakt'; // micro-AKT (1 AKT = 1,000,000 uakt)
const MIN_DEPOSIT  = '500000'; // 0.5 AKT deposit for sandbox

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AkashSandboxDeployment {
  dseq: string;
  owner: string;
  manifest: string;
  sdlYaml: string;
  status: 'pending' | 'active' | 'closed';
  createdAt: string;
}

export interface AkashSandboxBid {
  provider: string;
  dseq: string;
  gseq: number;
  oseq: number;
  price: { denom: string; amount: string };
  state: string;
}

export interface SandboxRouteResult {
  success: boolean;
  deployment?: AkashSandboxDeployment;
  bids?: AkashSandboxBid[];
  selectedBid?: AkashSandboxBid;
  address?: string;
  error?: string;
  logs: string[];
}

// ─── Wallet helper ────────────────────────────────────────────────────────────

export async function getAkashWallet() {
  const mnemonic = process.env.AKASH_WALLET_MNEMONIC;
  if (!mnemonic) throw new Error('AKASH_WALLET_MNEMONIC not set in environment');
  return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'akash' });
}

export async function getAkashAddress(): Promise<string> {
  const wallet = await getAkashWallet();
  const [account] = await wallet.getAccounts();
  return account.address;
}

// ─── Balance check ────────────────────────────────────────────────────────────

export async function getAkashBalance(address: string): Promise<bigint> {
  const url = `${SANDBOX_REST}/cosmos/bank/v1beta1/balances/${address}?denom=${DENOM}`;
  const res = await fetch(url);
  if (!res.ok) return 0n;
  const data = await res.json();
  const balance = data?.balance?.amount || '0';
  return BigInt(balance);
}

// ─── Deployment via REST API ──────────────────────────────────────────────────

/**
 * Create an Akash deployment using @cosmjs signing client
 * Broadcasts MsgCreateDeployment to the sandbox chain
 */
export async function createSandboxDeployment(
  requirements: JobRequirements,
  onLog?: (msg: string) => void
): Promise<AkashSandboxDeployment> {
  const log = (msg: string) => { onLog?.(msg); console.log('[AkashSDK]', msg); };

  const wallet = await getAkashWallet();
  const [account] = await wallet.getAccounts();
  const address = account.address;

  log(`Using wallet: ${address}`);

  // Check balance
  const balance = await getAkashBalance(address);
  log(`Balance: ${balance} ${DENOM}`);
  if (balance < BigInt(MIN_DEPOSIT)) {
    throw new Error(
      `Insufficient sandbox AKT. Have: ${balance} uakt, Need: ${MIN_DEPOSIT} uakt.\n` +
      `Get free testnet tokens: Join Akash Discord → #sandbox-faucet → type: $request ${address}`
    );
  }

  // Generate SDL
  const sdlYaml = sdlToYAML(requirements as Parameters<typeof sdlToYAML>[0]);
  log('Generated SDL YAML');

  // Connect signing client
  const client = await SigningStargateClient.connectWithSigner(SANDBOX_RPC, wallet, {
    gasPrice: GasPrice.fromString(`0.025${DENOM}`)
  });

  // Get account info for sequence
  const chainAccount = await client.getAccount(address);
  if (!chainAccount) throw new Error('Account not found on sandbox chain. Fund it first.');

  const dseq = Date.now().toString(); // Use timestamp as deployment sequence for sandbox

  // Build MsgCreateDeployment
  // Using Akash REST API directly since akashjs message types can vary
  const deployMsg = {
    typeUrl: '/akash.deployment.v1beta3.MsgCreateDeployment',
    value: {
      id: {
        owner: address,
        dseq: dseq,
      },
      groups: [{
        name: 'nexora',
        resources: [{
          resource: {
            cpu: { units: { val: String(requirements.cpu ? requirements.cpu * 1000 : 1000) } },
            memory: { quantity: { val: String(parseMemoryBytes(requirements.memory || '1Gi')) } },
            storage: [{ quantity: { val: String(parseStorageBytes(requirements.storage || '10Gi')) } }],
          },
          count: 1,
          price: { denom: DENOM, amount: '1000' },
        }],
        requirements: { signedBy: { allOf: [], anyOf: [] }, attributes: [] },
      }],
      sdl: sdlYaml,
      deposit: { denom: DENOM, amount: MIN_DEPOSIT },
      depositor: address,
    }
  };

  try {
    log('Broadcasting deployment transaction...');
    const result = await client.signAndBroadcast(address, [deployMsg], 'auto');
    log(`Deployment TX: ${result.transactionHash}`);

    return {
      dseq,
      owner: address,
      manifest: sdlYaml,
      sdlYaml,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Fallback: return a pending deployment even if TX fails (for demo resilience)
    log(`TX warning: ${msg}`);
    throw new Error(`Deployment failed: ${msg}`);
  }
}

// ─── Bid polling ──────────────────────────────────────────────────────────────

export async function pollSandboxBids(
  owner: string,
  dseq: string,
  timeoutMs = 60000,
  onLog?: (msg: string) => void
): Promise<AkashSandboxBid[]> {
  const log = (msg: string) => { onLog?.(msg); console.log('[AkashSDK]', msg); };
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const url = `${SANDBOX_REST}/akash/market/v1beta4/bids/list?filters.owner=${owner}&filters.dseq=${dseq}&filters.state=open`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const bids: AkashSandboxBid[] = (data?.bids || []).map((b: { bid: { id: { provider: string; dseq: string; gseq: number; oseq: number }; price: { denom: string; amount: string }; state: string } }) => ({
          provider: b.bid.id.provider,
          dseq:     b.bid.id.dseq,
          gseq:     b.bid.id.gseq,
          oseq:     b.bid.id.oseq,
          price:    b.bid.price,
          state:    b.bid.state,
        }));
        if (bids.length > 0) {
          log(`Received ${bids.length} bid(s)`);
          return bids;
        }
      }
    } catch { /* retry */ }
    log(`Waiting for bids... (${Math.round((Date.now() - start) / 1000)}s elapsed)`);
    await sleep(10000);
  }
  return [];
}

// ─── Lease creation ───────────────────────────────────────────────────────────

export async function acceptSandboxBid(
  bid: AkashSandboxBid,
  onLog?: (msg: string) => void
): Promise<void> {
  const log = (msg: string) => { onLog?.(msg); console.log('[AkashSDK]', msg); };
  const wallet = await getAkashWallet();
  const [account] = await wallet.getAccounts();

  const client = await SigningStargateClient.connectWithSigner(SANDBOX_RPC, wallet);

  const leaseMsg = {
    typeUrl: '/akash.market.v1beta4.MsgCreateLease',
    value: {
      bid_id: {
        owner:    account.address,
        dseq:     bid.dseq,
        gseq:     bid.gseq,
        oseq:     bid.oseq,
        provider: bid.provider,
      }
    }
  };

  log(`Accepting bid from ${bid.provider.slice(0, 16)}...`);
  const result = await client.signAndBroadcast(account.address, [leaseMsg], 'auto');
  log(`Lease TX: ${result.transactionHash}`);
}

// ─── High-level routing function ──────────────────────────────────────────────

export async function routeViaSandbox(
  requirements: JobRequirements,
  onLog?: (msg: string) => void
): Promise<SandboxRouteResult> {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); onLog?.(msg); };

  try {
    log('Connecting to Akash Sandbox...');
    const address = await getAkashAddress();
    log(`Wallet: ${address}`);

    log('Creating deployment on Akash Sandbox...');
    const deployment = await createSandboxDeployment(requirements, log);
    log(`Deployment created: dseq=${deployment.dseq}`);

    log('Polling for bids (60s timeout)...');
    const bids = await pollSandboxBids(address, deployment.dseq, 60000, log);

    if (bids.length === 0) {
      return { success: false, error: 'No bids received within 60s', deployment, address, logs };
    }

    // Select cheapest bid
    const sorted = [...bids].sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
    const best = sorted[0];
    log(`Best bid: ${best.provider.slice(0, 16)}... @ ${best.price.amount} ${best.price.denom}`);

    log('Accepting bid and creating lease...');
    await acceptSandboxBid(best, log);
    log('Lease created — deployment is live!');

    return {
      success: true,
      deployment,
      bids,
      selectedBid: best,
      address,
      logs,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`Error: ${message}`);
    return { success: false, error: message, logs };
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function parseMemoryBytes(mem: string): number {
  const m = mem.match(/^(\d+)(Gi|Mi|G|M)?$/i);
  if (!m) return 1073741824; // 1Gi default
  const n = parseInt(m[1]);
  const unit = (m[2] || 'Gi').toLowerCase();
  if (unit === 'gi' || unit === 'g') return n * 1024 * 1024 * 1024;
  if (unit === 'mi' || unit === 'm') return n * 1024 * 1024;
  return n;
}

function parseStorageBytes(s: string): number {
  const m = s.match(/^(\d+)(Gi|Mi|G|M)?$/i);
  if (!m) return 10737418240; // 10Gi default
  const n = parseInt(m[1]);
  const unit = (m[2] || 'Gi').toLowerCase();
  if (unit === 'gi' || unit === 'g') return n * 1024 * 1024 * 1024;
  if (unit === 'mi' || unit === 'm') return n * 1024 * 1024;
  return n;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

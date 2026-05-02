# Nexora Smart Contracts

Solidity smart contracts for the Nexora compute orchestration platform. Handles job submission, routing decisions, and USDC escrow settlement.

## Contracts

| Contract | Description |
|---|---|
| `ComputeRouter.sol` | Job submission and routing decision recording |
| `USDCEscrow.sol` | USDC payment escrow with deposit, release, and refund |
| `TestnetUSDC.sol` | Mock USDC token for testnet development |

## Setup

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Deploy

```bash
npx hardhat ignition deploy ./ignition/modules/ComputeRouter.ts --network testnet
```

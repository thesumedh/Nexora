<p align="center">
  <img src="offchain/public/nexora_logo.png" alt="Nexora" width="400" />
</p>

<h1 align="center">Nexora — AI-Powered Compute Orchestration</h1>

<p align="center">
  <strong>Intelligent GPU workload routing · Multi-provider marketplace · Visual workflow automation</strong>
</p>

<p align="center">
  <a href="https://github.com/thesumedh/Nexora"><img src="https://img.shields.io/badge/GitHub-Nexora-181717?logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Gemini_AI-Agent-9333ea?logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Solidity-0.8-363636?logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
</p>

<p align="center">
  <img src="offchain/public/screenshot_landing.png" alt="Nexora Landing Page" width="700" />
</p>

---

## 🎯 The Problem

The global GPU compute market is **fragmented and inefficient**:

| Pain Point | Impact |
|---|---|
| **Fragmented Markets** | Pricing across Akash, Render, Lambda, io.net is inconsistent and impossible to compare at scale |
| **No Intelligent Routing** | Manual provider selection wastes 40%+ on suboptimal pricing |
| **Settlement Risk** | No transparent escrow or audit trail — trust is assumed, not verified |
| **Complex Workflows** | Zero automation for recurring compute tasks and deployment pipelines |

> Enterprise teams sit on **millions of dollars of idle H100s and A100s** while developers globally struggle to access affordable compute.

## 💡 The Solution

**Nexora** is an AI-powered compute orchestration platform that acts as an **intelligent broker** between compute demand and supply. Think of it as **"Kayak for GPU compute"** — powered by AI.

```
┌──────────────────────────────────────────────────────────────────┐
│  User: "I need 4x A100 GPUs for training a LLaMA model"        │
│                          ↓                                       │
│  🤖 AI Agent: Analyzes requirements → Queries providers          │
│                          ↓                                       │
│  📊 Comparison: Akash ($2.10/hr) vs io.net ($2.85/hr)           │
│                          ↓                                       │
│  🚀 Auto-Deploy: Best provider selected, SDL generated, live    │
│                          ↓                                       │
│  🔒 Settlement: USDC escrow with full audit trail               │
└──────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Describe your workload** in natural language (e.g., *"Deploy a PyTorch training job with 2x RTX 4090"*)
2. **AI Agent analyzes** your requirements — GPU type, memory, budget, region, compliance
3. **Automatic routing** to the best provider with real-time pricing comparison
4. **One-click deployment** with SDL manifest generation and container orchestration
5. **Secure settlement** via smart contract escrow with full audit trail

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Routing Agent** | Gemini 2.5-powered multi-step agent pipeline: analyze → compare → route → deploy. Uses Google ADK with forced tool-calling for deterministic execution |
| 📊 **Real-Time GPU Dashboard** | Live GPU pricing, availability, utilization metrics, and provider health across 7+ networks |
| 🔄 **Visual Workflow Builder** | Drag-and-drop automation pipelines with React Flow — chain triggers, logic, providers, and settlement nodes |
| 🏠 **Host Compute** | List your own GPU machines with region tagging, compliance controls, and availability scheduling |
| 🔒 **Smart Contract Escrow** | Solidity USDC escrow with auto-release on service completion and refund capability |
| 📋 **Immutable Audit Trail** | Full deployment history with on-chain transaction links and 0G Storage for reasoning logs |
| 🌐 **Multi-Provider Support** | Akash, Render, io.net, Spheron, Aethir, Nosana, Hyperspace, Gensyn — 137 normalized providers |
| 🐳 **Smart Docker Resolution** | Auto-resolves workload descriptions to optimal Docker images (PyTorch, TensorFlow, NGINX, PostgreSQL, etc.) |

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Next.js 16 Frontend"]
        LP["Landing Page"] --> DB["Dashboard"]
        DB --> AG["AI Agent Chat"]
        DB --> WF["Workflow Builder"]
        DB --> HP["Host Compute"]
        DB --> PR["Provider Explorer"]
        DB --> AL["Audit Log"]
    end

    subgraph Agent["🤖 AI Agent Layer (Google ADK)"]
        AG --> GEM["Gemini 2.5 Flash"]
        GEM --> |"Phase 1"| CP["compare_providers Tool"]
        GEM --> |"Phase 2"| RA["route_to_akash Tool"]
        GEM --> |"Phase 3"| LG["log_reasoning_to_0g Tool"]
        CP --> |"Score & Rank"| RA
    end

    subgraph Data["📊 Data Layer"]
        CP --> AF["Akash Fetcher (Live API)"]
        CP --> DF["Provider Database (137 nodes)"]
        RA --> SDL["SDL Generator"]
        SDL --> |"Manifest"| AK["Akash Network"]
    end

    subgraph Chain["🔗 Settlement Layer"]
        RA --> CR["ComputeRouter.sol"]
        CR --> ESC["USDCEscrow.sol"]
        ESC --> |"Release/Refund"| USDC["USDC Token"]
        LG --> ZG["0G Storage (DA)"]
    end

    style Client fill:#1e1b4b,stroke:#6366f1,color:#e0e7ff
    style Agent fill:#1e1b4b,stroke:#a855f7,color:#e0e7ff
    style Data fill:#1e1b4b,stroke:#06b6d4,color:#e0e7ff
    style Chain fill:#1e1b4b,stroke:#10b981,color:#e0e7ff
```

### Agent Pipeline Deep Dive

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as /api/route-job
    participant ADK as Google ADK Agent
    participant AK as Akash API

    U->>F: "Deploy PyTorch with 2x A100"
    F->>API: POST {description, requirements}
    API->>ADK: Create routing agent (Gemini 2.5)

    Note over ADK: Phase 1: Provider Comparison
    ADK->>AK: Fetch live providers
    AK-->>ADK: Provider list + pricing
    ADK->>ADK: Score & rank providers

    Note over ADK: Phase 2: Deployment
    ADK->>ADK: Generate SDL manifest
    ADK->>AK: Create deployment
    AK-->>ADK: Deployment ID + URIs

    ADK-->>API: Result + thinking steps
    API-->>F: Stream response
    F-->>U: Show result with deploy button
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript | App Router, Server Components, streaming |
| **Styling** | Tailwind CSS v4, OKLCH Color Space | Dark-first cyberpunk theme with design tokens |
| **UI** | shadcn/ui (27 components), Framer Motion | Radix Primitives, micro-animations |
| **State** | Zustand, TanStack Query | Client-side + server-side state management |
| **AI** | Google ADK, Gemini 2.5 Flash | Multi-step agentic pipeline with forced tool calling |
| **Orchestration** | React Flow | Visual workflow canvas with custom node types |
| **Web3** | wagmi v3, viem, MetaMask | Wallet connection, contract interactions |
| **Contracts** | Solidity 0.8.28, Hardhat, OpenZeppelin | USDC escrow, job routing, access control |
| **Storage** | 0G Storage | Immutable reasoning log data availability |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **MetaMask** browser extension *(optional — for on-chain features)*
- **Google AI Studio API Key** *(required for AI agent)*

### 1. Clone & Install

```bash
git clone https://github.com/thesumedh/Nexora.git
cd Nexora/offchain
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required — Get yours at: https://aistudio.google.com/app/apikey
GOOGLE_AI_STUDIO_API_KEY=your_api_key_here

# Optional — For on-chain settlement
AGENT_PRIVATE_KEY=0x...
```

### 3. Launch

```bash
npm run dev
# → http://localhost:3000
```

### 4. Smart Contracts (Optional)

```bash
cd ../hardhat
npm install
npx hardhat compile
npx hardhat test
```

---

## 📁 Project Structure

```
Nexora/
├── offchain/                     # Next.js 16 Application
│   ├── src/
│   │   ├── app/                  # App Router (25 routes)
│   │   │   ├── page.tsx          # ✨ Landing page with animations
│   │   │   ├── dashboard/        # 📊 Real-time GPU dashboard
│   │   │   ├── agent/            # 🤖 AI chat + deploy interface
│   │   │   ├── workflow/         # 🔄 Visual workflow builder
│   │   │   ├── providers/        # 🌐 Provider marketplace
│   │   │   ├── host/             # 🏠 Host compute listing
│   │   │   ├── audit/            # 📋 Deployment audit log
│   │   │   ├── verify-agent/     # 🧪 Agent router demo
│   │   │   └── api/              # 9 API endpoints
│   │   ├── components/           # 50+ React components
│   │   │   ├── ui/               # shadcn/ui (27 primitives)
│   │   │   ├── layout/           # AppShell, Sidebar, Header
│   │   │   ├── agent/            # DeployModal, PreflightChecklist
│   │   │   ├── workflow/         # Canvas, CustomNodes, ConfigPanel
│   │   │   └── host/             # FleetDashboard, ListingForm
│   │   ├── lib/
│   │   │   ├── agent/            # Google ADK agent + 4 tools
│   │   │   ├── akash/            # SDL manifest generator
│   │   │   ├── providers/        # Multi-provider fetchers
│   │   │   ├── contracts/        # ABI + contract helpers
│   │   │   └── 0g/               # 0G Storage client
│   │   ├── hooks/                # 4 custom hooks
│   │   └── context/              # MarketplaceContext
│   └── public/                   # Static assets + logo
│
└── hardhat/                      # Solidity Smart Contracts
    ├── contracts/
    │   ├── ComputeRouter.sol     # Job submission & routing decisions
    │   ├── USDCEscrow.sol        # USDC escrow (deposit/release/refund)
    │   └── TestnetUSDC.sol       # Mock ERC-20 for testing
    ├── ignition/                 # Hardhat Ignition deploy modules
    └── test/                     # Contract test suite
```

---

## 🔑 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/route-job` | POST | AI agent routing pipeline (main endpoint) |
| `/api/providers` | GET | Fetch all normalized providers |
| `/api/compare-providers` | POST | Compare provider pricing |
| `/api/akash` | GET | Live Akash network data |
| `/api/deployments` | POST | Create Akash deployment |
| `/api/deployments/[id]` | GET | Deployment status |
| `/api/deployments/[id]/bids` | GET | Deployment bids |
| `/api/deployments/[id]/logs` | GET | Container logs |
| `/api/escrow` | POST | Smart contract escrow operations |
| `/api/agent-chat` | POST | Streaming AI chat interface |
| `/api/agent/payment` | POST | Agent payment processing |
| `/api/job-count` | GET | On-chain job counter |

---

## 🧪 Running Tests

```bash
# Frontend build verification
cd offchain && npm run build

# Smart contract tests
cd hardhat && npx hardhat test

# Type checking
cd offchain && npx tsc --noEmit
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for the future of compute infrastructure</strong>
</p>

<p align="center">
  <a href="https://github.com/thesumedh/Nexora">⭐ Star on GitHub</a> ·
  <a href="https://github.com/thesumedh/Nexora/issues">🐛 Report Bug</a> ·
  <a href="https://github.com/thesumedh/Nexora/issues">💡 Request Feature</a>
</p>

'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import { SparklesCore } from "@/components/ui/sparkles"
import { Wallet, ArrowRight, Cpu, Bot, GitBranch, Shield } from "lucide-react"
import { motion } from "framer-motion"

const LETTERS = ["N", "e", "x", "o", "r", "a"]

const FEATURES = [
  { icon: Bot, label: "AI Routing Agent", desc: "Gemini-powered intelligent compute broker" },
  { icon: Cpu, label: "GPU Marketplace", desc: "Compare providers across Akash, Render & more" },
  { icon: GitBranch, label: "Workflow Builder", desc: "Visual automation pipelines for compute jobs" },
  { icon: Shield, label: "Secure Settlement", desc: "Escrow-backed payments with full audit trail" },
]

export default function LandingPage() {
  const router = useRouter()
  const { isConnected, isConnecting, connect } = useWallet()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  React.useEffect(() => {
    if (isConnected) router.push("/dashboard")
  }, [isConnected, router])

  const handleConnect = async () => {
    try { await connect() } catch { /* user rejected */ }
  }

  const handleLaunch = () => {
    router.push("/dashboard")
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-black flex flex-col items-center justify-center">

      {/* ── Connect Wallet — top right ── */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <button
          onClick={handleConnect}
          disabled={!mounted || isConnecting}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting…" : isConnected ? "Connected" : "Connect Wallet"}
        </button>
      </div>

      {/* ── Centered content ── */}
      <div className="relative z-20 flex flex-col items-center max-w-4xl mx-auto px-6">
        {/* Animated Logo */}
        <motion.h1
          className="text-7xl md:text-8xl lg:text-9xl font-bold text-center text-white select-none tracking-tight flex"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {LETTERS.map((letter, i) => (
            <motion.span
              key={i}
              className="nexora-gradient-text"
              variants={{
                hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>

        {/* Sparkles strip */}
        <div className="w-[52rem] h-40 relative -mt-2">
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px w-1/4" />

          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />

          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(420px_210px_at_top,transparent_20%,white)]" />
        </div>

        {/* Tagline */}
        <motion.p
          className="text-lg md:text-xl text-white/60 text-center -mt-8 mb-8 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          AI-powered compute orchestration. Route GPU workloads to the best providers, automatically.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex items-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <button
            onClick={handleLaunch}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-100"
          >
            Launch Console
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={handleConnect}
            disabled={!mounted || isConnecting || isConnected}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wallet className="h-4 w-4" />
            {isConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 1.0 } } }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.label}
              className="group relative flex flex-col items-center text-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-5 backdrop-blur-sm transition-all hover:border-white/15 hover:bg-white/[0.04]"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10 text-purple-400 group-hover:text-cyan-400 transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white/80">{feature.label}</span>
              <span className="text-[10px] text-white/40 leading-tight">{feature.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

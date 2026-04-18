"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = login(email.trim(), password);
    if (!success) {
      setHasError(true);
      return;
    }
    setHasError(false);
    const user = useAuthStore.getState().currentUser;
    if (user?.role === "admin") {
      router.push("/admin");
      return;
    }
    router.push("/user");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090B] px-6">
      <div className="mesh-blob one left-10 top-10 h-80 w-80 bg-indigo-600/40" />
      <div className="mesh-blob two right-20 top-20 h-72 w-72 bg-purple-500/40" />
      <div className="mesh-blob three bottom-20 left-20 h-96 w-96 bg-blue-500/40" />
      <div className="mesh-blob four bottom-10 right-10 h-72 w-72 bg-indigo-400/40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <motion.div
          animate={hasError ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
            <span className="font-heading">LeadPilot</span>
            <span className="font-heading text-indigo-400">AI</span>
            <span className="pulse-dot h-2 w-2 rounded-full bg-indigo-500" />
          </div>
          <p className="mt-3 text-center text-sm text-zinc-400">
            Your AI-powered command center for leads that convert.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm text-zinc-300">
              <span>Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@leadpilot.ai"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </label>
            <label className="block space-y-2 text-sm text-zinc-300">
              <span>Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </label>

            {hasError ? (
              <p className="text-sm text-red-400">Invalid email or password</p>
            ) : (
              <p className="text-sm text-transparent">.</p>
            )}

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-sm font-semibold text-white transition hover:brightness-110 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Sign In
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-zinc-500">
            Demo credentials: admin@leadpilot.ai / admin123 or rahul@leadpilot.ai
            / user123
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

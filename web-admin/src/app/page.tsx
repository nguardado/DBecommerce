"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  const { wallet, connect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (wallet) {
      router.push("/companies");
    }
  }, [wallet, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[90vh] p-8">
      <div className="w-full max-w-md bg-zinc-900 border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Web Admin</h1>
        <p className="text-gray-400 mb-8 text-sm">Conecta tu cuenta administrativa de MetaMask para gestionar tus empresas y catálogo.</p>
        
        <button
          onClick={connect}
          className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5" /> Conectar Billetera <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </main>
  );
}

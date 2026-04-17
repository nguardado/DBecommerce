"use client";
import React, { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import PurchaseFlow from "@/components/PurchaseFlow";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-24">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">
              Euro<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Token</span> Fiat Gateway.
            </h1>
            <p className="text-gray-400 text-lg">Adquiere stablecoins fácilmente usando tu tarjeta de crédito.</p>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 h-full flex flex-col gap-8">
            <WalletConnect onConnected={setWalletAddress} />
            
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm uppercase text-gray-500 font-bold mb-4">Información del Exchange</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Tasa Fija</span>
                  <strong className="text-white">1 EUR = 1 EURT</strong>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Red</span>
                  <strong className="text-white">Local (Anvil)</strong>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Poder de Compra</span>
                  <strong className="text-emerald-400">Inmediato</strong>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-8">
            {!walletAddress ? (
              <div className="h-full min-h-[400px] border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center p-8 bg-zinc-900/50 backdrop-blur-sm">
                <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Conecta tu Wallet para comenzar</h3>
                <p className="text-gray-500 text-center max-w-md">Por seguridad, requerimos vincular tu cuenta de MetaMask antes de poder procesar la compra o mostrar el portal de pagos.</p>
              </div>
            ) : (
              <PurchaseFlow walletAddress={walletAddress} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

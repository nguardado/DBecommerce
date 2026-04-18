"use client";
import "./globals.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LogIn, Receipt, Store } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { wallet, connect } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <html lang="es">
      <body className="min-h-screen pb-20 bg-zinc-950 text-slate-100 font-sans antialiased">
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div onClick={() => router.push("/")} className="font-black text-xl flex items-center gap-2 cursor-pointer text-white">
              <Store className="text-violet-500" /> DBecommerce
            </div>

            <div className="flex items-center gap-6">
              {wallet ? (
                <>
                  <button onClick={() => router.push("/orders")} className={`text-sm font-bold flex items-center gap-2 ${pathname.includes("/orders") ? "text-violet-400" : "text-gray-400 hover:text-white"}`}>
                    <Receipt className="w-4 h-4" /> Mis Pedidos
                  </button>
                  <button onClick={() => router.push("/cart")} className={`text-sm font-bold flex items-center gap-2 ${pathname.includes("/cart") ? "text-violet-400" : "text-gray-400 hover:text-white"}`}>
                    <ShoppingCart className="w-4 h-4" /> Carrito
                  </button>
                  <div className="hidden md:block bg-zinc-800 text-xs px-3 py-1.5 rounded-full font-mono text-gray-300">
                    {wallet.substring(0, 6)}...{wallet.substring(38)}
                  </div>
                </>
              ) : (
                <button onClick={connect} className="bg-violet-600 hover:bg-violet-500 transition px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Conectar Wallet
                </button>
              )}
            </div>
          </div>
        </nav>
        <main className="pt-24 max-w-6xl mx-auto px-6">
          {children}
        </main>
      </body>
    </html>
  );
}

"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { ShieldCheck, ArrowRight, Wallet, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const EUROTOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  // Temporary workaround: since we don't have ecommerce contract yet, we allow a direct transfer fallback
  "function transfer(address to, uint256 amount) external returns (bool)",
];

const ECOMMERCE_ABI = [
  "function processPayment(string invoiceId, uint256 amount) external"
];

export default function PaymentGateway() {
  const searchParams = useSearchParams();
  
  // Extraemos parámetros de redirección
  const merchantAddress = searchParams.get("merchant_address") || "";
  const amountStr = searchParams.get("amount") || "0";
  const invoice = searchParams.get("invoice") || "Unknown";
  const redirectUrl = searchParams.get("redirect") || "";
  
  const amountToCharge = parseFloat(amountStr);

  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState(0);
  const [status, setStatus] = useState<"IDLE" | "AUTHORIZING" | "PROCESSING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  const connect = async () => {
    setErrorMsg("");
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          await fetchBalance(accounts[0], provider);
        }
      } catch (e: any) {
        setErrorMsg("Error conectando MetaMask: " + e.message);
      }
    } else {
      setErrorMsg("Instala MetaMask en tu navegador.");
    }
  };

  const fetchBalance = async (address: string, provider: ethers.BrowserProvider) => {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS!;
      if (!contractAddress) return;
      const contract = new ethers.Contract(contractAddress, EUROTOKEN_ABI, provider);
      const balStr = await contract.balanceOf(address);
      const dec = await contract.decimals();
      setBalance(Number(ethers.formatUnits(balStr, dec)));
    } catch(e) {
      console.log(e);
    }
  };

  const executePayment = async () => {
    if (balance < amountToCharge) {
      setErrorMsg("Saldo Insuficiente en EURT.");
      return;
    }
    
    setStatus("AUTHORIZING");
    setErrorMsg("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      
      const euroContractAddress = process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS!;
      const ecommerceContractAddress = process.env.NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS;

      const euroContract = new ethers.Contract(euroContractAddress, EUROTOKEN_ABI, signer);
      const amountParsed = ethers.parseUnits(amountToCharge.toString(), 6);

      // --- ESTRATEGIA DE DEGRADACIÓN AGRADABLE (MOCK DEL CONTRATO DE ECOMMERCE) ---
      // Como no tenemos el contrato Sc-ecommerce todavía según las instrucciones, haremos una comprobación.
      // Si recibimos "0x000...", hacemos un `transfer` p2p directo al merchant_address simulando el pago con éxito.
      // Si tuvieramos el SC de Ecommerce haríamos approve() + processPayment()
      if (!ecommerceContractAddress || ecommerceContractAddress === "0x0000000000000000000000000000000000000000") {
         console.warn("MOCK: No Ecommerce Contract detectado. Ejecutando Transferencia directa (Fallback P2P).");
         const tx = await euroContract.transfer(merchantAddress, amountParsed);
         setStatus("PROCESSING");
         await tx.wait();
         setStatus("SUCCESS");
      } else {
         // --- LOGICA REQUERIDA REAL ---
         // 1. Delegar permisos (Approve)
         const txApprove = await euroContract.approve(ecommerceContractAddress, amountParsed);
         setStatus("PROCESSING");
         await txApprove.wait();

         // 2. Procesar pago en el SC
         const ecommerceContract = new ethers.Contract(ecommerceContractAddress, ECOMMERCE_ABI, signer);
         const txProcess = await ecommerceContract.processPayment(invoice, amountParsed);
         await txProcess.wait();
         
         setStatus("SUCCESS");
      }

      // 3. Manejo de redirección (Simulado o Real si pasan url válida)
      if (redirectUrl) {
         setTimeout(() => {
            window.location.href = redirectUrl;
         }, 3000);
      }

    } catch (e: any) {
      console.error(e);
      setErrorMsg("La transacción falló o fue rechazada en la extensión.");
      setStatus("ERROR");
    }
  };

  if (!merchantAddress || amountToCharge <= 0) {
    return <div className="p-8 text-center bg-zinc-900 border border-white/10 rounded-3xl text-red-300"><b>Error:</b> Faltan parámetros en la URL o son inválidos. <br/> (merchant_address, amount)</div>;
  }

  return (
    <div className="bg-zinc-900/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.05)] rounded-3xl p-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
               <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Pasarela EURT</h2>
               <p className="text-xs text-gray-400 tracking-wider">PAGO DECENTRALIZADO SECURE</p>
            </div>
        </div>

        {/* Invoice Area */}
        <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Detalles del Cargo a procesar</h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Comercio ID</span>
                    <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded text-gray-300 max-w-[140px] truncate" title={merchantAddress}>{merchantAddress}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">ID Factura</span>
                    <span className="font-bold text-white">{invoice}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-dashed border-white/10 flex justify-between items-end">
                    <span className="text-gray-400 font-medium">Total a Pagar</span>
                    <span className="text-3xl font-black text-emerald-400">{amountToCharge.toFixed(2)} <span className="text-sm text-emerald-500">EURT</span></span>
                </div>
            </div>
        </div>

        {/* Wallet State */}
        {!wallet ? (
            <button onClick={connect} className="w-full bg-white hover:bg-gray-200 text-black active:scale-[0.98] transition-all font-bold py-4 rounded-xl flex justify-center items-center gap-3">
                <Wallet className="w-5 h-5 border border-black/20 rounded-sm" />
                Conectar Billetera Web3
            </button>
        ) : (
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Balance de tu Billetera</span>
                        <span className="font-black text-lg text-white">{balance.toFixed(2)} <span className="text-sm font-normal text-gray-400">EURT</span></span>
                    </div>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3 mt-4">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-200 leading-snug">
                         {errorMsg}
                         {errorMsg.includes("Insuficiente") && (
                            <a href="http://localhost:3000" target="_blank" className="font-bold underline text-red-400 block mt-2 hover:text-white">Comprar más EURT en el Gateway</a>
                         )}
                        </p>
                    </div>
                )}

                {status === "SUCCESS" ? (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-xl flex flex-col items-center text-center mt-4">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                        <h4 className="font-bold text-white mb-1">Pago Autorizado</h4>
                        <p className="text-sm text-emerald-200/70">
                           {redirectUrl ? "Redirigiendo de vuelta al comercio en 3s..." : "Transacción transmitida exitosamente."}
                        </p>
                    </div>
                ) : (
                    <button 
                        onClick={executePayment} 
                        disabled={status === "AUTHORIZING" || status === "PROCESSING"}
                        className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)] font-bold py-4 rounded-xl flex justify-center items-center gap-3"
                    >
                        {status === "IDLE" || status === "ERROR" ? (
                           <>Firmar y Pagar <ArrowRight className="w-5 h-5" /></>
                        ) : (
                           <><RefreshCw className="w-5 h-5 animate-spin" /> Procesando Bloque...</>
                        )}
                    </button>
                )}
            </div>
        )}
    </div>
  );
}

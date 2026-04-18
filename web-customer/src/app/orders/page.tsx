"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ECOMMERCE_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { useWallet } from "@/hooks/useWallet";
import { Loader, CheckCircle, Clock, Receipt } from "lucide-react";

export default function OrdersPage() {
  const { wallet, connect } = useWallet();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(wallet) fetchOrders();
  }, [wallet]);

  const fetchOrders = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, provider);
      
      const res = await contract.getInvoicesByCustomer(wallet);
      // Las mostramos invertidas para tener la mas reciente arriba
      setInvoices([...res].reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if(!wallet) return (
     <div className="py-20 text-center flex flex-col items-center">
         <Receipt className="w-16 h-16 text-gray-500 mb-6" />
         <h2 className="text-2xl font-bold mb-4">Inicia sesión</h2>
         <button onClick={connect} className="bg-violet-600 px-6 py-2 rounded">Conectar MetaMask</button>
     </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><Receipt/> Mis Invoices</h1>
      
      {loading ? (
        <div className="py-20 flex justify-center"><Loader className="animate-spin w-10 h-10 opacity-50" /></div>
      ) : invoices.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-gray-500">
           No tienes historial de compras en la Blockchain.
        </div>
      ) : (
        <div className="space-y-4">
           {invoices.map((inv, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                   <div>
                      <div className="text-xs text-violet-400 font-mono mb-1">FACTURA #{inv.invoiceId.toString()} | COMERCIO ID: {inv.companyId.toString()}</div>
                      <div className="text-sm text-gray-400">Fecha Tx: <span className="font-mono text-gray-300">{new Date(Number(inv.timestamp) * 1000).toLocaleString()}</span></div>
                   </div>
                   <div className="flex items-center gap-6">
                       <div className="text-right">
                          <div className="text-xl font-black text-white">{(Number(inv.totalAmount) / 1e6).toFixed(2)} EURT</div>
                       </div>
                       {inv.isPaid ? (
                           <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 min-w-[140px] justify-center">
                               <CheckCircle className="w-4 h-4"/> PAGADA
                           </div>
                       ) : (
                           <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 min-w-[140px] justify-center">
                               <Clock className="w-4 h-4"/> PENDIENTE
                           </div>
                       )}
                   </div>
                </div>
           ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ECOMMERCE_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { Loader, CheckCircle, Clock } from "lucide-react";

import { use } from "react";

export default function InvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [companyId]);

  const fetchInvoices = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, provider);
      
      const foundInvoices = [];
      // Intentamos leer facturas usando un lookahead greedy por simplicidad O(N)
      // En produccion se usarian The Graph o indexers off-chain.
      for(let i=0; i<10; i++) {
        try {
          const inv = await contract.getInvoice(i);
          if (inv.companyId.toString() === companyId) {
             foundInvoices.push(inv);
          }
        } catch(e) {
          // Si hace revert (no existe), salimos del loop
          break;
        }
      }
      setInvoices(foundInvoices);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Historial de Facturación</h2>
      
      {loading ? (
           <div className="py-20 text-center"><Loader className="animate-spin w-8 h-8 opacity-50 mx-auto" /></div>
      ) : (
          <div className="space-y-4">
             {invoices.length === 0 && <div className="py-10 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center text-gray-500">No hay facturas registradas en esta empresa.</div>}
             {invoices.map((inv, idx) => (
                 <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                       <div className="text-xs text-blue-400 font-mono mb-1">FACTURA #{inv.invoiceId.toString()}</div>
                       <div className="text-sm text-gray-400">Cliente: <span className="font-mono text-gray-300">{inv.customerAddress}</span></div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                           <div className="text-xl font-black text-white">{(Number(inv.totalAmount) / 1e6).toFixed(2)} EURT</div>
                        </div>
                        {inv.isPaid ? (
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                <CheckCircle className="w-4 h-4"/> PAGADA
                            </div>
                        ) : (
                            <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
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

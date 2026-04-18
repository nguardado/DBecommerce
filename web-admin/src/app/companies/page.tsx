"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { ECOMMERCE_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { Building2, Plus, ArrowRight, Loader } from "lucide-react";

export default function CompaniesPage() {
  const { wallet, connect } = useWallet();
  const router = useRouter();
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for New Company
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [txPending, setTxPending] = useState(false);

  useEffect(() => {
    if (wallet) {
      fetchCompanies();
    }
  }, [wallet]);

  const fetchCompanies = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, provider);
      
      const data = await contract.getAllCompanies();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const registerCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxPending(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, signer);

      const tx = await contract.registerCompany(name, taxId);
      await tx.wait();

      // Reset & reload
      setName("");
      setTaxId("");
      setShowForm(false);
      fetchCompanies();
    } catch (e) {
      console.error(e);
      alert("Error registrando la compañía.");
    } finally {
      setTxPending(false);
    }
  };

  if (!wallet) {
    return (
      <div className="p-10 text-center">
        <p>Wallet no conectada.</p>
        <button onClick={connect} className="mt-4 px-4 py-2 bg-blue-600 rounded">Conectar</button>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 pt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Building2 className="text-blue-500" /> Mis Empresas</h1>
          <p className="text-sm text-gray-400 mt-1">Conectado como: {wallet.substring(0,6)}...{wallet.substring(38)}</p>
        </div>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar Nueva
        </button>
      </div>

      {showForm && (
        <form onSubmit={registerCompany} className="bg-blue-950/20 border border-blue-500/30 p-6 rounded-2xl mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Registro Legal</h2>
          <div className="flex gap-4">
             <input required type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="flex-1 bg-black/50 border border-zinc-800 rounded-lg px-4 focus:border-blue-500 outline-none" />
             <input required type="text" placeholder="ID Fiscal (Tax ID)" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-1/3 bg-black/50 border border-zinc-800 rounded-lg px-4 focus:border-blue-500 outline-none" />
             <button disabled={txPending} type="submit" className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 font-bold rounded-lg transition flex justify-center items-center">
                {txPending ? <Loader className="animate-spin w-5 h-5" /> : "Crear DApp"}
             </button>
          </div>
        </form>
      )}

      {loading ? (
         <div className="py-20 text-center text-gray-500"><Loader className="animate-spin w-8 h-8 opacity-50 mx-auto mb-4" /> Sincronizando bloque...</div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.filter(c => c.companyAddress.toLowerCase() === wallet.toLowerCase()).length === 0 && (
                <div className="col-span-full py-10 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                    No tienes comercios registrados en esta wallet.
                </div>
            )}
            
            {companies.filter(c => c.companyAddress.toLowerCase() === wallet.toLowerCase()).map(c => (
                <div key={c.companyId.toString()} onClick={() => router.push(`/company/${c.companyId}`)} className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 p-6 rounded-2xl cursor-pointer transition group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                        <Building2 className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">{c.name}</h3>
                        <p className="text-xs text-blue-400 mb-6 font-mono tracking-widest">{c.taxId}</p>
                        
                        <div className="flex justify-between items-end border-t border-zinc-800 pt-4">
                            <span className="text-xs text-gray-500">ID: #{c.companyId.toString()}</span>
                            <div className="flex items-center text-sm font-bold text-gray-300 group-hover:text-blue-400 transition gap-1">
                                Gestionar <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      )}
    </main>
  );
}

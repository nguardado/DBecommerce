"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ECOMMERCE_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { useWallet } from "@/hooks/useWallet";
import { Loader, ShoppingCart, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { wallet, connect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, provider);
      
      const data = await contract.getAllProducts();
      // Filtrar prods activos y con stock
      setProducts(data.filter((p: any) => p.isActive && Number(p.stock) > 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (companyId: string, productId: string) => {
    if (!wallet) {
      connect();
      return;
    }
    
    const idKey = `${companyId}-${productId}`;
    setAddingToCart(idKey);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, signer);
      
      // On-Chain: anade 1 unidad al carrito de esta compania
      const tx = await contract.addToCart(companyId, productId, 1);
      await tx.wait();
      
      router.push("/cart");
    } catch (e: any) {
      alert("Error al añadir al carrito: " + e.message);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center max-w-2xl mx-auto">
         <h1 className="text-4xl font-black mb-4">Descubre Productos On-Chain</h1>
         <p className="text-gray-400">Paga de forma descentralizada y segura sin intermediarios fiat utilizando nuestro EuroToken estandarizado.</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader className="animate-spin w-10 h-10 opacity-50" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
             <div key={p.productId.toString()} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-violet-500/50 transition flex flex-col group">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={p.ipfsImageHash} alt="NFT" className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                 <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                     </div>
                     <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{p.description}</p>
                     
                     <div className="flex justify-between items-end border-t border-zinc-800 pt-4 mt-auto">
                         <div>
                            <div className="text-xs text-gray-500 mb-1">Company #{p.companyId.toString()}</div>
                            <div className="text-xl font-black text-white">{(Number(p.price) / 1e6).toFixed(2)} EURT</div>
                         </div>
                         <button 
                            disabled={addingToCart === `${p.companyId}-${p.productId}`}
                            onClick={() => handleAddToCart(p.companyId.toString(), p.productId.toString())}
                            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 w-10 h-10 rounded-full flex justify-center items-center transition"
                         >
                            {addingToCart === `${p.companyId}-${p.productId}` ? <Loader className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" /> }
                         </button>
                     </div>
                 </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

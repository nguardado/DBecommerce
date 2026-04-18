"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ECOMMERCE_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { Plus, Loader, Image as ImageIcon } from "lucide-react";

import { use } from "react";

export default function ProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imgUrl, setImgUrl] = useState("https://picsum.photos/400/400?random=1"); // Mock IPFS param
  const [txPending, setTxPending] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [companyId]);

  const fetchProducts = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, provider);
      
      const data = await contract.getAllProducts();
      // Filtrar prods que pertenezcan a esta compania unicamente
      setProducts(data.filter((p: any) => p.companyId.toString() === companyId));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxPending(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, signer);

      const priceParsed = ethers.parseUnits(price, 6); // 6 decimales dictados por rules
      
      const tx = await contract.addProduct(
         Number(companyId), 
         name, 
         desc, 
         priceParsed, 
         Number(stock), 
         imgUrl
      );
      await tx.wait();

      setShowAdd(false);
      fetchProducts();
    } catch (e: any) {
      alert("Fallo creando el producto: " + e.message);
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Catálogo de Productos</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
           <Plus className="w-4 h-4"/> Añadir Referencia
        </button>
      </div>

      {showAdd && (
        <form onSubmit={createProduct} className="bg-blue-950/20 border border-blue-500/30 p-6 rounded-2xl mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs text-blue-300 font-bold uppercase mb-1 block">Nombre</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
             </div>
             <div>
                <label className="text-xs text-blue-300 font-bold uppercase mb-1 block">Mock URL Imagen (IPFS falso)</label>
                <input required type="text" value={imgUrl} onChange={e=>setImgUrl(e.target.value)} className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm text-gray-400 focus:border-blue-500 outline-none" />
             </div>
             <div className="col-span-2">
                <label className="text-xs text-blue-300 font-bold uppercase mb-1 block">Descripción breve</label>
                <textarea required value={desc} onChange={e=>setDesc(e.target.value)} rows={2} className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
             </div>
             <div>
                <label className="text-xs text-emerald-300 font-bold uppercase mb-1 block">Precio (En Euros)</label>
                <input required type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none" />
             </div>
             <div>
                <label className="text-xs text-amber-300 font-bold uppercase mb-1 block">Stock Base (# Unidades)</label>
                <input required type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm focus:border-amber-500 outline-none" />
             </div>
          </div>
          
          <div className="flex justify-end border-t border-blue-500/20 pt-4 mt-4">
             <button disabled={txPending} type="submit" className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-8 py-3 rounded-xl font-bold flex items-center justify-center min-w-[200px]">
                {txPending ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : "Publicar Contrato"}
             </button>
          </div>
        </form>
      )}

      {loading ? (
          <div className="py-20 text-center"><Loader className="animate-spin w-8 h-8 opacity-50 mx-auto" /></div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {products.length === 0 && <div className="col-span-full py-10 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center text-gray-500">No hay productos en esta empresa.</div>}
             {products.map(p => (
                 <div key={p.productId.toString()} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={p.ipfsImageHash} alt="NFT" className="w-full h-48 object-cover group-hover:scale-105 transition" />
                     <div className="p-5">
                         <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg">{p.name}</h3>
                             <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">{(Number(p.price) / 1e6).toFixed(2)} EURT</span>
                         </div>
                         <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.description}</p>
                         <div className="flex justify-between items-center text-xs font-mono">
                             <span className="text-gray-500">PID: {p.productId.toString()}</span>
                             <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Stock: {p.stock.toString()}</span>
                         </div>
                     </div>
                 </div>
             ))}
          </div>
      )}
    </div>
  );
}

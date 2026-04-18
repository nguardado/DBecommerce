"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ECOMMERCE_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { useWallet } from "@/hooks/useWallet";
import { Loader, ShoppingCart, Trash2, CreditCard } from "lucide-react";

export default function CartPage() {
  const { wallet, connect } = useWallet();
  const [cartGroups, setCartGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  useEffect(() => {
    if(wallet) fetchCarts();
  }, [wallet]);

  const fetchCarts = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, provider);
      
      const groups = [];
      // Dado que el Carrito en nuestro Blockchain indexa por Empresa, iteramos las empresas activas
      const activeComps = await contract.getAllCompanies();
      const allProds = await contract.getAllProducts();

      for (let c of activeComps) {
         try {
            const cartData = await contract.getCart(c.companyId, wallet);
            if (cartData && cartData.items.length > 0) {
               // Enriquecer items con info real
               const enrichedItems = cartData.items.map((i: any) => {
                  const pMatch = allProds.find((px: any) => px.productId.toString() === i.productId.toString());
                  return {
                     ...i,
                     name: pMatch?.name,
                     price: pMatch?.price,
                     image: pMatch?.ipfsImageHash
                  };
               });
               
               // Calcular Subtotal
               const subtotal = enrichedItems.reduce((acc: number, curr: any) => {
                   return acc + (Number(curr.price) * Number(curr.quantity));
               }, 0);

               groups.push({
                  companyId: c.companyId.toString(),
                  companyName: c.name,
                  companyAddress: c.companyAddress,
                  items: enrichedItems,
                  subtotal
               });
            }
         } catch(e) {
           // Si tira revert es que no hay carrito en esa empresa o no iniciada
         }
      }
      setCartGroups(groups);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async (companyId: string) => {
      try {
         const provider = new ethers.BrowserProvider(window.ethereum as any);
         const signer = await provider.getSigner();
         const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, signer);
         const tx = await contract.clearCart(companyId);
         await tx.wait();
         fetchCarts();
      } catch(e: any) {
         alert("Error limpiando carrito.");
      }
  };

  const handleCheckout = async (group: any) => {
      setCheckingOutId(group.companyId);
      try {
         const provider = new ethers.BrowserProvider(window.ethereum as any);
         const signer = await provider.getSigner();
         const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, signer);
         
         // 1. Crear Invoice Ochain
         const tx = await contract.createInvoice(group.companyId);
         const receipt = await tx.wait();

         // Interceptar logs si quisieramos el InvoiceID automatizado
         // Por simplicidad en MVP, asumiremos que se redirige o se ve en History.
         // Enviaremos a Pasarela de PAGO para cobrarse (Gateway -> Puerto 6002)
         // Pasando los parametros solicitados en la Parte 3 y asumiendo un mockID de temporal de 999 
         // o pasándole todo al gateway para q pague su deuda general!

         const amountStr = (group.subtotal / 1e6).toFixed(2);
         const redirectUri = encodeURIComponent(`http://localhost:6004/orders`);
         
         window.location.href = `http://localhost:6002/?merchant_address=${group.companyAddress}&amount=${amountStr}&invoice=${group.companyId}-${Date.now()}&redirect=${redirectUri}`;

      } catch(e: any) {
         alert("Cancelado o Fallo en Checkout");
      } finally {
         setCheckingOutId(null);
      }
  };

  if(!wallet) return (
     <div className="py-20 text-center flex flex-col items-center">
         <ShoppingCart className="w-16 h-16 text-gray-500 mb-6" />
         <h2 className="text-2xl font-bold mb-4">Inicia sesión</h2>
         <button onClick={connect} className="bg-violet-600 px-6 py-2 rounded">Conectar MetaMask</button>
     </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><ShoppingCart/> Carrito de Compras</h1>
      
      {loading ? (
        <div className="py-20 flex justify-center"><Loader className="animate-spin w-10 h-10 opacity-50" /></div>
      ) : cartGroups.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-gray-500">
           Tu carrito descentralizado está vacío.
        </div>
      ) : (
        <div className="space-y-8">
           {cartGroups.map(g => (
               <div key={g.companyId} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                   <div className="bg-black/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                      <span className="font-bold text-violet-400">Comprando en: {g.companyName}</span>
                      <button onClick={() => handleClear(g.companyId)} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300">
                         <Trash2 className="w-3 h-3"/> Limpiar Compañía
                      </button>
                   </div>
                   
                   <div className="p-6 space-y-4">
                      {g.items.map((it: any, idx: number) => (
                          <div key={idx} className="flex gap-4 items-center border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={it.image} alt="pic" className="w-16 h-16 rounded object-cover" />
                             <div className="flex-1">
                                <h4 className="font-bold">{it.name}</h4>
                                <div className="text-sm text-gray-400">x{it.quantity.toString()} unidad(es)</div>
                             </div>
                             <div className="font-black">{( (Number(it.price) * Number(it.quantity)) / 1e6 ).toFixed(2)} EURT</div>
                          </div>
                      ))}
                   </div>
                   
                   <div className="p-6 bg-zinc-950 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-1">Subtotal</div>
                          <div className="text-2xl font-black text-white">{(g.subtotal / 1e6).toFixed(2)} EURT</div>
                      </div>
                      
                      <button 
                         disabled={checkingOutId === g.companyId}
                         onClick={() => handleCheckout(g)}
                         className="w-full md:w-auto bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                         {checkingOutId === g.companyId ? <Loader className="animate-spin w-5 h-5"/> : <><CreditCard className="w-5 h-5"/> Generar Invoice y Pagar</>}
                      </button>
                   </div>
               </div>
           ))}
        </div>
      )}
    </div>
  );
}

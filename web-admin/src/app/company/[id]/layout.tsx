"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, PackageSearch, Receipt, Users, ArrowLeft } from "lucide-react";
import { ethers } from "ethers";
import { ECOMMERCE_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { useWallet } from "@/hooks/useWallet";

import { use } from "react";

export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { wallet } = useWallet();
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if(!wallet) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ECOMMERCE_ABI, provider);
        const c = await contract.getCompany(companyId);
        setCompany(c);
      } catch (e) {
         console.error(e);
      }
    }
    load();
  }, [wallet, params.id]);

  const tabs = [
    { name: "Resumen", path: `/company/${companyId}`, icon: Building2 },
    { name: "Productos", path: `/company/${companyId}/products`, icon: PackageSearch },
    { name: "Invoices", path: `/company/${companyId}/invoices`, icon: Receipt },
    { name: "Clientes", path: `/company/${companyId}/customers`, icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 pt-10">
      <button onClick={() => router.push("/companies")} className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Volver a Empresas
      </button>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-t-3xl border-b-0">
        <h1 className="text-3xl font-black text-white">{company ? company.name : "Cargando..."}</h1>
        <p className="text-gray-500 font-mono mt-2">ID: {companyId}</p>
      </div>

      <div className="bg-zinc-900 border-x border-zinc-800 px-8 flex gap-8">
        {tabs.map((t) => (
          <button
            key={t.name}
            onClick={() => router.push(t.path)}
            className={`pb-4 flex items-center gap-2 font-bold text-sm border-b-2 transition ${
              pathname === t.path ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.name}
          </button>
        ))}
      </div>

      <div className="bg-black border border-zinc-800 p-8 rounded-b-3xl">
        {children}
      </div>
    </div>
  );
}

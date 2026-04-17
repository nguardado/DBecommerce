import { Suspense } from "react";
import PaymentGateway from "@/components/PaymentGateway";

export default function GatewayPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative">
      <div className="w-full max-w-[420px] relative z-10">
        <Suspense fallback={
            <div className="text-emerald-400 text-center py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                Cargando pasarela cifrada...
            </div>
        }>
          <PaymentGateway />
        </Suspense>
      </div>

      {/* Decorative BG */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>
    </main>
  );
}

"use client";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Usamos la variable de entorno de Nextjs para la key publica
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PurchaseFlowProps {
  walletAddress: string;
}

// Subcomponente encargado unicamente del UI una vez que tenemos la intención de pago (Elements context)
function CheckoutForm({ amount, clientSecret, paymentIntentId, walletAddress, resetForm }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<"IDLE" | "SUCCESS">("IDLE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      // 1. Confirmar pago en front de Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', 
      });

      if (error) {
        setErrorMessage(error.message || "Surgió un error al procesar tu tarjeta.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // 2. Disparar el proceso de mint interno usando nuestra API (ya que no dependeremos el CLI de localhost/webhook para más simplicidad)
        const res = await fetch("/api/mint-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            amount: amount,
            walletAddress: walletAddress
          }),
        });

        const data = await res.json();
        
        if (res.ok && data.success) {
          setStatus("SUCCESS");
        } else {
          setErrorMessage(data.error || "Fallo en el minteo de tus tokens.");
        }
      }
    } catch (err: any) {
      setErrorMessage("Excepción al intentar el pago.");
    }

    setIsProcessing(false);
  };

  if (status === "SUCCESS") {
    return (
      <div className="text-center p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
        <h3 className="text-2xl font-bold text-emerald-400 mb-2">¡Pago Exitoso!</h3>
        <p className="text-gray-300">Tus {amount} EURT han sido minteados y transferidos a tu blockchain wallet.</p>
        <button onClick={resetForm} className="mt-6 text-white bg-black hover:bg-gray-800 px-6 py-2 rounded-full text-sm font-semibold transition border border-white/10">Realizar otra compra</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      {errorMessage && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20">{errorMessage}</p>}
      <button
        disabled={isProcessing || !stripe || !elements}
        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition duration-200 mt-2 shadow-lg shadow-blue-600/30 w-full"
      >
        {isProcessing ? "Procesando Transacción y Blockchain..." : `Pagar €${amount} EUR`}
      </button>
    </form>
  );
}


// Contenedor principal para decidir la fase
export default function PurchaseFlow({ walletAddress }: PurchaseFlowProps) {
  const [amount, setAmount] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async () => {
    if (amount < 1) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, walletAddress }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setClientSecret("");
    setAmount(0);
  }

  return (
    <div className="p-8 bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-36 bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <h2 className="text-2xl font-bold mb-6 text-white z-10">Comprar EuroTokens (EURT)</h2>
      
      {!clientSecret ? (
        <div className="flex flex-col gap-6 flex-grow justify-center z-10">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Monto a adquirir (en EUR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
              <input
                type="number"
                min="1"
                placeholder="100"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-10 pr-4 text-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <p className="text-gray-500 mt-3 text-sm flex items-center justify-between">
              <span>Equivalente:</span>
              <span className="font-semibold text-emerald-400">= {amount || 0} EURT</span>
            </p>
          </div>
          <button
            onClick={startCheckout}
            disabled={amount < 1 || isLoading}
            className="w-full mt-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 py-4 font-bold rounded-xl transition duration-200"
          >
            {isLoading ? "Generando intención..." : "Continuar a Checkout"}
          </button>
        </div>
      ) : (
        <div className="z-10">
          <button onClick={resetForm} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm">
            &larr; Volver a configurar monto
          </button>
          
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <CheckoutForm 
              amount={amount} 
              clientSecret={clientSecret} 
              paymentIntentId={paymentIntentId}
              walletAddress={walletAddress}
              resetForm={resetForm}
            />
          </Elements>
        </div>
      )}
    </div>
  );
}

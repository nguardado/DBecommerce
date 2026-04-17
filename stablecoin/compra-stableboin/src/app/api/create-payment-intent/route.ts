import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Se instancia Stripe usando el secret de las env variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const { amount, walletAddress } = await req.json();

    if (!amount || !walletAddress) {
      return NextResponse.json({ error: 'Missing amount or wallet' }, { status: 400 });
    }

    // Stripe trabaja en centavos para monedas divisibles (Euros)
    // Entonces 10 EUR => 1000 centavos
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        walletAddress,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

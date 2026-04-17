import { NextResponse } from "next/server";
import { ethers } from "ethers";

// Un ABI minimalista que necesitamos solamente para ejecutar mint()
const abi = ["function mint(address to, uint256 amount) external"];

export async function POST(req: Request) {
  try {
    const { paymentIntentId, amount, walletAddress } = await req.json();

    if (!paymentIntentId || !amount || !walletAddress) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Conectamos a la red RPC local
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS;

    if (!privateKey || !contractAddress) {
      return NextResponse.json({ error: "Server Configuration Error: Missing Keys" }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    // Convertimos la cantidad requerida a una cantidad compatible con los 6 decimales de nuestro smart contract
    const amountToMint = ethers.parseUnits(amount.toString(), 6);

    console.log(`Minting ${amount} EURT to ${walletAddress}...`);
    
    // Enviamos transaccion a blockchain
    const tx = await contract.mint(walletAddress, amountToMint);
    await tx.wait();

    console.log("Tokens minteados. Tx:", tx.hash);

    return NextResponse.json({
      success: true,
      message: "Tokens minted successfully!",
      txHash: tx.hash,
    });
  } catch (error: any) {
    console.error("Error minting tokens:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

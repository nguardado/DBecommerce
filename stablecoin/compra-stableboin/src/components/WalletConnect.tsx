"use client";
import React, { useState } from "react";
import { ethers } from "ethers";

interface Props {
  onConnected: (address: string) => void;
}

const abi = ["function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)"];

export default function WalletConnect({ onConnected }: Props) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const connectWallet = async () => {
    setErrorMsg("");
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          onConnected(accounts[0]);
          await fetchBalance(accounts[0], provider);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Fallo la conexión con MetaMask");
        console.error("Failed to connect", err);
      }
    } else {
      setErrorMsg("Debes instalar la extensión MetaMask en tu navegador.");
    }
  };

  const fetchBalance = async (address: string, provider: ethers.BrowserProvider) => {
    const contractAddress = process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS;
    if (!contractAddress) return;
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const balStr = await contract.balanceOf(address);
      const dec = await contract.decimals();
      const formatted = ethers.formatUnits(balStr, dec);
      setBalance(formatted);
    } catch (e: any) {
      console.error("Error fetching balance:", e);
    }
  };

  return (
    <div className="p-8 bg-black border border-white/10 shadow-2xl rounded-2xl flex flex-col items-center justify-center transform transition hover:scale-[1.01]">
      <div className="mb-4 text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2 text-white">Tu Billetera Web3</h2>
      
      {errorMsg && <p className="text-red-400 text-sm font-semibold mt-2">{errorMsg}</p>}

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="mt-6 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-emerald-500/30 transition duration-200 w-full"
        >
          Conectar MetaMask
        </button>
      ) : (
        <div className="text-center w-full mt-2">
          <p className="text-gray-400 text-xs truncate max-w-[250px] mx-auto bg-white/5 py-1 px-3 rounded-full">{walletAddress}</p>
          <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-6 rounded-2xl mt-6">
            <p className="text-emerald-400/80 text-sm uppercase tracking-wider font-semibold">Balance Disponible</p>
            <p className="text-4xl font-black text-white mt-2">{parseFloat(balance).toLocaleString()} <span className="text-xl text-emerald-300">EURT</span></p>
          </div>
          <button onClick={() => connectWallet()} className="mt-4 text-emerald-400 text-xs hover:underline">
            Actualizar Balance
          </button>
        </div>
      )}
    </div>
  );
}

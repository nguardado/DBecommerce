"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [wallet, setWallet] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const p = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await p.send("eth_requestAccounts", []);
        const signer = await p.getSigner();
        
        setWallet(accounts[0]);
        setProvider(p);
        setSigner(signer);
        
        // Cargar balance de ETH para Gas estimations si se requiere
        const bal = await p.getBalance(accounts[0]);
        setBalance(ethers.formatEther(bal));

      } catch (err) {
        console.error("Error conectando MetaMask", err);
      }
    } else {
      alert("Por favor instala MetaMask");
    }
  };

  return { wallet, provider, signer, balance, connect };
}

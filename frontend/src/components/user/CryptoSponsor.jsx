import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Wallet, Loader2, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xa606b7092Fe091cDAC6F1be0668B689999d75ed7';
const CHAIN_ID = '0x13882'; // Polygon Amoy

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "experimentId",
        "type": "string"
      }
    ],
    "name": "sponsorExperiment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "experimentId",
        "type": "string"
      }
    ],
    "name": "isSponsored",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const NETWORK_CONFIG = {
  chainId: CHAIN_ID,
  chainName: 'Polygon Amoy Testnet',
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};

const CryptoSponsor = ({ experimentId, experimentTitle }) => {
  const [loading, setLoading] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const checkIfSponsored = async () => {
    if (!experimentId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/crypto/sponsored/${experimentId}`
      );
      const data = await response.json();
      if (data.success) {
        setSponsored(data.sponsored);
      }
    } catch (error) {
      console.error('Check sponsorship error:', error);
    }
  };

  React.useEffect(() => {
    checkIfSponsored();
  }, [experimentId]);

  const sponsorWithCrypto = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to sponsor with crypto!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setLoading(true);

      // Switch to Polygon Amoy
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
        } else {
          throw switchError;
        }
      }

      // Connect wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setWalletConnected(true);

      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call sponsorExperiment (no payment needed, just marks as sponsored)
      const tx = await contract.sponsorExperiment(experimentId);
      
      alert('⏳ Transaction sent! Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      setTxHash(tx.hash);
      setSponsored(true);
      
      alert(`✅ Experiment sponsored successfully! TX: ${tx.hash.slice(0, 10)}...`);
      
      // Refresh sponsorship status
      await checkIfSponsored();

    } catch (error) {
      console.error('Sponsorship error:', error);
      if (error.code === 4001) {
        alert('Transaction rejected by user');
      } else {
        alert('Failed to sponsor: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (sponsored) {
    return (
      <Card className="bg-muted/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-foreground" />
              <CardTitle className="text-lg">Crypto Sponsored</CardTitle>
            </div>
            <Badge variant="outline" className="bg-muted text-foreground border-border">
              Active
            </Badge>
          </div>
          <CardDescription>
            This experiment is sponsored on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {txHash && (
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono flex-1 truncate text-foreground">
                  {txHash}
                </code>
                <a
                  href={`https://amoy.polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-foreground" />
          <CardTitle className="text-lg">Blockchain Sponsorship</CardTitle>
        </div>
        <CardDescription>
          Sponsor this experiment on-chain (free on testnet!)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
            <Wallet className="h-4 w-4" />
            Why Sponsor on Blockchain?
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ Transparent & verifiable</li>
            <li>✅ Immutable record of sponsorship</li>
            <li>✅ Participants earn crypto points</li>
            <li>✅ Decentralized tracking</li>
          </ul>
        </div>

        <Button
          onClick={sponsorWithCrypto}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Sponsor with Crypto
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Requires MetaMask & Polygon Amoy testnet
        </p>
      </CardContent>
    </Card>
  );
};

export default CryptoSponsor;
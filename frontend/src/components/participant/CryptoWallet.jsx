import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Wallet, ExternalLink, Copy, CheckCircle2, Loader2, Trophy, Target } from 'lucide-react';

const NETWORK_CONFIG = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};

const CryptoWallet = ({ participantId }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem(`wallet_${participantId}`);
    if (savedWallet) {
      setWalletAddress(savedWallet);
      setConnected(true);
      fetchStats(savedWallet);
    }
  }, [participantId]);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to earn crypto rewards!');
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
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const address = accounts[0];
      setWalletAddress(address);
      setConnected(true);
      
      localStorage.setItem(`wallet_${participantId}`, address);
      
      await fetchStats(address);
      
      alert('✅ Wallet connected! You can now earn points!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (address) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/crypto/stats/${address}`
      );
      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setConnected(false);
    setStats(null);
    localStorage.removeItem(`wallet_${participantId}`);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewOnExplorer = () => {
    window.open(
      `https://amoy.polygonscan.com/address/${walletAddress}`,
      '_blank'
    );
  };

  if (!connected) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Crypto Wallet
          </CardTitle>
          <CardDescription>
            Earn points on the blockchain - fully anonymous!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background/50 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              Why Connect?
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Earn 100 points per experiment</li>
              <li>✅ No personal info needed</li>
              <li>✅ Transparent blockchain tracking</li>
              <li>✅ Future rewards & prizes</li>
            </ul>
          </div>

          <Button 
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Don't have MetaMask? 
            <a 
              href="https://metamask.io/download/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              Install here
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            <CardTitle>Crypto Wallet</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            Connected
          </Badge>
        </div>
        <CardDescription>{NETWORK_CONFIG.chainName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="p-3 bg-background/50 rounded-lg border">
          <p className="text-xs text-muted-foreground mb-1">Your Address</p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono flex-1 truncate">
              {walletAddress}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-7 w-7 p-0"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={viewOnExplorer}
              className="h-7 w-7 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.totalPoints || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Points</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.experimentsCompleted || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-blue-600">
                💡 <strong>Earn 100 points</strong> for each experiment you complete!
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(walletAddress)}
            className="flex-1"
          >
            Refresh Stats
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={disconnectWallet}
            className="flex-1"
          >
            Disconnect
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Using {NETWORK_CONFIG.chainName}
        </p>
      </CardContent>
    </Card>
  );
};

export default CryptoWallet;
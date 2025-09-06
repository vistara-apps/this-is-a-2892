import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import blockchainService from '../services/blockchainService';
import toast from 'react-hot-toast';

const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether USD' },
];

const BalanceChecker = ({ selectedToken, onInsufficientBalance }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address && chainId) {
      fetchBalances();
    }
  }, [address, chainId]);

  const fetchBalances = async () => {
    if (!address || !chainId) return;

    setLoading(true);
    setError(null);
    
    try {
      const newBalances = {};
      
      for (const token of SUPPORTED_TOKENS) {
        try {
          const balance = await blockchainService.getBalance(address, token.symbol, chainId);
          newBalances[token.symbol] = parseFloat(balance);
        } catch (error) {
          console.error(`Failed to fetch ${token.symbol} balance:`, error);
          newBalances[token.symbol] = 0;
        }
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      setError('Failed to fetch balances');
      toast.error('Failed to fetch wallet balances');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance) => {
    if (balance === undefined || balance === null) return '0.00';
    
    if (balance < 0.001) {
      return balance.toExponential(2);
    }
    
    return balance.toFixed(6);
  };

  const getBalanceColor = (token, balance) => {
    if (balance === undefined || balance === null) return 'text-gray-500';
    
    if (token === selectedToken && balance < 0.001) {
      onInsufficientBalance?.(true);
      return 'text-red-600';
    }
    
    onInsufficientBalance?.(false);
    return balance > 0 ? 'text-green-600' : 'text-gray-500';
  };

  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      8453: 'Base',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (!address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Wallet Not Connected</h4>
            <p className="text-xs text-yellow-700">Connect your wallet to view balances</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Wallet Balances</h3>
        </div>
        
        <button
          onClick={fetchBalances}
          disabled={loading}
          className="p-1 text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
          title="Refresh balances"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Network: {getChainName(chainId)}
      </div>

      {error ? (
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchBalances}
            className="text-xs text-primary hover:text-primary/80 mt-1"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {SUPPORTED_TOKENS.map((token) => {
            const balance = balances[token.symbol];
            const isSelected = selectedToken === token.symbol;
            
            return (
              <div
                key={token.symbol}
                className={`flex items-center justify-between p-2 rounded ${
                  isSelected ? 'bg-primary/5 border border-primary/20' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{token.symbol}</p>
                    <p className="text-xs text-gray-500">{token.name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {loading ? (
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className={`text-sm font-medium ${getBalanceColor(token.symbol, balance)}`}>
                      {formatBalance(balance)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedToken && balances[selectedToken] < 0.001 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-700">
            Insufficient {selectedToken} balance for transaction
          </p>
        </div>
      )}
    </div>
  );
};

export default BalanceChecker;

import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Send, Copy, QrCode, DollarSign } from 'lucide-react';
import GasFeeSelector from './GasFeeSelector';
import { usePaymentContext } from '../hooks/usePaymentContext';

const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: null },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6417aFf95A618Aafd95b31B5E81308E' },
  { symbol: 'USDT', name: 'Tether USD', address: '0xB1B5B9b3E5141E6Ec8e7f89D6f8A2b8F4b7A9f8D' },
];

const PaymentForm = ({ activeTab, onTransactionComplete }) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { createSession } = usePaymentContext();
  
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    token: 'ETH',
    gasLevel: 'medium'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendPayment = async () => {
    if (!walletClient || !formData.recipient || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process payment through x402 platform
      await createSession();
      setPaymentCompleted(true);
      
      // Simulate transaction hash (in real implementation, this would come from the actual transaction)
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 40)}`;
      setTransactionHash(mockTxHash);
      
      // Add to transaction history
      const transaction = {
        id: Date.now().toString(),
        type: 'sent',
        amount: formData.amount,
        currency: formData.token,
        recipient: formData.recipient,
        status: 'success',
        timestamp: new Date().toISOString(),
        txHash: mockTxHash
      };
      
      onTransactionComplete(transaction);
      
      // Reset form
      setFormData({
        recipient: '',
        amount: '',
        token: 'ETH',
        gasLevel: 'medium'
      });
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (activeTab === 'receive') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <QrCode className="w-24 h-24 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Share your wallet address to receive payments</p>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm font-mono text-gray-700 truncate">
              {address}
            </span>
            <button
              onClick={() => copyToClipboard(address)}
              className="ml-2 p-2 text-gray-500 hover:text-primary transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Send className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-text mb-2">Payment Sent Successfully!</h3>
          <p className="text-gray-600 mb-4">Your transaction has been processed</p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-medium">{formData.amount} {formData.token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Transaction Hash:</span>
              <span className="text-sm font-mono text-primary">{transactionHash.substring(0, 10)}...</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            setPaymentCompleted(false);
            setTransactionHash('');
          }}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Send Another Payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Select Token
        </label>
        <select
          value={formData.token}
          onChange={(e) => handleInputChange('token', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {SUPPORTED_TOKENS.map(token => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Recipient Address
        </label>
        <input
          type="text"
          value={formData.recipient}
          onChange={(e) => handleInputChange('recipient', e.target.value)}
          placeholder="0x742d35cc6634c0532925a3b8d8ee5e0d3c8cc4b1"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.0"
            step="0.000001"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {formData.token}
          </span>
        </div>
      </div>

      <GasFeeSelector
        selected={formData.gasLevel}
        onSelect={(level) => handleInputChange('gasLevel', level)}
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Transaction Fee</h4>
            <p className="text-xs text-yellow-700">A $0.001 processing fee will be charged for this transaction</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSendPayment}
        disabled={isProcessing || !formData.recipient || !formData.amount}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Send Payment
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentForm;
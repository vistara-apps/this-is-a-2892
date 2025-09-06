import React, { useState } from 'react';
import { useAccount, useWalletClient, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Send, Copy, QrCode, DollarSign, AlertTriangle } from 'lucide-react';
import GasFeeSelector from './GasFeeSelector';
import QRCodeGenerator from './QRCodeGenerator';
import { usePaymentContext } from '../hooks/usePaymentContext';
import blockchainService from '../services/blockchainService';
import toast from 'react-hot-toast';

const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: null },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6417aFf95A618Aafd95b31B5E81308E' },
  { symbol: 'USDT', name: 'Tether USD', address: '0xB1B5B9b3E5141E6Ec8e7f89D6f8A2b8F4b7A9f8D' },
];

const PaymentForm = ({ activeTab, onTransactionComplete, insufficientBalance }) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
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
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [receiveFormData, setReceiveFormData] = useState({
    amount: '',
    token: 'ETH'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Estimate gas when amount or recipient changes
    if ((field === 'amount' || field === 'recipient') && formData.recipient && formData.amount) {
      estimateTransactionGas();
    }
  };

  const handleReceiveInputChange = (field, value) => {
    setReceiveFormData(prev => ({ ...prev, [field]: value }));
  };

  const estimateTransactionGas = async () => {
    if (!address || !formData.recipient || !formData.amount || !walletClient) return;
    
    try {
      const gasEstimate = await blockchainService.estimateGas(
        address,
        formData.recipient,
        formData.amount,
        formData.token,
        chainId
      );
      setEstimatedGas(gasEstimate);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      setEstimatedGas(null);
    }
  };

  const handleSendPayment = async () => {
    if (!walletClient || !formData.recipient || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (insufficientBalance) {
      toast.error('Insufficient balance for this transaction');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process payment through x402 platform first
      await createSession();
      
      // Create wallet client for the transaction
      const walletClientForTx = blockchainService.createWalletClient(chainId, address);
      
      // Send the actual blockchain transaction
      const txHash = await blockchainService.sendTransaction(
        walletClientForTx,
        formData.recipient,
        formData.amount,
        formData.token,
        chainId
      );
      
      setTransactionHash(txHash);
      setPaymentCompleted(true);
      
      toast.success('Transaction submitted successfully!');
      
      // Add to transaction history
      const transaction = {
        id: Date.now().toString(),
        type: 'sent',
        amount: formData.amount,
        currency: formData.token,
        recipient: formData.recipient,
        status: 'pending',
        timestamp: new Date().toISOString(),
        txHash: txHash
      };
      
      onTransactionComplete(transaction);
      
      // Reset form
      setFormData({
        recipient: '',
        amount: '',
        token: 'ETH',
        gasLevel: 'medium'
      });
      setEstimatedGas(null);
      
    } catch (error) {
      console.error('Payment failed:', error);
      
      if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction was rejected');
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (activeTab === 'receive') {
    return (
      <div className="space-y-6">
        {/* Request Amount Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Request Amount (Optional)
            </label>
            <input
              type="number"
              value={receiveFormData.amount}
              onChange={(e) => handleReceiveInputChange('amount', e.target.value)}
              placeholder="0.0"
              step="0.000001"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Token
            </label>
            <select
              value={receiveFormData.token}
              onChange={(e) => handleReceiveInputChange('token', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {SUPPORTED_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QR Code Generator */}
        <QRCodeGenerator 
          address={address}
          amount={receiveFormData.amount}
          token={receiveFormData.token}
          chainId={chainId}
        />
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
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800">Transaction Fees</h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>• Platform fee: $0.001</p>
              {estimatedGas && (
                <p>• Estimated gas: ~{Number(estimatedGas).toLocaleString()} units</p>
              )}
              <p>• Network fees will be calculated by your wallet</p>
            </div>
          </div>
        </div>
      </div>

      {insufficientBalance && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Insufficient Balance</h4>
              <p className="text-xs text-red-700">You don't have enough {formData.token} to complete this transaction</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSendPayment}
        disabled={isProcessing || !formData.recipient || !formData.amount || insufficientBalance}
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

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Copy } from 'lucide-react';

const TransactionHistory = ({ transactions }) => {
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Transaction hash copied!');
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Recent Transactions</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowUpRight className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Recent Transactions</h3>
      
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${tx.type === 'sent' ? 'bg-red-50' : 'bg-green-50'}`}>
                  {tx.type === 'sent' ? (
                    <ArrowUpRight className="w-4 h-4 text-red-600" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-green-600" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-text">
                      {tx.type === 'sent' ? 'Sent' : 'Received'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {tx.type === 'sent' ? `To ${formatAddress(tx.recipient)}` : `From ${formatAddress(tx.sender)}`}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(tx.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-text">
                  {tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.currency}
                </p>
                
                <div className="flex items-center space-x-1 mt-2">
                  <button
                    onClick={() => copyToClipboard(tx.txHash)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy transaction hash"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors">
        View All Transactions
      </button>
    </div>
  );
};

export default TransactionHistory;
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import PaymentForm from './components/PaymentForm';
import TransactionHistory from './components/TransactionHistory';
import BalanceChecker from './components/BalanceChecker';
import { useAccount } from 'wagmi';
import { useTransactionMonitor } from './hooks/useTransactionMonitor';

function App() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('send');
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const transactionMonitor = useTransactionMonitor();
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      type: 'sent',
      amount: '0.05',
      currency: 'ETH',
      recipient: '0x742d35cc6634c0532925a3b8d8ee5e0d3c8cc4b1',
      status: 'success',
      timestamp: new Date().toISOString(),
      txHash: '0x1234567890abcdef...'
    },
    {
      id: '2',
      type: 'received',
      amount: '100',
      currency: 'USDC',
      sender: '0x8ba1f109551bd432803012645hac136c2ce47b88',
      status: 'success',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      txHash: '0xabcdef1234567890...'
    }
  ]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    
    // Monitor real transactions
    if (transaction.txHash && transaction.txHash !== 'mock') {
      transactionMonitor.addTransaction(transaction.txHash, {
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        recipient: transaction.recipient || transaction.sender
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      
      {!isConnected ? (
        <Hero />
      ) : (
        <main className="max-w-5xl mx-auto px-6 py-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-surface rounded-lg shadow-card p-6">
                <div className="flex space-x-1 mb-6">
                  <button
                    onClick={() => setActiveTab('send')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'send'
                        ? 'bg-primary text-white'
                        : 'text-text hover:bg-gray-100'
                    }`}
                  >
                    Send Payment
                  </button>
                  <button
                    onClick={() => setActiveTab('receive')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'receive'
                        ? 'bg-primary text-white'
                        : 'text-text hover:bg-gray-100'
                    }`}
                  >
                    Receive Payment
                  </button>
                </div>
                
                <PaymentForm 
                  activeTab={activeTab} 
                  onTransactionComplete={addTransaction}
                  insufficientBalance={insufficientBalance}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <BalanceChecker 
                selectedToken={activeTab === 'send' ? 'ETH' : null}
                onInsufficientBalance={setInsufficientBalance}
              />
              <TransactionHistory transactions={transactions} />
            </div>
          </div>
        </main>
      )}
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'hsl(220 87% 60%)',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;

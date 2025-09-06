import { useState, useEffect, useCallback } from 'react';
import { useChainId } from 'wagmi';
import blockchainService from '../services/blockchainService';
import toast from 'react-hot-toast';

export function useTransactionMonitor() {
  const chainId = useChainId();
  const [monitoredTransactions, setMonitoredTransactions] = useState(new Map());

  const addTransaction = useCallback((hash, metadata = {}) => {
    const transaction = {
      hash,
      chainId,
      status: 'pending',
      timestamp: Date.now(),
      metadata,
      retryCount: 0
    };

    setMonitoredTransactions(prev => new Map(prev.set(hash, transaction)));
    
    // Start monitoring immediately
    monitorTransaction(hash);
  }, [chainId]);

  const monitorTransaction = useCallback(async (hash) => {
    const maxRetries = 60; // Monitor for up to 10 minutes (60 * 10s intervals)
    let retryCount = 0;

    const checkStatus = async () => {
      try {
        const status = await blockchainService.getTransactionStatus(hash, chainId);
        
        setMonitoredTransactions(prev => {
          const updated = new Map(prev);
          const tx = updated.get(hash);
          if (tx) {
            updated.set(hash, {
              ...tx,
              status: status.status,
              blockNumber: status.blockNumber,
              gasUsed: status.gasUsed,
              effectiveGasPrice: status.effectiveGasPrice,
              retryCount
            });
          }
          return updated;
        });

        if (status.status === 'success') {
          toast.success('Transaction confirmed!', {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => window.open(blockchainService.getExplorerUrl(hash, chainId), '_blank')
            }
          });
          return; // Stop monitoring
        } else if (status.status === 'failed') {
          toast.error('Transaction failed!', {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => window.open(blockchainService.getExplorerUrl(hash, chainId), '_blank')
            }
          });
          return; // Stop monitoring
        } else if (status.status === 'pending' && retryCount < maxRetries) {
          // Continue monitoring
          retryCount++;
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else if (retryCount >= maxRetries) {
          // Timeout - mark as unknown
          setMonitoredTransactions(prev => {
            const updated = new Map(prev);
            const tx = updated.get(hash);
            if (tx) {
              updated.set(hash, {
                ...tx,
                status: 'timeout',
                retryCount
              });
            }
            return updated;
          });
          
          toast.error('Transaction monitoring timeout. Please check manually.', {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => window.open(blockchainService.getExplorerUrl(hash, chainId), '_blank')
            }
          });
        }
      } catch (error) {
        console.error('Error monitoring transaction:', error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkStatus, 15000); // Retry after 15 seconds on error
        } else {
          setMonitoredTransactions(prev => {
            const updated = new Map(prev);
            const tx = updated.get(hash);
            if (tx) {
              updated.set(hash, {
                ...tx,
                status: 'error',
                error: error.message,
                retryCount
              });
            }
            return updated;
          });
          
          toast.error('Error monitoring transaction. Please check manually.', {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => window.open(blockchainService.getExplorerUrl(hash, chainId), '_blank')
            }
          });
        }
      }
    };

    // Start checking
    checkStatus();
  }, [chainId]);

  const removeTransaction = useCallback((hash) => {
    setMonitoredTransactions(prev => {
      const updated = new Map(prev);
      updated.delete(hash);
      return updated;
    });
  }, []);

  const getTransaction = useCallback((hash) => {
    return monitoredTransactions.get(hash);
  }, [monitoredTransactions]);

  const getAllTransactions = useCallback(() => {
    return Array.from(monitoredTransactions.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [monitoredTransactions]);

  const getPendingTransactions = useCallback(() => {
    return Array.from(monitoredTransactions.values())
      .filter(tx => tx.status === 'pending')
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [monitoredTransactions]);

  const clearOldTransactions = useCallback(() => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    setMonitoredTransactions(prev => {
      const updated = new Map();
      for (const [hash, tx] of prev) {
        if (tx.timestamp > oneDayAgo || tx.status === 'pending') {
          updated.set(hash, tx);
        }
      }
      return updated;
    });
  }, []);

  // Clean up old transactions periodically
  useEffect(() => {
    const interval = setInterval(clearOldTransactions, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, [clearOldTransactions]);

  return {
    addTransaction,
    removeTransaction,
    getTransaction,
    getAllTransactions,
    getPendingTransactions,
    monitoredTransactions: Array.from(monitoredTransactions.values())
  };
}

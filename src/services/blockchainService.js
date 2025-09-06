import { parseEther, parseUnits, formatEther, formatUnits } from 'viem';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { base, mainnet, polygon, optimism, arbitrum } from 'viem/chains';

// Token contract addresses for different networks
const TOKEN_ADDRESSES = {
  [base.id]: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
  },
  [mainnet.id]: {
    USDC: '0xA0b86a33E6417aFf95A618Aafd95b31B5E81308E',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  [polygon.id]: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  }
};

// ERC-20 ABI for token transfers
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
];

class BlockchainService {
  constructor() {
    this.publicClients = {};
    this.initializeClients();
  }

  initializeClients() {
    const chains = [base, mainnet, polygon, optimism, arbitrum];
    
    chains.forEach(chain => {
      this.publicClients[chain.id] = createPublicClient({
        chain,
        transport: http()
      });
    });
  }

  getPublicClient(chainId) {
    return this.publicClients[chainId];
  }

  createWalletClient(chainId, account) {
    const chain = this.getChainById(chainId);
    return createWalletClient({
      chain,
      transport: custom(window.ethereum),
      account
    });
  }

  getChainById(chainId) {
    const chains = { 
      [base.id]: base, 
      [mainnet.id]: mainnet, 
      [polygon.id]: polygon, 
      [optimism.id]: optimism, 
      [arbitrum.id]: arbitrum 
    };
    return chains[chainId];
  }

  async getBalance(address, token, chainId) {
    const publicClient = this.getPublicClient(chainId);
    
    if (token === 'ETH') {
      const balance = await publicClient.getBalance({ address });
      return formatEther(balance);
    } else {
      const tokenAddress = TOKEN_ADDRESSES[chainId]?.[token];
      if (!tokenAddress) throw new Error(`Token ${token} not supported on chain ${chainId}`);
      
      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address]
      });
      
      const decimals = await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals'
      });
      
      return formatUnits(balance, decimals);
    }
  }

  async estimateGas(from, to, amount, token, chainId) {
    const publicClient = this.getPublicClient(chainId);
    
    try {
      if (token === 'ETH') {
        const gasEstimate = await publicClient.estimateGas({
          account: from,
          to,
          value: parseEther(amount.toString())
        });
        return gasEstimate;
      } else {
        const tokenAddress = TOKEN_ADDRESSES[chainId]?.[token];
        if (!tokenAddress) throw new Error(`Token ${token} not supported on chain ${chainId}`);
        
        const decimals = await publicClient.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'decimals'
        });
        
        const gasEstimate = await publicClient.estimateContractGas({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [to, parseUnits(amount.toString(), decimals)],
          account: from
        });
        
        return gasEstimate;
      }
    } catch (error) {
      console.error('Gas estimation failed:', error);
      // Return default gas estimates
      return token === 'ETH' ? 21000n : 65000n;
    }
  }

  async sendTransaction(walletClient, to, amount, token, chainId, gasPrice) {
    if (token === 'ETH') {
      return await walletClient.sendTransaction({
        to,
        value: parseEther(amount.toString()),
        gasPrice: gasPrice ? parseEther(gasPrice.toString()) : undefined
      });
    } else {
      const tokenAddress = TOKEN_ADDRESSES[chainId]?.[token];
      if (!tokenAddress) throw new Error(`Token ${token} not supported on chain ${chainId}`);
      
      const publicClient = this.getPublicClient(chainId);
      const decimals = await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals'
      });
      
      return await walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, parseUnits(amount.toString(), decimals)],
        gasPrice: gasPrice ? parseEther(gasPrice.toString()) : undefined
      });
    }
  }

  async waitForTransaction(hash, chainId) {
    const publicClient = this.getPublicClient(chainId);
    return await publicClient.waitForTransactionReceipt({ hash });
  }

  async getTransactionStatus(hash, chainId) {
    const publicClient = this.getPublicClient(chainId);
    
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash });
      return {
        status: receipt.status === 'success' ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice
      };
    } catch (error) {
      // Transaction might still be pending
      try {
        const tx = await publicClient.getTransaction({ hash });
        return {
          status: 'pending',
          blockNumber: tx.blockNumber
        };
      } catch {
        return {
          status: 'not_found'
        };
      }
    }
  }

  getExplorerUrl(hash, chainId) {
    const explorers = {
      [base.id]: 'https://basescan.org/tx/',
      [mainnet.id]: 'https://etherscan.io/tx/',
      [polygon.id]: 'https://polygonscan.com/tx/',
      [optimism.id]: 'https://optimistic.etherscan.io/tx/',
      [arbitrum.id]: 'https://arbiscan.io/tx/'
    };
    
    return `${explorers[chainId] || explorers[mainnet.id]}${hash}`;
  }
}

export default new BlockchainService();

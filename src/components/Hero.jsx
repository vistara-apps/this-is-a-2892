import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <main className="relative max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-text mb-6 leading-tight">
            Make Crypto Payments Easily.
            <span className="block text-primary">Tot</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Send and receive cryptocurrencies for easy peer-to-peer transactions with optimized gas fees and multi-chain support.
          </p>
          
          <div className="mb-12">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="inline-flex items-center bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              )}
            </ConnectButton.Custom>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-surface rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Secure Wallet Integration</h3>
              <p className="text-gray-600 text-sm">
                Connect your existing wallets like MetaMask securely without moving funds.
              </p>
            </div>
            
            <div className="bg-surface rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Gas Fee Optimization</h3>
              <p className="text-gray-600 text-sm">
                Smart recommendations for optimal gas fees based on network conditions.
              </p>
            </div>
            
            <div className="bg-surface rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Multi-Chain Support</h3>
              <p className="text-gray-600 text-sm">
                Send payments across Ethereum, Polygon, Base, and other popular networks.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;

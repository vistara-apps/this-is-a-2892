import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreditCard } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-surface shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">CryptoPay Hub</h1>
              <p className="text-sm text-gray-600">Send and receive crypto payments effortlessly</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm text-text hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="#" className="text-sm text-text hover:text-primary transition-colors">
              Support
            </a>
            <ConnectButton />
          </nav>
          
          <div className="md:hidden">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
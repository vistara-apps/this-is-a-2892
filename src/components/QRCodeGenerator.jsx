import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const QRCodeGenerator = ({ address, amount, token, chainId }) => {
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [address, amount, token, chainId]);

  const generateQRCode = async () => {
    if (!address) return;

    try {
      // Create payment URI following EIP-681 standard
      let paymentUri = `ethereum:${address}`;
      
      const params = new URLSearchParams();
      
      if (amount && parseFloat(amount) > 0) {
        if (token === 'ETH') {
          params.append('value', (parseFloat(amount) * 1e18).toString());
        } else {
          // For ERC-20 tokens, we need the contract address and function call
          const tokenAddresses = {
            'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
            'USDT': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'  // Base USDT
          };
          
          if (tokenAddresses[token]) {
            params.append('contractAddress', tokenAddresses[token]);
            params.append('functionName', 'transfer');
            params.append('argtypes', 'address,uint256');
            params.append('argvalues', `${address},${(parseFloat(amount) * (token === 'USDC' ? 1e6 : 1e6)).toString()}`);
          }
        }
      }
      
      if (chainId && chainId !== 1) {
        params.append('chainId', chainId.toString());
      }
      
      if (params.toString()) {
        paymentUri += `?${params.toString()}`;
      }

      // Generate QR code
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, paymentUri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });

      // Get data URL for sharing
      const dataUrl = canvas.toDataURL();
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `payment-qr-${address.slice(0, 8)}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success('QR code downloaded!');
  };

  const shareQR = async () => {
    if (!navigator.share || !qrDataUrl) {
      toast.error('Sharing not supported on this device');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'payment-qr.png', { type: 'image/png' });

      await navigator.share({
        title: 'Payment QR Code',
        text: `Send ${amount ? `${amount} ${token}` : 'crypto'} to ${address}`,
        files: [file]
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share QR code');
      }
    }
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-white p-4 rounded-lg shadow-sm border inline-block">
          <canvas 
            ref={canvasRef}
            className="block"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        {amount && token && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <p className="text-sm text-gray-600">Requesting</p>
            <p className="text-lg font-semibold text-primary">
              {amount} {token}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address
          </label>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <span className="flex-1 text-sm font-mono text-gray-800 break-all">
              {address}
            </span>
            <button
              onClick={copyAddress}
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              title="Copy address"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </button>
          
          {navigator.share && (
            <button
              onClick={shareQR}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Scan this QR code with any compatible wallet to send payment</p>
        <p className="mt-1">Supports EIP-681 payment standard</p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;

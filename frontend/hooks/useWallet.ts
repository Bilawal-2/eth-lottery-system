import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

const GANACHE_NETWORK_ID = '0x539'; // Changed from '0x1337n' to '0x539' (decimal: 1337)
const GANACHE_NETWORK = {
  chainId: GANACHE_NETWORK_ID,
  chainName: 'Ganache Local',
  nativeCurrency: {  // Changed from nativeToken to nativeCurrency
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['http://127.0.0.1:7545'],
  blockExplorerUrls: [] // Added required empty array
};

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isGanache, setIsGanache] = useState(false);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isContractVerified, setIsContractVerified] = useState(false);

  async function checkNetwork() {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkId(chainId);
      setIsGanache(chainId === GANACHE_NETWORK_ID);
      setNetworkError(null);
    } catch (error) {
      setNetworkError('Failed to detect network');
      console.error('Network detection error:', error);
    }
  }

  async function switchToGanache() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: GANACHE_NETWORK_ID }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [GANACHE_NETWORK],
        });
      }
    }
  }

  async function verifyContract(address: string) {
    if (!provider) return false;
    try {
      const code = await provider.getCode(address);
      console.log('Contract code at', address, ':', code);
      // Update verification check to be less strict
      const isValid = code !== '0x';
      console.log('Contract verification result:', isValid);
      setIsContractVerified(isValid);
      return isValid;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return false;
    }
  }

  // Add useEffect to verify contract when network or provider changes
  useEffect(() => {
    async function verifyCurrentContract() {
      if (provider) {
        const currentAddress = isGanache 
          ? process.env.NEXT_PUBLIC_LOTTERY_ADDRESS_GANACHE 
          : process.env.NEXT_PUBLIC_LOTTERY_ADDRESS;
        
        if (currentAddress) {
          const isValid = await verifyContract(currentAddress);
          setIsContractVerified(isValid);
        }
      }
    }
    verifyCurrentContract();
  }, [provider, isGanache]);

  async function connect(useGanache = false) {
    if (typeof window.ethereum !== 'undefined') {
      try {
        if (useGanache) {
          await switchToGanache();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for network switch
        }
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await checkNetwork();
        setAccount(accounts[0]);
        setProvider(provider);
      } catch (error) {
        console.error('Connection error:', error);
      }
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on('chainChanged', (chainId: string) => {
        setNetworkId(chainId);
        setIsGanache(chainId === GANACHE_NETWORK_ID);
        window.location.reload();
      });
      checkNetwork();
    }
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return { 
    account, 
    provider, 
    connect, 
    isGanache, 
    networkId, 
    networkError,
    isContractVerified 
  };
}

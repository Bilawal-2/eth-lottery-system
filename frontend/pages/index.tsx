import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LotteryABI from '../contracts/Lottery.json';
import { useWallet } from '../hooks/useWallet';
import Snackbar from '../components/Snackbar';

export default function Home() {
  const [lotteryBalance, setLotteryBalance] = useState('0');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, connect, provider, isGanache, networkError, isContractVerified } = useWallet();
  const [isOwner, setIsOwner] = useState(false);
  const [pickingWinner, setPickingWinner] = useState(false);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });
  const [playerCount, setPlayerCount] = useState(0);
  
  const getLotteryAddress = () => {
    return isGanache 
      ? process.env.NEXT_PUBLIC_LOTTERY_ADDRESS_GANACHE 
      : process.env.NEXT_PUBLIC_LOTTERY_ADDRESS;
  };
  
  async function buyTicket() {
    if (!provider || !account) return;
    const currentAddress = getLotteryAddress();
    if (!currentAddress) {
      console.error('No contract address for current network');
      return;
    }
    
    setLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(currentAddress, LotteryABI, signer);
      const price = await contract.ticketPrice(); // Changed from getEntranceFee
      const tx = await contract.buyTicket({ value: price }); // Changed from enter
      await tx.wait();
      await updateLotteryInfo();
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setError(`Failed to buy ticket: ${error.message}`);
    }
    setLoading(false);
  }

  // Add function to check if connected account is owner
  async function checkOwner() {
    if (!provider || !account) return;
    const currentAddress = getLotteryAddress();
    if (!currentAddress) return;

    try {
      const contract = new ethers.Contract(currentAddress, LotteryABI, provider);
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('Failed to check owner:', error);
    }
  }

  // Add function to show snackbar
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({ isVisible: true, message, type });
  };

  // Update announceWinner function
  async function announceWinner() {
    if (!provider || !account || !isOwner) return;
    const currentAddress = getLotteryAddress();
    if (!currentAddress) return;
    
    setPickingWinner(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(currentAddress, LotteryABI, signer);
      
      // Listen for WinnerPicked event
      contract.once("WinnerPicked", (winner: string, amount: ethers.BigNumber) => {
        const winAmount = ethers.utils.formatEther(amount);
        showSnackbar(
          `Winner picked! Address: ${winner.slice(0, 6)}...${winner.slice(-4)} won ${winAmount} ETH!`,
          'success'
        );
      });

      const tx = await contract.pickWinner();
      await tx.wait();
      await updateLotteryInfo();
    } catch (error: any) {
      console.error('Failed to pick winner:', error);
      showSnackbar(`Failed to pick winner: ${error.message}`, 'error');
    }
    setPickingWinner(false);
  }

  // Add effect to check contract verification status
  useEffect(() => {
    async function checkContractStatus() {
      if (provider) {
        const currentAddress = getLotteryAddress();
        if (currentAddress) {
          const code = await provider.getCode(currentAddress);
          const isValid = code !== '0x';
          console.log('Contract status in index:', {
            address: currentAddress,
            code: code,
            isValid: isValid,
            isContractVerified: isContractVerified
          });
          if (!isValid) {
            setError('Contract not found at the specified address');
          }
        }
      }
    }
    checkContractStatus();
  }, [provider, isGanache, isContractVerified]);

  async function updateLotteryInfo() {
    if (!provider) return;
    setError(null);
    const currentAddress = getLotteryAddress();
    
    if (!currentAddress) {
      setError('No contract address for current network');
      return;
    }

    try {
      const code = await provider.getCode(currentAddress);
      if (code === '0x') {
        setError(`No contract found at address ${currentAddress}`);
        return;
      }

      const contract = new ethers.Contract(currentAddress, LotteryABI, provider);
      try {
        const [price, balance, isOpen, players] = await Promise.all([
          contract.ticketPrice(),
          provider.getBalance(currentAddress),
          contract.lotteryOpen(),
          contract.getPlayers()
        ]);
        
        setTicketPrice(price.toString());
        setLotteryBalance(ethers.utils.formatEther(balance));
        setPlayerCount(players.length);
        
        if (!isOpen) {
          setError('Lottery is currently closed');
        }
        
        console.log('Contract interaction successful:', {
          price: ethers.utils.formatEther(price),
          balance: ethers.utils.formatEther(balance),
          isOpen,
          playerCount: players.length
        });
      } catch (e: any) {
        console.error('Contract call error:', e);
        setError(`Contract call failed: ${e.message}`);
      }
    } catch (error: any) {
      console.error('Contract interaction error:', error);
      if (error.message.includes('revert')) {
        setError('Contract call reverted. Make sure the contract is properly deployed and initialized.');
      } else {
        setError(`Contract error: ${error.message || 'Unknown error'}`);
      }
    }
  }

  useEffect(() => {
    if (provider) {
      updateLotteryInfo();
    }
  }, [provider, isGanache]);

  // Add owner check to useEffect
  useEffect(() => {
    if (provider && account) {
      checkOwner();
    }
  }, [provider, account, isGanache]);

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h1 className="text-3xl font-bold mb-8">Ethereum Lottery</h1>
                  
                  {!account ? (
                    <div className="space-y-4">
                      <button
                        onClick={() => connect(false)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
                      >
                        Connect to MetaMask
                      </button>
                      <button
                        onClick={() => connect(true)}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 w-full"
                      >
                        Connect to Ganache
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
                      <p>Current Pool: {lotteryBalance} ETH</p>
                      <p>Ticket Price: {ethers.utils.formatEther(ticketPrice)} ETH</p>
                      <button
                        onClick={buyTicket}
                        disabled={loading}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                      >
                        {loading ? 'Processing...' : 'Buy Ticket'}
                      </button>
                      
                      {isOwner && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h2 className="text-xl font-semibold mb-2">Owner Controls</h2>
                          {playerCount >= 3 ? (
                            <button
                              onClick={announceWinner}
                              disabled={pickingWinner}
                              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 w-full"
                            >
                              {pickingWinner ? 'Picking Winner...' : 'Pick Winner'}
                            </button>
                          ) : (
                            <div className="text-yellow-600 text-sm text-center p-2 bg-yellow-100 rounded">
                              Need at least 3 tickets to be sold before picking a winner. 
                              Current tickets: {playerCount}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {(error || networkError) && (
                    <div className="text-red-500 mt-4 text-sm">
                      {error || networkError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Snackbar
        message={snackbar.message}
        isVisible={snackbar.isVisible}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  );
}

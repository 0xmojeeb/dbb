import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './App.css';

function App() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

 
  const mintNFT = async (nft) => {
    if (!walletAddress) return alert('Please connect your wallet first!');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      
      const contract = new ethers.Contract(
        nft.address,
        [nft.mintABI], 
        signer
      );

      console.log(`Minting ${nft.name}...`);
      
      
      const tx = await contract[nft.mintFunction.split('(')[0]]({ value: 0 });
      await tx.wait();
      
      alert(`Successfully minted ${nft.name}!`);
    } catch (err) {
      console.error(err);
      alert(`Minting failed: ${err.message}`);
    }
  };

  const fetchNFTs = async () => {
    try {
      const response = await axios.get('/api/free-mints');
      setNfts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch NFTs. Ensure backend is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
    const interval = setInterval(fetchNFTs, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="container">Loading free mints...</div>;
  if (error) return <div className="container error">{error}</div>;

  return (
    <div className="container">
      <header>
        <h1>🍔 DBB Live Free Mint Scanner</h1>
        <button onClick={connectWallet} className="btn connect-btn">
          {walletAddress ? `Connected: ${walletAddress.slice(0,6)}...` : 'Connect Wallet'}
        </button>
      </header>

      {nfts.length === 0 ? (
        <p>No free public mints found at the moment.</p>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <div key={nft.address} className="nft-card">
              <h3>{nft.name}</h3>
              <p className="symbol">{nft.symbol}</p>
              <div className="details">
                <p><strong>Network:</strong> {nft.network}</p>
                <p><strong>Price:</strong> {nft.mintPrice} ETH</p>
                <p><strong>Function:</strong> <span className="func">{nft.mintFunction}</span></p>
              </div>
              <div className="action-buttons">
                <a href={nft.explorerUrl} target="_blank" rel="noopener noreferrer" className="btn secondary">
                  Explorer
                </a>
                <button onClick={() => mintNFT(nft)} className="btn mint-btn">
                  Mint Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

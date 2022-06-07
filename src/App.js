import React, { useState } from "react";
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar";
import Create from "./components/Create";
import MyPurchase from "./components/MyPurchase";
import MyListed from "./components/MyListed";
import Home from "./components/Home";

import { ethers } from "ethers";

import NFTABI from "./abis/NFT.json";
import MarketPlaceABI from "./abis/NFTMarketPlace.json";

const NFTAddress = "0xc6a54D4cd12207a0AF13F59734aCFEB9EFe6Fbe5";
const MarketPlaceAddress = "0x15903998e14B1B2b8f6742E9498C2d9C025BFc4e";


function App() {

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nft, setNft] = useState();
  const [marketPlace, setMarketPlace] = useState();

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketPlaceAddress, MarketPlaceABI, signer)
    setMarketPlace(marketplace)
    const nft = new ethers.Contract(NFTAddress, NFTABI, signer)
    setNft(nft)
    setLoading(false)
  }


  return (
    <React.Fragment>
      <Navbar web3Handler={web3Handler} account={account} />
      {loading ? (<h1 className="text-center text-2xl mt-48">⌛Waiting for metamask connection...</h1>)
        :
        <Routes>
          <Route path="/" element={<Home marketPlace = {marketPlace} nft = {nft}/>} />
          <Route path="/create" element={<Create nft={nft} marketPlace={marketPlace}/>} />
          <Route path="/my-listed-items" element={<MyListed nft={nft} marketPlace={marketPlace} account={account}/>} />
          <Route path="/my-purchases" element={<MyPurchase nft={nft} marketPlace={marketPlace} account={account} />} />
        </Routes>
      }
    </React.Fragment>
  );
}

export default App;

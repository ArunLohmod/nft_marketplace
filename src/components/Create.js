import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');


const Create = ({ nft, marketPlace }) => {

  const navigate = useNavigate();

  const [image, setImage] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();

  const uploadToIPFS = async (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    if (typeof file !== undefined) {
      try {
        const result = await client.add(file);
      console.log(result);
      setImage(`https://ipfs.infura.io/ipfs/${result.path}`);
      } catch (error) {
        console.log("error while uploading image to ipfs", error);
      }
    }
  }

  const createNFT = async () => {
     if (!image || !name || !description || !price) return;
     try {
     const result = await client.add(JSON.stringify({image, name, description, price}));
      mintThenList(result);
     } catch (error) {
       console.log("ipfs uri upload error", error)
     }
  }

  const mintThenList = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`
    // mint nft
    await(await nft.mint(uri)).wait();
    // getting token id of nft
    const id = await nft.tokenCount();
    // setting aproval for marketplace
    await(await nft.setApprovalForAll(marketPlace.address, true)).wait();
    // list nft
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await marketPlace.makeItem(nft.address, id, listingPrice)).wait();

    navigate("/");
  };

  return (
    <React.Fragment>
      <div className="container mx-auto">
        <div className="max-w-xl p-5 mx-auto my-10 bg-white rounded-md shadow-sm">
          <div className="text-center">
            <h1 className="my-3 text-3xl font-semibold text-gray-700">Create & Mint NFT</h1>
          </div>
          <div>

              <div className="mb-6">
                <input
                  type="file"
                  name="image"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                  onChange={uploadToIPFS}
                />
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                  onChange={(e) => { setName(e.target.value) }}
                />
              </div>
              <div className="mb-6">
                <textarea
                  rows="5"
                  name="description"
                  placeholder="Description"
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                  required
                  onChange={(e) => { setDescription(e.target.value) }}
                ></textarea>
              </div>
              <div className="mb-6">
                <input
                  type="number"
                  name="price"
                  placeholder="Price In ETH"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                  onChange={(e) => { setPrice(e.target.value) }}
                />
              </div>
              <div className="mb-6">
                <button
                  // type='submit'
                  className="w-full px-2 py-4 text-white bg-indigo-500 rounded-md  focus:bg-indigo-600 focus:outline-none"
                  onClick={createNFT}
                  >
                  Create & Mint
                </button>
              </div>
            
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Create
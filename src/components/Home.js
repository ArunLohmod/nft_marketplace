import React, {  useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Home = ({ marketPlace, nft }) => {
    
    const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const loadMarketplaceItems = async () => {
    // Load all unsold items
    const itemCount = await marketPlace.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketPlace.items(i)
      if (!item.sold) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId)
        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of item (item price + fee)
        const totalPrice = await marketPlace.totalPrice(item.itemId)
        // Add item to items array
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        })
      }
    }
    setLoading(false)
    setItems(items)
  }

  const buyMarketItem = async (item) => {
    await (await marketPlace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems()
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, []) 

   

    return (
        <React.Fragment>
            
                <div className="flex flex-wrap justify-evenly mt-40">

                {
                loading ? (<h1 className='text-2xl text-center mt-48'>⌛ Loading Items...</h1>)
                    : (
                        (items) ? items.map((item, id) => {
                            return (

                                    <div className="w-100 rounded overflow-hidden shadow-lg ml-6 mb-10 w-72">
                                        <img className="w-full h-52" src={item.image} alt="post-img" />
                                        <div className="px-6 py-4">
                                            <div className="font-bold text-xl text-center">{item.name}</div>
                                            <p className="text-gray-700 text-base mt-6">
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className='w-full p-2 bg-blue-600'>
                                            <button className='w-full font-bold text-center text-white bg-gray' onClick={()=>buyMarketItem(item)}>{`Buy for ${ethers.utils.formatEther(item.totalPrice)} ETH`}</button>
                                        </div>
                                    </div>

                            )
                        })

                            : (<h1 className='text-2xl text-center mt-48'>There is no item to show.</h1>)
                    )
            }
            </div>
        </React.Fragment>
    )
}

export default Home;



import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const MyPurchase = ({ nft, marketPlace, account }) => {

    const [purchasedItems, setPurchasedItems] = useState()
    const [loading, setLoading] = useState(true)

    const renderPurchasedItems = async () => {

        const filter = await marketPlace.filters.Bought(null, null, null, null, null, account)
        const result = await marketPlace.queryFilter(filter)

        const purchases = await Promise.all(result.map(async i => {
            i = i.args

            // get uri url from nft contract
            const uri = await nft.tokenURI(i.tokenId)
            // use uri to fetch the nft metadata stored on ipfs 
            const response = await fetch(uri)
            const metadata = await response.json()
            // get total price of item (item price + fee)
            const totalPrice = await marketPlace.totalPrice(i.itemId)
            // define listed item object
            let purchasedItem = {
                totalPrice,
                price: i.price,
                itemId: i.itemId,
                name: metadata.name,
                description: metadata.description,
                image: metadata.image
            }
            return purchasedItem
        }))

        setPurchasedItems(purchases)
        setLoading(false)

    }

    useEffect(() => {
        renderPurchasedItems()
    }, [])

    if(loading){
        return(
            <h1 className='text-2xl text-center mt-48'>⌛ Loading Items...</h1>
        )
    }

    return (
        <React.Fragment>
            <h1 className='text-center text-2xl font-semibold text-gray-700 mt-10'>Your Purchased Items</h1>
            <div className="flex flex-wrap justify-evenly mt-10">

                {
                    purchasedItems.length > 0 ? (
                        purchasedItems.map((item, id)=>{
                            return(
                                <div className="w-100 rounded overflow-hidden shadow-lg ml-6 mb-10 w-72">
                                    <img className="w-full h-52" src={item.image} alt="post-img" />
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl text-center">{item.name}</div>
                                        <p className="text-gray-700 text-base">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className='w-full p-2 bg-blue-600'>
                                        <div className='w-full font-bold text-center text-white bg-gray'>{ethers.utils.formatEther(item.totalPrice)} ETH</div>
                                    </div>
                                </div>
                            )
                        })
                    )

                    : (
                        <h1 className='text-2xl text-center mt-48 text-gray-700'>There is no item to show.</h1>
                    )
                }

            </div>
        </React.Fragment>
    )
}

export default MyPurchase
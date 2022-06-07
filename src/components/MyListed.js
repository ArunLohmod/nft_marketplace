import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'


function renderSoldItems(items) {
    return (
        <React.Fragment>
            <h2 className='text-2xl text-gray-700 text-center mt-20'>Sold</h2>

            <div className="flex flex-wrap justify-evenly mt-8">
                {items.map((item, idx) => (
                    <div className="w-100 rounded overflow-hidden shadow-lg ml-6 mb-10 w-72">
                        <img className="w-full h-52" src={item.image} alt="post-img" />
                        <div className="px-6 py-4">
                            <div className="font-bold text-xl text-center">{item.name}</div>
                            <p className="text-gray-700 text-base">
                                {item.description}
                            </p>
                        </div>
                        <div className='w-full p-2 bg-blue-600'>
                            <div className='w-full font-bold text-center text-white bg-gray'> For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved {ethers.utils.formatEther(item.price)} ETH</div>
                        </div>
                    </div>
                ))}
            </div>
        </React.Fragment>
    )
}



const MyListed = ({ nft, marketPlace, account }) => {
    const [loading, setLoading] = useState(true)
    const [listedItems, setListedItems] = useState([])
    const [soldItems, setSoldItems] = useState([])

    const loadListedItems = async () => {
        // Load all sold items that the user listed
        const itemCount = await marketPlace.itemCount()
        let listedItems = []
        let soldItems = []
        for (let indx = 1; indx <= itemCount; indx++) {
            const i = await marketPlace.items(indx)
            if (i.seller.toLowerCase() === account) {
                // get uri url from nft contract
                const uri = await nft.tokenURI(i.tokenId)
                // use uri to fetch the nft metadata stored on ipfs 
                const response = await fetch(uri)
                const metadata = await response.json()
                // get total price of item (item price + fee)
                const totalPrice = await marketPlace.totalPrice(i.itemId)
                // define listed item object
                let item = {
                    totalPrice,
                    price: i.price,
                    itemId: i.itemId,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                }
                listedItems.push(item)
                // Add listed item to sold items array if sold
                if (i.sold) soldItems.push(item)
            }
        }
        setLoading(false)
        setListedItems(listedItems)
        setSoldItems(soldItems)
    }
    useEffect(() => {
        loadListedItems()
    }, [])


    if (loading) {
        return (
            <h1 className='text-2xl text-center mt-48'>⌛ Loading Items...</h1>
        )
    }


    return (
        <React.Fragment>
            <h1 className=" my-10 text-3xl font-semibold text-center">Your Listed Items</h1>

            {
                listedItems.length > 0 ? (
                    <div>

                        <div className="flex flex-wrap justify-evenly mt-20">

                            {listedItems.map((item, id) => {
                                return (


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
                            }

                        </div>
                        {soldItems.length > 0 ? renderSoldItems(soldItems)
                            : (<h1></h1>)}

                    </div>

                )

                    : (
                        <h1 className='text-2xl text-center mt-48 text-gray-700'>There is no item to show.</h1>
                    )
            }

        </React.Fragment>
    )
}

export default MyListed



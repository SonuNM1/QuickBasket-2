import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import CardProduct from "./CardProduct";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      console.log("getting wishlist items");
      const response = await Axios(SummaryApi.fetchUserWishlist);

      setWishlist(response.data.data);
    } catch (error) {
      console.error("Error fetching wishlist: ", error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeProduct = async (productId) => {
    try {
      console.log('Removing product from wishlist: ', productId) ; 

      await Axios({
        ...SummaryApi.removeProductFromWishlist, 
        data: {product_id : productId} 
      })

      // filter out the removed product from the wishlist state 

      setWishlist((prev) => prev.filter((item) => item.id !== productId)) ; 

      toast.success('Product removed from wishlist') ; 

    } catch (error) {
        console.log('Wishlist product remove error: ', error || error.message) ; 

        toast.error('Failed to remove product from wishlist') ; 
    }
  }

  return (
    <div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold">My Wishlist</h2>

    {/* Show message when products are wishlisted */}

    {
      wishlist.length > 0 ? (
        <h2 className="text-sm font-bold mb-6 mt-3 text-center">
          {wishlist.length} {wishlist.length === 1 ? "product" : "products"} in your wishlist. <span className="text-green-600">Buy now!</span>
        </h2>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg font-bold">No products wishlisted</p>
          <p className="text-gray-400">Add your favourite products here</p>

          {/* empty wishist image */}

          <img
            src='/empty_wishlist.jpg'
            alt="Empty wishlist"
            className="w-64 mx-auto mt-2 opacity-80"
          />

          {/* Explore now button */}

          <Link to='/' className="mt-4 inline-block bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300" >
            Explore Now 
          </Link>

        </div>
      )
    } 

    {/* Wishlist products */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {wishlist.map((product) => (
          <CardProduct 
            key={product.id} 
            data={product} 
            removeProduct={removeProduct}
            />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

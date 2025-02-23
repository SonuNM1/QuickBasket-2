import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import CardProduct from "./CardProduct";

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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">My Wishlist</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {wishlist.map((product) => (
          <CardProduct key={product.id} data={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

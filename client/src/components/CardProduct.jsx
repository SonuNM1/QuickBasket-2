import React, { useEffect, useState } from "react";
import { FaHeart, FaTimes } from "react-icons/fa"; // Wishlist icon
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "./AddToCartButton";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa6";

const CardProduct = ({ data, removeProduct }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [averageRating, setAverageRating] = useState(null);

  // fetch wishlist when the component mounts

  useEffect(() => {
    checkIfWishlisted();
    fetchAverageRating();
  }, []);

  // Fetch average rating for product

  const fetchAverageRating = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.fetchAverageRating,
        data: { product_id: data.id || data._id },
      });

      console.log("Average rating for ", data.name, " : ", response.data);

      if (response.data.success) {
        const avgRating = parseFloat(response.data.data.average_rating);

        setAverageRating(avgRating > 0 ? avgRating.toFixed(1) : null);
      }
    } catch (error) {
      console.error("Error fetching average rating: ", error || error.message);
    }
  };

  // Check if product is already in wishlist

  const checkIfWishlisted = async () => {
    try {
      const response = await Axios(SummaryApi.fetchUserWishlist);

      const wishlistedItems = response.data.data || [];

      // check if the product is already in the wishlist

      const alreadyWishlisted = wishlistedItems.some(
        (item) => item.id === data.id
      );

      if (alreadyWishlisted) {
        setIsWishlisted(true);
      }
    } catch (error) {
      console.log("Check if wishlisted error: ", error || error.message);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Wishlist button clicked for product:", data.id);

    try {
      if (isWishlisted) {
        await Axios({
          ...SummaryApi.removeProductFromWishlist,
          data: { product_id: data.id },
        });
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        const response = await Axios({
          ...SummaryApi.addProductToWishlist,
          data: { product_id: data.id },
        });

        if (response.data.success) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        } else {
          toast.error("Product already exists in your wishlist");
        }
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.log("Toggle wishlist error: ", error);

      toast.error("Error updating wishlist ");
    }
  };

  return (
    <Link
      to={url}
      className="border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white relative"
    >
      {/* Remove Product "X" button (only in wishlist page) */}

      {removeProduct && (
        <button
          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeProduct(data.id);
          }}
        >
          <FaTimes size={14} />
        </button>
      )}

      {/* Wishlist Icon (Floats Over Image, Doesn't Move Anything) */}

      <div
        className="absolute left-1 top-1 cursor-pointer bg-white p-1 rounded-full shadow-md"
        onClick={toggleWishlist}
      >
        <FaHeart
          size={12} // Smaller icon
          color={isWishlisted ? "red" : "gray"}
          className="transition duration-300 ease-in-out"
        />
      </div>

      {/* Product Image */}
      <div className="min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden">
        <img
          src={data.image[0]}
          className="w-full h-full object-scale-down lg:scale-125"
        />
      </div>

      {/* Discount Label + Rating */}

      <div className="flex items-center gap-6 px-2 lg:px-0">
        {Boolean(data.discount) && (
          <p className="text-green-600 bg-green-100 px-2 w-fit text-xs rounded-full">
            {/* {data.discount}% discount */}
            {Math.round(data.discount)}% discount
          </p>
        )}

        {/* Average rating */}

        {averageRating && (
          <div className="bg-black px-2 rounded-full flex items-center gap-1 text-yellow-500 font-semibold text-xs">
            {averageRating} <FaStar size={12} />
          </div>
        )}
      </div>

      {/* Product Name */}

      <div className="px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2 mt-3">
        {data.name}
      </div>

      {/* Unit */}

      {/* <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
        {data.unit} 
      </div> */}

      {/* Price & Stock */}

      <div className="px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base">
        <div className="flex items-center gap-1">
          <div className="font-semibold">
            {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
          </div>
        </div>
        <div>
          {data.stock == 0 ? (
            <p className="text-red-500 text-sm text-center">Out of stock</p>
          ) : (
            <AddToCartButton data={data} />
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;

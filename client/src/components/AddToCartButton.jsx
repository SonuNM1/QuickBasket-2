import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../provider/GlobalProvider";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "./Loading";
import { useSelector } from "react-redux";

const AddToCartButton = ({ data }) => {
  const { fetchCartItem, deleteCartItem, selectedVariation } =
    useGlobalContext();
  const [loading, setLoading] = useState(false);
  const cartItems = useSelector((state) => state.cartItem.cart);
  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [cartItemDetails, setCartItemDetails] = useState(null);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      if (!data?._id) {
        toast.error("Product ID is missing");
        return;
      }

      if (data.variations?.length > 0 && !selectedVariation) {
        toast.error("Please select a variation before adding to cart!");
        return;
      }

      const selectedPrice = selectedVariation
        ? selectedVariation.price
        : data?.price;
      const variationId = selectedVariation ? selectedVariation.id : null;

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: data?._id,
          variationId,
          price: selectedPrice,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data || !cartItems) return;

    let foundItem = cartItems.find(
      (item) =>
        item.productId._id === data._id &&
        (!data.variations?.length || item.variationId === selectedVariation?.id)
    );

    setIsAvailableCart(!!foundItem);
    setCartItemDetails(foundItem);
  }, [data, cartItems, selectedVariation]);

  const handleRemoveFromCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItemDetails) return;

    await deleteCartItem(cartItemDetails._id);
    setIsAvailableCart(false);
    setCartItemDetails(null);
    toast.success("Item removed from cart");
  };

  return (
    <div className="w-full max-w-[150px]">
      {isAvailableCart ? (
        <button
          onClick={handleRemoveFromCart}
          className="bg-red-600 hover:bg-red-700 text-white px-2 lg:px-4 py-1 rounded"
        >
          Remove
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          className="bg-green-600 hover:bg-green-700 text-white px-2 lg:px-4 py-1 rounded"
        >
          {loading ? <Loading /> : "Add"}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;

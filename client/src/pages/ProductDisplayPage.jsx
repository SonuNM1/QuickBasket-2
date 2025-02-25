import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaHeart, FaStar } from "react-icons/fa6";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
// import { FaAngleRight,FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import Divider from "../components/Divider";
import image1 from "../assets/minute_delivery.png";
import image2 from "../assets/Best_Prices_Offers.png";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "../components/AddToCartButton";
import UserRating from "./UserRating";
import toast from "react-hot-toast";

const ProductDisplayPage = () => {
  const params = useParams();
  let productId = params?.product?.split("-")?.slice(-1)[0];

  const [data, setData] = useState({
    name: "",
    image: [],
  });

  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const imageContainer = useRef();

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if the product is already in the wishlist

  const checkIfWishlisted = async () => {
    try {
      const response = await Axios(SummaryApi.fetchUserWishlist);

      const wishlistItems = response.data.data || [];

      // check if the product is in the wishlist

      const alreadyWishlisted = wishlistItems.some(
        (item) => item.id === parseInt(productId)
      );

      setIsWishlisted(alreadyWishlisted);
    } catch (error) {
      console.log(
        "Check if wishlisted productDisplayPage error: ",
        error || error.message
      );
    }
  };

  useEffect(() => {
    fetchProductDetails();
    checkIfWishlisted();
    fetchAverageRating();
  }, [params]);

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100;
  };

  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100;
  };

  // const toggleWishlist = async (e) => {

  //   e.preventDefault();
  //   e.stopPropagation();

  //   try {
  //     if (isWishlisted) {
  //       await Axios({
  //         ...SummaryApi.removeProductFromWishlist,
  //         data: { product_id: productId },
  //       });
  //       toast.success("Removed from wishlist");
  //     } else {
  //       await Axios({
  //         ...SummaryApi.addProductToWishlist,
  //         data: { product_id: productId },
  //       });
  //       toast.success("Added to wishlist");
  //     }
  //     setIsWishlisted(!isWishlisted);
  //   } catch (error) {
  //     console.error("Wishlist error:", error);
  //     toast.error("Error updating wishlist");
  //   }
  // };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = { product_id: data.id || data._id }; // ✅ Prepare data

    console.log("Sending Wishlist Request:", payload); // ✅ Debugging log

    try {
      let response;
      if (isWishlisted) {
        response = await Axios({
          ...SummaryApi.removeProductFromWishlist,
          data: payload,
        });
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        response = await Axios({
          ...SummaryApi.addProductToWishlist,
          data: payload,
        });

        if (response.data.success) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        } else {
          toast.error("Product already exists in your wishlist");
        }
      }
      console.log("Wishlist API Response:", response); // ✅ Debugging log
      // setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Wishlist API Error:", error);
      toast.error("Error updating wishlist");
    }
  };

  const fetchAverageRating = async () => {
    console.log("Fetch average rating for product id: ", productId);

    try {
      const response = await Axios({
        ...SummaryApi.fetchAverageRating,
        data: { product_id: productId },
      });

      console.log("API Response for Average Rating:", response.data);

      if (response.data.success) {
        // since receiving the averageRating as string from backend, we need to convert it into integer

        const avgRating = parseFloat(response.data.data.average_rating);

        setAverageRating(avgRating > 0 ? avgRating.toFixed(1) : null);
      }
    } catch (error) {
      console.log("Error fetching average rating: ", error || error.message);
    }
  };

  console.log("product data", data);

  return (
    <section className="container mx-auto p-4 grid lg:grid-cols-2 ">
      {/* product image and review  */}

      <div className="">
        <div className="relative bg-white lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full">
          {/* Rating Badge */}

          {/* {averageRating > 0 ? (
            <div className="absolute top-2 left-2 bg-black text-white text-sm font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              {averageRating.toFixed(1)}{" "}
              <FaStar size={12} className="text-yellow-400" />
            </div>
          ) : (
            <div className="absolute top-2 left-2 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
              No Rating
            </div>
          )} */}

          {averageRating && averageRating > 0 ? (
            <div className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              {averageRating} <FaStar size={12} className="text-yellow-400" />
            </div>
          ) : null}

          {/* Product Image */}

          <img
            src={data.image[image]}
            className="w-full h-full object-scale-down"
          />
        </div>
        <div className="flex items-center justify-center gap-3 my-2">
          {data.image.map((img, index) => {
            return (
              <div
                key={img + index + "point"}
                className={`bg-slate-200 w-3 h-3 lg:w-5 lg:h-5 rounded-full ${
                  index === image && "bg-slate-300"
                }`}
              ></div>
            );
          })}
        </div>
        <div className="grid relative">
          <div
            ref={imageContainer}
            className="flex gap-4 z-10 relative w-full overflow-x-auto scrollbar-none"
          >
            {data.image.map((img, index) => {
              return (
                <div
                  className="w-20 h-20 min-h-20 min-w-20 scr cursor-pointer shadow-md"
                  key={img + index}
                >
                  <img
                    src={img}
                    alt="min-product"
                    onClick={() => setImage(index)}
                    className="w-full h-full object-scale-down"
                  />
                </div>
              );
            })}
          </div>
          <div className="w-full -ml-3 h-full hidden lg:flex justify-between absolute  items-center"></div>

          <div className="mt-20">
            <UserRating
              initialValue={data.rating || 2.5}
              onChange={(newRating) => {
                console.log("new rating: ", newRating);
              }}
              product_id={data.id}
            />
          </div>
        </div>
        <div></div>
      </div>

      {/* product desc, price, add to cart */}

      <div className="p-4 lg:pl-7 text-base lg:text-lg">
        
        {/* <p className='bg-green-300 w-fit px-2 rounded-full'>10 Min</p> */}
        
        <h2 className="text-lg font-semibold lg:text-3xl mb-4">{data.name}</h2>
        
        {/* <p className="">{data.unit}</p> */}

        <Divider />
        
        <div>
          <p className="mt-3">Price</p>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="border border-green-600 px-4 py-2 rounded bg-green-50 w-fit">
              <p className="font-semibold text-lg lg:text-xl">
                {DisplayPriceInRupees(
                  pricewithDiscount(data.price, data.discount)
                )}
              </p>
            </div>
            {data.discount && (
              <p className="line-through">{DisplayPriceInRupees(data.price)}</p>
            )}
            {data.discount && (
              <p className="font-bold text-green-600 lg:text-2xl">
                {Math.round(data.discount)}%{" "}
                <span className="text-base text-neutral-500">Discount</span>
              </p>
            )}
          </div>
        </div>

        {data.stock === 0 ? (
          <p className="text-lg text-red-500 my-2">Out of Stock</p>
        ) : (
          // <button className='my-4 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded'>Add</button>

          <div className="my-4 flex gap-1 items-center">
            <AddToCartButton data={data} />

            {/* wishlist button */}

            <button
              onClick={toggleWishlist}
              className={`
    flex items-center gap-2 px-6 py-2 rounded-md transition duration-300 h-9 text-sm 
    ${
      isWishlisted
        ? "bg-red-700 text-white border-red-700"
        : "bg-white border border-red-500 text-red-500 hover:bg-red-700 hover:text-white"
    }`}
            >
              <FaHeart
                size={20}
                className={`transition duration-300 ${
                  isWishlisted ? "text-white" : "text-red-500 hover:text-white"
                }`}
              />

              <span className="font-medium">
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </span>
            </button>
          </div>
        )}

        <h2 className="font-semibold mt-14">Why shop from localBazaa₹? </h2>
        <div>
          <div className="flex  items-center gap-4 my-4">
            <img src={image1} alt="superfast delivery" className="w-20 h-20" />
            <div className="text-sm">
              <div className="font-semibold">Superfast Delivery</div>
              <p>
                Get your orer delivered to your doorstep at the earliest from
                dark stores near you.
              </p>
            </div>
          </div>
          <div className="flex  items-center gap-4 my-4">
            <img src={image2} alt="Best prices offers" className="w-20 h-20" />
            <div className="text-sm">
              <div className="font-semibold">Best Prices & Offers</div>
              <p>
                Best price destination with offers directly from the
                manufacturers.
              </p>
            </div>
          </div>
        </div>

        {/****only mobile */}

        <div className="my-4 grid gap-3 ">
          <div>
            <p className="font-semibold mt-4">Description</p>
            <p className="text-sm mt-3">{data.description}</p>
          </div>

          {/* <div>
            <p className="font-semibold">Unit</p>
            <p className="text-base">{data.unit}</p>
          </div> */}
          
        </div>
      </div>
    </section>
  );
};

export default ProductDisplayPage;

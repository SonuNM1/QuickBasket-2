import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa'; // Wishlist icon
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { Link } from 'react-router-dom';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from './AddToCartButton';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const CardProduct = ({ data }) => {

  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = async (e) => {

    e.preventDefault(); 
    e.stopPropagation(); 
   
    console.log("Wishlist button clicked for product:", data.id); 

    try{
      if(isWishlisted){
        await Axios({
          ...SummaryApi.removeProductFromWishlist, 
          data: {product_id: data.id}
        })
        toast.success('Removed from wishlist')
      }
      else{ 
        await Axios({
          ...SummaryApi.addProductToWishlist, 
          data: {product_id: data.id}
        })
        toast.success('Added to wishlist')
      }
      setIsWishlisted(!isWishlisted) ; 
    }catch(error){
      console.log('Toggle wishlist error: ', error ) ; 

      toast.error('Error updating wishlist ')
    }

  };

  return (
    <Link to={url} className='border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white relative'>
      
      {/* Wishlist Icon (Floats Over Image, Doesn't Move Anything) */}
      
      <div 
        className='absolute left-1 top-1 cursor-pointer bg-white p-1 rounded-full shadow-md'
        onClick={toggleWishlist}
      >
        <FaHeart
          size={12} // Smaller icon
          color={isWishlisted ? 'red' : 'gray'}
          className='transition duration-300 ease-in-out'
        />
      </div>

      {/* Product Image */}
      <div className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden'>
        <img 
          src={data.image[0]} 
          className='w-full h-full object-scale-down lg:scale-125' 
        />
      </div>

      {/* Discount Label */}
      {Boolean(data.discount) && (
        <p className='text-green-600 bg-green-100 px-2 w-fit text-xs rounded-full'>
          {data.discount}% discount
        </p>
      )}

      {/* Product Name */}
      <div className='px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2'>
        {data.name}
      </div>

      {/* Unit */}
      <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
        {data.unit} 
      </div>

      {/* Price & Stock */}
      <div className='px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base'>
        <div className='flex items-center gap-1'>
          <div className='font-semibold'>
            {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))} 
          </div>
        </div>
        <div>
          {data.stock == 0 ? (
            <p className='text-red-500 text-sm text-center'>Out of stock</p>
          ) : (
            <AddToCartButton data={data} />
          )}
        </div>
      </div>

    </Link>
  );
};

export default CardProduct;

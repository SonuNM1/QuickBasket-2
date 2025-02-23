import {Router} from 'express' ; 
import auth from '../middleware/auth.js'
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';

const wishlistRouter = Router() ; 

wishlistRouter.post('/add', auth, addToWishlist) ; 

wishlistRouter.get('/get', auth, getWishlist) ; 

wishlistRouter.post('/remove', auth, removeFromWishlist)

export default wishlistRouter ; 

import { executeQuery } from "../utils/DBUtils.js";

// Add product to wishlist 

// export const addToWishlist = async (req, res) => {
//     try {
//         const userId = req.userId ; // extract user ID from token 
//         const {product_id} = req.body ; 

//         if(!userId || !product_id){
//             return res.status(400).json({
//                 message: 'User ID and Product ID are required', 
//                 error: true 
//             })
//         }

//         const existingItem = await executeQuery(
//             'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
//             [userId, product_id]
//         )

//         if(existingItem.length > 0){
//             return res.status(400).json({
//                 message: 'Product is already in the wishlist', 
//                 error: true 
//             })
//         }

//         // add to wishlist 

//         const result = await executeQuery(
//             'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
//             [userId, product_id]
//         )

//         return res.status(201).json({
//             message: 'Product added to wishlist', 
//             success: true , 
//             data: result 
//         })

//     } catch (error) {
//         console.error('Add to wishlist error: ', error) ; 

//         return res.status(500).json({
//             message: 'Internal Server Error', 
//             error: true , 
//             success: false 
//         })
//     }
// }

export const addToWishlist = async (req, res) => {
    try {
      const { product_id } = req.body;
      const userId = req.userId; // Assuming authentication middleware extracts userId
  
      console.log("Received wishlist request:", { product_id, userId });  // ✅ Debugging log
  
      if (!product_id || !userId) {
        return res.status(400).json({
          message: "Product ID and User ID are required",
          error: true,
        });
      }
  
      // Insert wishlist entry into database
      await executeQuery("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)", [userId, product_id]);
  
      return res.json({ message: "Added to wishlist", success: true });
    } catch (error) {
      console.error("Wishlist error:", error);
      return res.status(500).json({ message: "Internal Server Error", error: true });
    }
  };
  

// Get user's wishlist 

export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId ; 

        if(!userId){
            return res.status(401).json({
                message: 'Unauthorized',
                error: true , 
                success: false 
            })
        }

        // get wishlist items along with product details 

        const query = `
            SELECT p.* FROM products p 
            JOIN wishlist w ON p.id = w.product_id 
            WHERE w.user_id = ? 
        ` ; 

        const wishlistItems = await executeQuery(query, [userId]) ; 

        return res.status(200).json({
            message: 'Wishlist fetched successfully', 
            success: true , 
            data: wishlistItems
        })

    } catch (error) {
        console.error('Fetch wishlist error: ', error) ; 

        return res.status(500).json({
            message: 'Internal Server Error', 
            error: true , 
            success: false 
        })
    }
}

// Remove product from wishlist 

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.userId ; 
        const {product_id} = req.body ; 

        if(!userId || !product_id){
            return res.status(400).json({
                message: 'User ID and product ID are required', 
                error: true 
            })
        }

        const result = await executeQuery(
            'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
            [userId, product_id]
        )

        return res.status(200).json({
            message: 'Product removed from wishlist',
            success: true , 
            data: result 
        })

    } catch (error) {
        console.error('Remove from wishlist error: ', error) ; 

        return res.status(500).json({
            message: 'Internal Server Error', error 
        })
    }
}
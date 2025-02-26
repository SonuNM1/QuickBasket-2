import { executeQuery } from "../utils/DBUtils.js";

/**
 * Add Item to Cart
 */
export const addToCartItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId, variationId, price } = request.body; // accept variation and price

    console.log("🟡 Received Add to Cart request:");
    console.log("User ID:", userId);
    console.log("Product ID:", productId);
    console.log("Variation ID:", variationId);
    console.log("Price:", price);

    if (!productId) {
      console.error("❌ Missing Product ID");
      return response.status(402).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    // Check if item is already in the cart

    const checkItemCart = await executeQuery(
      `SELECT * FROM cart_product 
       WHERE user_id = ? 
       AND product_id = ? 
       AND (variation_id IS NULL OR variation_id = ?);`,
      [userId, productId, variationId]
    );

    console.log("🔍 Cart Check Result:", checkItemCart);

    if (checkItemCart.length > 0) {
      return response.status(400).json({
        message: "Item already in cart",
      });
    }

    // Use variationId only if it's provided

    const save = await executeQuery(
      "INSERT INTO cart_product (user_id, product_id, variation_id, quantity) VALUES (?, ?, ?, ?)",
      [userId, productId, variationId || null, 1]
    );

    console.log("🟢 Insert Success:", save);

    return response.json({
      data: save,
      message: "Item added successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

/**
 * Get Cart Items
 */
// export const getCartItemController = async (request, response) => {
//   try {
//     const userId = request.userId;

//     // console.log("Getting cart items for user:", userId);

//     // Fetch cart items with product details
//     const cartItems = await executeQuery(
//       `SELECT cp.id AS cart_item_id, cp.quantity,
//                 p.id AS product_id, p.name, p.price, p.discount,p.description, p.image
//          FROM cart_product cp
//          JOIN products p ON cp.product_id = p.id
//          WHERE cp.user_id = ?`,
//       [userId]
//     );

//     // Transform the data to nest product details under "productId"
//     const formattedCartItems = cartItems.map((item) => ({
//       _id: item.cart_item_id,
//       quantity: item.quantity,
//       productId: {
//         _id: item.product_id,
//         name: item.name,
//         price: item.price,
//         description: item.description,
//         image: item.image,
//         discount: item.discount,
//       },
//     }));

//     // console.log("Formatted cart items:", formattedCartItems);

//     return response.json({
//       data: formattedCartItems,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     console.error("Error fetching cart items:", error);
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const getCartItemController = async (request, response) => {
  try {
    const userId = request.userId;

    // Fetch cart items with product and variation details
    const cartItems = await executeQuery(
      `SELECT 
          cp.id AS cart_item_id, 
          cp.quantity, 
          cp.variation_id, 
          p.id AS product_id, 
          p.name, 
          p.description, 
          p.image,
          COALESCE(pv.price, p.price) AS price, 
          p.discount AS discount
       FROM cart_product cp
       JOIN products p ON cp.product_id = p.id
       LEFT JOIN product_variations pv ON cp.variation_id = pv.id
       WHERE cp.user_id = ?`,
      [userId]
    );

    // Transform the data to nest product details under "productId"
    const formattedCartItems = cartItems.map((item) => ({
      _id: item.cart_item_id,
      quantity: item.quantity,
      productId: {
        _id: item.product_id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        discount: item.discount,
      },
    }));

    return response.json({
      data: formattedCartItems,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

/**
 * Update Cart Item Quantity
 */
export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, qty } = request.body;

    if (!_id || !qty) {
      return response.status(400).json({
        message: "Provide _id and qty",
      });
    }

    const updateCartItem = await executeQuery(
      "UPDATE cart_product SET quantity = ? WHERE id = ? AND user_id = ?",
      [qty, _id, userId]
    );

    return response.json({
      message: "Cart updated",
      success: true,
      error: false,
      data: updateCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

/**
 * Delete Cart Item
 */
export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await executeQuery(
      "DELETE FROM cart_product WHERE id = ? AND user_id = ?",
      [_id, userId]
    );

    return response.json({
      message: "Item removed",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

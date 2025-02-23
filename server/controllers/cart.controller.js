import { executeQuery } from "../utils/DBUtils.js";

/**
 * Add Item to Cart
 */
export const addToCartItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId } = request.body;

    console.log("hello add to card");

    if (!productId) {
      return response.status(402).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    // Check if item is already in the cart
    const checkItemCart = await executeQuery(
      "SELECT * FROM cart_product WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (checkItemCart.length > 0) {
      return response.status(400).json({
        message: "Item already in cart",
      });
    }

    // Add item to cart
    const save = await executeQuery(
      "INSERT INTO cart_product (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, productId, 1]
    );

    return response.json({
      data: save,
      message: "Item added successfully",
      error: false,
      success: true,
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
 * Get Cart Items
 */
export const getCartItemController = async (request, response) => {
  try {
    const userId = request.userId;

    // console.log("Getting cart items for user:", userId);

    // Fetch cart items with product details
    const cartItems = await executeQuery(
      `SELECT cp.id AS cart_item_id, cp.quantity, 
                p.id AS product_id, p.name, p.price, p.description, p.image
         FROM cart_product cp
         JOIN products p ON cp.product_id = p.id
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
      },
    }));

    // console.log("Formatted cart items:", formattedCartItems);

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

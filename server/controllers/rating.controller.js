import { executeQuery, convertBuffers } from "../utils/DBUtils.js";

export const addRating = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("Extracted user id:", userId);

    const { product_id, rating, review } = req.body;

    // console.log(req.body);

    // Validation
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: Missing userId",
        error: true,
        success: false,
      });
    }

    if (!product_id || !rating || !review.trim()) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false,
      });
    }

    // Ensure user exists in the database
    const userExists = await executeQuery("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (userExists.length === 0) {
      return res.status(400).json({
        message: "Invalid User ID",
        error: true,
        success: false,
      });
    }

    // Check if the rating already exists
    const existingRating = await executeQuery(
      "SELECT * FROM ratings WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    let result;

    if (existingRating.length > 0) {
      // Update the existing rating
      const updateQuery =
        "UPDATE ratings SET rating = ?, review = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?";
      result = await executeQuery(updateQuery, [
        rating,
        review,
        userId,
        product_id,
      ]);

      return res.status(200).json({
        message: "Review updated successfully",
        data: result,
      });
    } else {
      // Insert a new rating
      const insertQuery =
        "INSERT INTO ratings (user_id, product_id, rating, review) VALUES (?, ?, ?, ?)";
      result = await executeQuery(insertQuery, [
        userId,
        product_id,
        rating,
        review,
      ]);

      return res.status(201).json({
        message: "Review submitted successfully",
        data: result,
      });
    }
  } catch (error) {
    console.error("Add rating error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const getRating = async (req, res) => {
  try {
    console.log("Fetching user rating...");

    const userId = req.userId; // Extract user ID from request
    const { product_id } = req.body; // Extract product_id from request body

    console.log("________________", product_id, userId);

    if (!userId || !product_id) {
      return res.status(400).json({
        message: "User ID and Product ID are required",
        error: true,
      });
    }

    const query = `
      SELECT r.*, u.name 
      FROM ratings r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ? AND r.user_id = ?
      ORDER BY r.created_at DESC
    `;

    const ratings = await executeQuery(query, [product_id, userId]);

    console.log("User rating:", ratings);

    if (ratings.length === 0) {
      return res.status(200).json({
        message: "No review found for this product by the user.",
        data: [],
      });
    }

    return res
      .status(200)
      .json({ message: "lates review fetched", data: ratings[0] }); // Return the logged-in user's review
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllRating = async (req, res) => {
  try {
    console.log("Fetching user rating...");

    const { product_id } = req.body; // Extract product_id from request body

    console.log("________________", product_id, userId);

    if (!userId || !product_id) {
      return res.status(400).json({
        message: "User ID and Product ID are required",
        error: true,
      });
    }

    const query = `
      SELECT r.*, u.name 
      FROM ratings r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ? 
      ORDER BY r.created_at DESC
    `;

    const ratings = await executeQuery(query, [product_id]);

    console.log("User rating:", ratings);

    if (ratings.length === 0) {
      return res.status(200).json({
        message: "No review found for this product by the user.",
        data: [],
      });
    }

    return res
      .status(200)
      .json({ message: "lates review fetched", data: ratings[0] }); // Return the logged-in user's review
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
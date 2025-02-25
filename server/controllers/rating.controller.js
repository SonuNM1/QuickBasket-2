import { response } from "express";
import { executeQuery, convertBuffers } from "../utils/DBUtils.js";

// export const addRating = async (req, res) => {
//   try {
//     const userId = req.userId;

//     console.log("Extracted user id:", userId);

//     const { product_id, rating, review } = req.body;

//     // console.log(req.body);

//     // Validation
//     if (!userId) {
//       return res.status(401).json({
//         message: "Unauthorized: Missing userId",
//         error: true,
//         success: false,
//       });
//     }

//     if (!product_id || !rating || !review.trim()) {
//       return res.status(400).json({
//         message: "All fields are required",
//         error: true,
//         success: false,
//       });
//     }

//     // Ensure user exists in the database

//     const userExists = await executeQuery("SELECT id FROM users WHERE id = ?", [
//       userId,
//     ]);

//     if (userExists.length === 0) {
//       return res.status(400).json({
//         message: "Invalid User ID",
//         error: true,
//         success: false,
//       });
//     }

//     // insert a new review (no need to check any previous rating or review)

//     const insertQuery = `
//       INSERT INTO ratings (user_id, product_id, rating, review, created_at)
//       VALUES (?, ?, ?, ?, NOW())
//     `
//     const result = await executeQuery(insertQuery,  [userId, product_id, rating, review])

//     return res.status(201).json({
//       message: 'Review submitted successfully!',
//       success: true, 
//       error: false 
//     })

//   } catch (error) {
//     console.error("Add rating error:", error);

//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: true,
//       success: false,
//     });
//   }
// };

export const addRating = async (req, res) => {
  try {
    const userId = req.userId;
    const { product_id, rating, review } = req.body;

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

    // Insert a new review without replacing the previous ones
    const insertQuery = `
      INSERT INTO ratings (user_id, product_id, rating, review, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const result = await executeQuery(insertQuery, [
      userId,
      product_id,
      rating,
      review,
    ]);

    return res.status(201).json({
      message: "Review submitted successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Add rating error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};


// export const getAllRating = async (req, res) => {
//   try {

//     const userId = req.userId ; // logged-in user ID 
//     const { product_id } = req.body; 

//     if (!product_id) {
//       return res.status(400).json({
//         message: "Product ID is required",
//         error: true,
//       });
//     }

//     const query = `
//     SELECT r.id AS review_id, r.rating, r.review, r.created_at, u.name AS username, 
//            (r.user_id = ?) AS isOwner  -- Check if the review belongs to logged-in user
//     FROM ratings r
//     JOIN users u ON r.user_id = u.id
//     WHERE r.product_id = ?
//     ORDER BY r.created_at DESC
//   `;

//     const ratings = await executeQuery(query, [userId, product_id]);

//     console.log("Fetched ratings:", ratings);

//     if (ratings.length === 0) {
//       return res.status(200).json({
//         message: "No review found for this product by the user.",
//         data: [],
//       });
//     }

//     return res.status(200).json({
//       message: 'Ratings fetched successfully',
//       data: ratings   // return all ratings 
//     })

//   } catch (error) {
//     console.error("Error fetching ratings:", error);

//     return res.status(500).json({
//       message: 'Internal Server Error'
//     })
//   }
// };

export const getAllRating = async (req, res) => {
  try {
    const userId = req.userId; // logged-in user ID
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        message: "Product ID is required",
        error: true,
      });
    }

    const query = `
      SELECT r.id AS review_id, r.rating, r.review, r.created_at, u.name AS username, 
             (r.user_id = ?) AS isOwner  -- Check if the review belongs to the logged-in user
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `;

    const ratings = await executeQuery(query, [userId, product_id]);

    return res.status(200).json({
      message: "Ratings fetched successfully",
      data: ratings, // return all reviews
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


export const getRating = async (req, res) => {
  try {
    // console.log("Fetching user rating...");

    const userId = req.userId; // Extract user ID from request
    const { product_id } = req.body; // Extract product_id from request body

    // console.log("________________", product_id, userId);

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

    // console.log("User rating:", ratings);

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
}

export const editRating = async (req, res) => {
  try {
    const userId = req.userId ; 
    const {review_id , review } = req.body ; 

    if(!userId || !review_id || !review.trim()){
      return res.status(400).json({
        message: 'Review ID and updated review text are required',
        error: true, 
        success: false 
      })
    }

    // update only if the review belongs to the user 

    const updateQuery = `
      UPDATE ratings 
      SET review = ?, created_at = NOW()
      WHERE id = ? AND user_id = ?
    ` ; 

    const result = await executeQuery(updateQuery, [review, review_id, userId])

    if(result.affectedRows === 0){
      return res.status(403).json({
        message: 'Unauthorized: Cannot edit this review',
        error: true 
      })
    }

    return res.status(200).json({
      message: 'Review updated successfully',
      success: true 
    })

  } catch (error) {
    console.error("Edit rating error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteRating = async (req, res) => {
  try {
    const userId = req.userId ; 
    const {review_id} = req.body ; 

    if(!userId || !review_id){
      return res.status(400).json({
        message: 'Review ID is required',
        error: false, 
        success: true 
      })
    }

    // Delete only if the review belongs to the user 

    const deleteQuery = `
      DELETE FROM ratings
      WHERE id = ? AND user_id = ? 
    `

    const result = await executeQuery(deleteQuery, [review_id, userId]) ; 

    if(result.affectedRows === 0){
      return res.status(403).json({
        message: 'Unauthorized: Cannot delete this review',
        error: true 
      })
    }

    return res.status(200).json({
      message: 'Review deleted successfully!', 
      success: true 
    })

  } catch (error) {
    console.error("Delete rating error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAverageRating = async (req, res) => {

  console.log("Request Body:", req.body); 

  try {
    const {product_id} = req.body ; 

    if(!product_id){
      return res.status(400).json({
        message: "Product ID doesn't exist", 
        error: false, 
        success: true 
      })
    }

    const query = `SELECT AVG(rating) as average_rating FROM ratings WHERE product_id = ?`

    const result = await executeQuery(query, [product_id]) ; 

    return res.status(200).json({
      message: "Average rating fetched successfully",
      success: true,
      data: { average_rating: parseFloat(result[0]?.average_rating) || 0 },  // ✅ Convert to number
    });
    

  } catch (error) {
    console.error("Error fetching average rating:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
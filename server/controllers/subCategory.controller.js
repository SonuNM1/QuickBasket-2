import { executeQuery } from "../utils/DBUtils.js";

//updated
// Create SubCategory
export const AddSubCategoryController = async (req, res) => {
  try {
    const { name, image, category } = req.body;

    // Validate input
    if (
      !name ||
      !image ||
      !category ||
      !Array.isArray(category) ||
      category.length === 0
    ) {
      return res.status(400).json({
        message: "Provide a valid name, image, and at least one category ID",
        error: true,
        success: false,
      });
    }

    // Extract category IDs and check if any are null/undefined
    const category_ids = category
      .map((cat) => cat._id)
      .filter((id) => id !== null && id !== undefined);

    // If category_ids is empty after filtering, return an error
    if (category_ids.length === 0) {
      return res.status(400).json({
        message: "Invalid category IDs. Ensure all categories have valid IDs.",
        error: true,
        success: false,
      });
    }

    // Insert data into MySQL, converting category_ids array to JSON string
    const result = await executeQuery(
      "INSERT INTO sub_categories (name, image, categories) VALUES (?, ?, ?)",
      [name, image, JSON.stringify(category_ids)]
    );

    // console.log("Insert results:", result);

    return res.json({
      message: "SubCategory created successfully",
      data: { id: result.insertId, name, image, category_ids },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// Get SubCategories
export const getSubCategoryController = async (req, res) => {
  try {
    const subCategories = await executeQuery(
      `SELECT sub_categories.*, 
              COALESCE(
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'name', categories.name,
                    '_id', CAST(categories.id AS CHAR)
                  )
                ),
                JSON_ARRAY()
              ) AS category
       FROM sub_categories
       LEFT JOIN categories 
       ON JSON_CONTAINS(sub_categories.categories, CAST(categories.id AS CHAR), '$')
       GROUP BY sub_categories.id
       ORDER BY sub_categories.created_at DESC`
    );

    // console.log(subCategories);

    // Parse category names JSON if necessary
    // subCategories.forEach((subCategory) => {
    //   subCategory.category_names = JSON.parse(subCategory.category_names);
    // });

    return res.json({
      message: "SubCategories fetched successfully",
      data: subCategories,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// Update SubCategory
export const updateSubCategoryController = async (req, res) => {
  try {
    const { _id, name, image, category } = req.body;

    // console.log("________body", req.body);

    if (!name || !image || !category || !Array.isArray(category)) {
      return res.status(400).json({
        message: "Provide valid name, image, and category array",
        error: true,
        success: false,
      });
    }

    const category_ids = category
      .map((cat) => cat._id)
      .filter((id) => id !== null && id !== undefined);

    // If category_ids is empty after filtering, return an error
    if (category_ids.length === 0) {
      return res.status(400).json({
        message: "Invalid category IDs. Ensure all categories have valid IDs.",
        error: true,
        success: false,
      });
    }

    const result = await executeQuery(
      "UPDATE sub_categories SET name = ?, image = ?, categories = ? WHERE id = ?",
      [name, image, JSON.stringify(category_ids), _id]
    );

    console.log(result, _id);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "SubCategory not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "SubCategory updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

// Delete SubCategory
export const deleteSubCategoryController = async (req, res) => {
  try {
    const { id } = req.body;

    const result = await executeQuery(
      "DELETE FROM sub_categories WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "SubCategory not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "SubCategory deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

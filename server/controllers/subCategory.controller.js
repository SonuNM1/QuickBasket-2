import { executeQuery } from "../utils/DBUtils.js";

// Create SubCategory
export const AddSubCategoryController = async (req, res) => {
  try {
    const { name, image, category_id } = req.body;

    if (!name || !image || !category_id) {
      return res.status(400).json({
        message: "Provide name, image, category_id",
        error: true,
        success: false,
      });
    }

    const result = await executeQuery(
      "INSERT INTO sub_categories (name, image, category_id) VALUES (?, ?, ?)",
      [name, image, category_id]
    );

    return res.json({
      message: "SubCategory created successfully",
      data: { id: result.insertId, name, image, category_id },
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

// Get SubCategories
export const getSubCategoryController = async (req, res) => {
  try {
    const subCategories = await executeQuery(
      `SELECT sub_categories.*, category.name AS category_name 
             FROM sub_categories 
             JOIN categories ON sub_categories.category_id = category.id 
             ORDER BY sub_categories.created_at DESC`
    );

    return res.json({
      message: "SubCategories fetched successfully",
      data: subCategories,
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

// Update SubCategory
export const updateSubCategoryController = async (req, res) => {
  try {
    const { id, name, image, category_id } = req.body;

    const result = await executeQuery(
      "UPDATE sub_categories SET name = ?, image = ?, category_id = ? WHERE id = ?",
      [name, image, category_id, id]
    );

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

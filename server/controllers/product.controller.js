import ProductModel from "../models/product.model.js";
import { executeQuery } from "../utils/DBUtils.js";

export const createProductController = async (request, response) => {
  try {
    const {
      name,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      variations, // from frontend
    } = request.body;

    // // console.log("Received request body:", request.body);

    // Validate required fields
    if (!name || !image || !unit || !price || !description) {
      return response.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false,
      });
    }

    // Ensure category and subCategory are valid JSON arrays and contain valid IDs
    const validCategories = Array.isArray(category)
      ? category
          .filter(
            (item) =>
              item.id !== null && item.id !== undefined && item.id !== ""
          )
          .map((item) => item.id)
      : [];

    const validSubCategories = Array.isArray(subCategory)
      ? subCategory
          .filter(
            (item) =>
              item.id !== null && item.id !== undefined && item.id !== ""
          )
          .map((item) => item.id)
      : [];

    if (validCategories.length === 0 || validSubCategories.length === 0) {
      return response.status(400).json({
        message: "Category and SubCategory must contain valid IDs",
        error: true,
        success: false,
      });
    }

    // Insert product into the database
    const product = await executeQuery(
      `INSERT INTO products 
        (name, image, category, subCategory,unit,stock,price,discount,description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        JSON.stringify(image),
        JSON.stringify(validCategories), // Store as JSON string
        JSON.stringify(validSubCategories), // Store as JSON string
        unit || "",
        stock ?? 0, // Default stock to 0 if not provided
        parseFloat(price),
        parseFloat(discount) ?? 0, // Default discount to 0 if not provided
        description ?? "",
      ]
    );

    if (!product) {
      return response.json({
        message: "Failed to create product!",
        data: [],
        error: true,
        success: false,
      });
    }

    // inserting and saving variations in the database

    const productId = product.insertId;

    if (variations && Array.isArray(variations)) {
      for (const variation of variations) {
        const { option, price } = variation;

        if (!option || !price) continue; // skip invalid variations

        await executeQuery(
          `INSERT INTO product_variation (product_id, attribute, price) VALUES (?, ?, ?)`,
          [productId, option, parseFloat(price)]
        );
      }
    }

    return response.json({
      message: "Product Created Successfully with Variations",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    // console.log(error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductByCategory = async (request, response) => {
  try {
    // console.log("getting products ");
    const { id } = request.body;

    if (!id) {
      return response.status(400).json({
        message: "Provide category ID",
        error: true,
        success: false,
      });
    }

    const query = `
    SELECT 
      p.*, 
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT('_id', c.id, 'name', c.name)
        ) 
        FROM categories c 
        WHERE JSON_CONTAINS(p.category, CAST(c.id AS CHAR), '$')
      ) AS category_details
    FROM products p
    WHERE JSON_CONTAINS(p.category, CAST(? AS CHAR), '$')
    LIMIT 15;
  `;

    const products = await executeQuery(query, [String(id)]);

    // // console.log("htios is products", products);

    return response.json({
      message: "Category product list",
      data: products,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductDetails = async (request, response) => {
  try {
    // console.log("getting product by category_______________________");
    const { productId } = request.body;

    // // console.log("getting product");

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    const query = `
      SELECT 
        p.*, 
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('_id', c.id, 'name', c.name)
          ) 
          FROM categories c 
          WHERE JSON_CONTAINS(p.category, JSON_QUOTE(CAST(c.id AS CHAR)), '$')
        ) AS category_details,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('_id', sc.id, 'name', sc.name)
          ) 
          FROM sub_categories sc 
          WHERE JSON_CONTAINS(p.subCategory, JSON_QUOTE(CAST(sc.id AS CHAR)), '$')
        ) AS subCategory_details
      FROM products p
      WHERE p.id = ?
    `;

    const product = await executeQuery(query, [productId]);

    return response.json({
      message: "Product details",
      data: product.length ? product[0] : null,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const query = `DELETE FROM products WHERE id = ?`;
    const deleteResult = await executeQuery(query, [_id]);

    return response.json({
      message: "Product deleted successfully",
      error: false,
      success: true,
      data: deleteResult,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const searchProduct = async (request, response) => {
  try {
    let { search, page = 1, limit = 10 } = request.body;

    const offset = (page - 1) * limit;
    let query, queryParams;

    if (search) {
      query = `
        SELECT * FROM products 
        WHERE name LIKE ? OR description LIKE ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      queryParams = [`%${search}%`, `%${search}%`, parseInt(limit), offset];
    } else {
      query = `
        SELECT * FROM products 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      queryParams = [parseInt(limit), offset];
    }

    const countQuery = search
      ? `SELECT COUNT(*) AS totalCount FROM products WHERE name LIKE ? OR description LIKE ?`
      : `SELECT COUNT(*) AS totalCount FROM products`;

    const countParams = search ? [`%${search}%`, `%${search}%`] : [];

    const [data, dataCount] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, countParams),
    ]);

    return response.json({
      message: "Product data",
      error: false,
      success: true,
      data: data,
      totalCount: dataCount[0]?.totalCount || 0,
      totalPage: Math.ceil((dataCount[0]?.totalCount || 0) / limit),
      page: page,
      limit: limit,
    });
  } catch (error) {
    // console.log("Search error: ", error || error.message);
    return response.status(500).json({
      message:
        error.message ||
        error ||
        "An unexpected error occurred while processing your request",
      error: true,
      success: false,
    });
  }
};

export const getProductByCategoryAndSubCategory = async (request, response) => {
  try {
    const { categoryId, subCategoryId, page = 1, limit = 10 } = request.body;

    console.log("Received IDs:", subCategoryId);

    if (!categoryId || !subCategoryId) {
      return response.status(400).json({
        message: "Provide both categoryId and subCategoryId",
        error: true,
        success: false,
      });
    }

    const offset = (page - 1) * limit;

    // ✅ Fix: Use JSON_OVERLAPS for multiple IDs (MySQL 8.0+)
    const query = `
     SELECT * FROM products 
WHERE JSON_OVERLAPS(category, JSON_ARRAY(?))  
ORDER BY created_at DESC 
LIMIT ? OFFSET ?;

    `;

    const countQuery = `
      SELECT COUNT(*) AS totalCount FROM products 
      WHERE JSON_OVERLAPS(category, JSON_ARRAY(?))
      
    `;

    const [data, dataCount] = await Promise.all([
      executeQuery(query, [parseInt(categoryId), limit, offset]),
      executeQuery(countQuery, [categoryId, subCategoryId]),
    ]);

    console.log(data);

    return response.json({
      message: "Product list",
      data: data,
      totalCount: dataCount[0]?.totalCount || 0,
      page: page,
      limit: limit,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductController = async (request, response) => {
  try {
    // console.log("Fetching products...");

    let { page, limit, search, category, subCategory } = request.body;

    // Set default pagination values
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    const offset = (page - 1) * limit;

    // Prepare query conditions
    let conditions = [];
    let queryParams = [];

    // Search condition
    if (search) {
      conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Category filter
    if (category) {
      conditions.push("JSON_CONTAINS(p.category, ?, '$')");
      queryParams.push(JSON.stringify(category));
    }

    // SubCategory filter
    if (subCategory) {
      conditions.push("JSON_CONTAINS(p.subCategory, ?, '$')");
      queryParams.push(JSON.stringify(subCategory));
    }

    // Build WHERE clause dynamically
    let whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
    SELECT 
      p.*,
      COALESCE(
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', c.name,
            '_id', CAST(c.id AS CHAR)
          )
        ) 
        FROM categories c 
        WHERE JSON_CONTAINS(p.category, CAST(c.id AS CHAR), '$')
        ), 
        JSON_ARRAY()
      ) AS category,
      COALESCE(
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', sc.name,
            '_id', CAST(sc.id AS CHAR)
          )
        ) 
        FROM sub_categories sc 
        WHERE JSON_CONTAINS(p.subCategory, CAST(sc.id AS CHAR), '$')
        ), 
        JSON_ARRAY()
      ) AS subCategory
    FROM products AS p
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

    queryParams.push(limit, offset);

    // Fetch total count
    const countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM products p
      ${whereClause}
    `;

    const [data, totalCountResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2)), // Remove limit & offset from params
    ]);

    const totalCount = totalCountResult[0]?.totalCount || 0;

    return response.json({
      message: "Product data retrieved successfully",
      error: false,
      success: true,
      totalCount: totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data: data,
    });
  } catch (error) {
    // console.log(error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateProductDetails = async (request, response) => {
  try {
    const { _id, category, subCategory, ...updateFields } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide product _id",
        error: true,
        success: false,
      });
    }

    // // console.log("Request Body:", request.body);

    // Extract only `_id` values for category and subCategory
    const extractIds = (items) =>
      Array.isArray(items) ? items.map((item) => item.id).filter(Boolean) : [];

    // Construct update query dynamically
    const updateFieldsToSet = [];
    const values = [];

    if (updateFields.name) {
      updateFieldsToSet.push("`name` = ?");
      values.push(updateFields.name);
    }

    if (updateFields.image) {
      updateFieldsToSet.push("`image` = ?");
      values.push(JSON.stringify(updateFields.image));
    }

    if (category?.length) {
      updateFieldsToSet.push("`category` = ?");
      values.push(JSON.stringify(extractIds(category)));
    }

    if (subCategory?.length) {
      updateFieldsToSet.push("`subCategory` = ?");
      values.push(JSON.stringify(extractIds(subCategory)));
    }

    if (updateFields.unit) {
      updateFieldsToSet.push("`unit` = ?");
      values.push(updateFields.unit);
    }

    if (updateFields.stock) {
      updateFieldsToSet.push("`stock` = ?");
      values.push(updateFields.stock);
    }

    if (updateFields.price) {
      updateFieldsToSet.push("`price` = ?");
      values.push(updateFields.price);
    }

    if (updateFields.discount) {
      updateFieldsToSet.push("`discount` = ?");
      values.push(updateFields.discount);
    }

    if (updateFields.description) {
      updateFieldsToSet.push("`description` = ?");
      values.push(updateFields.description);
    }

    // If no valid fields to update, return an error
    if (updateFieldsToSet.length === 0) {
      return response.status(400).json({
        message: "No valid fields to update",
        error: true,
        success: false,
      });
    }

    // Construct the final SQL query
    const updateQuery = `UPDATE products SET ${updateFieldsToSet.join(
      ", "
    )} WHERE id = ?`;
    values.push(_id);

    // // console.log("Query:", updateQuery, "Values:", values);

    const updateResult = await executeQuery(updateQuery, values);

    return response.json({
      message: "Updated successfully",
      data: updateResult,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

import ProductModel from "../models/product.model.js";
import { executeQuery } from "../utils/DBUtils.js";

// export const createProductController = async(request,response)=>{
//     try {
//         const {
//             name ,
//             image ,
//             category,
//             subCategory,
//             unit,
//             stock,
//             price,
//             discount,
//             description,
//             more_details,
//         } = request.body

//         if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ){
//             return response.status(400).json({
//                 message : "Enter required fields",
//                 error : true,
//                 success : false
//             })
//         }

//         const product = new ProductModel({
//             name ,
//             image ,
//             category,
//             subCategory,
//             unit,
//             stock,
//             price,
//             discount,
//             description,
//             more_details,
//         })
//         const saveProduct = await product.save()

//         return response.json({
//             message : "Product Created Successfully",
//             data : saveProduct,
//             error : false,
//             success : true
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

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
      more_details,
    } = request.body;

    if (
      !name ||
      !image[0] ||
      !category[0] ||
      !subCategory[0] ||
      !unit ||
      !price ||
      !description
    ) {
      return response.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false,
      });
    }

    // const product = new ProductModel({
    //     name ,
    //     image ,
    //     category,
    //     subCategory,
    //     unit,
    //     stock,
    //     price,
    //     discount,
    //     description,
    //     more_details,
    // })
    // const saveProduct = await product.save()

    const product = executeQuery(
      `insert into product 

        (name ,
        image ,
        category,
        subCategory,
        unit,
        stock,
        price,
        discount,
        description,
        more_details)

        values (?,?,?,?,?,?,?,?,?,?)
        `,
      [
        name,
        image,
        category,
        subCategory,
        unit,
        stock,
        price,
        discount,
        description,
        more_details,
      ]
    );

    console.log(product);

    if (!product) {
      return response.json({
        message: "Failed to create product !",
        data: [],
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Product Created Successfully",
      data: product,
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

// export const getProductController = async (request, response) => {
//   try {
//     let { page, limit, search } = request.body;

//     if (!page) {
//       page = 1;
//     }

//     if (!limit) {
//       limit = 10;
//     }

//     const query = search
//       ? {
//           $text: {
//             $search: search,
//           },
//         }
//       : {};

//     const skip = (page - 1) * limit;

//     const [data, totalCount] = await Promise.all([
//       ProductModel.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("category subCategory"),
//       ProductModel.countDocuments(query),
//     ]);

//     return response.json({
//       message: "Product data",
//       error: false,
//       success: true,
//       totalCount: totalCount,
//       totalNoPage: Math.ceil(totalCount / limit),
//       data: data,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const getProductController = async (request, response) => {
  try {
    let { page, limit, search } = request.body;

    // Set default values
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    const offset = (page - 1) * limit;

    // Prepare search query
    let searchCondition = "";
    let queryParams = [];

    if (search) {
      searchCondition = "WHERE p.name LIKE ? OR p.description LIKE ?";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Fetch products with category and subCategory (JOIN)
    const query = `
      SELECT 
        p.*, 
        c.name AS category_name, 
        sc.name AS subCategory_name 
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      LEFT JOIN sub_categories sc ON p.subCategory = sc.id
      ${searchCondition}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    // Fetch total count
    const countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM products p
      ${searchCondition}
    `;

    const [data, totalCountResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2)), // Remove limit & offset from params
    ]);

    const totalCount = totalCountResult[0].totalCount;

    return response.json({
      message: "Product data",
      error: false,
      success: true,
      totalCount: totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data: data,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// export const getProductByCategory = async (request, response) => {
//   try {
//     const { id } = request.body;

//     if (!id) {
//       return response.status(400).json({
//         message: "provide category id",
//         error: true,
//         success: false,
//       });
//     }

//     const product = await ProductModel.find({
//       category: { $in: id },
//     }).limit(15);

//     return response.json({
//       message: "category product list",
//       data: product,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const getProductByCategory = async (request, response) => {
  try {
    const { id } = request.body;

    if (!id) {
      return response.status(400).json({
        message: "Provide category ID",
        error: true,
        success: false,
      });
    }

    // Fetch products that belong to the given category ID
    const query = `
      SELECT 
        p.*, 
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      WHERE p.category = ?
      LIMIT 15
    `;

    const products = await executeQuery(query, [id]);

    return response.json({
      message: "Category product list",
      data: products,
      error: false,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// export const getProductDetails = async (request, response) => {
//   try {
//     const { productId } = request.body;

//     const product = await ProductModel.findOne({ _id: productId });

//     return response.json({
//       message: "product details",
//       data: product,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const getProductDetails = async (request, response) => {
  try {
    const { productId } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    const query = `SELECT * FROM products WHERE id = ?`;
    const product = await executeQuery(query, [productId]);

    return response.json({
      message: "Product details",
      data: product.length ? product[0] : null,
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

//update product
// export const updateProductDetails = async (request, response) => {
//   try {
//     const { _id } = request.body;

//     if (!_id) {
//       return response.status(400).json({
//         message: "provide product _id",
//         error: true,
//         success: false,
//       });
//     }

//     const updateProduct = await ProductModel.updateOne(
//       { _id: _id },
//       {
//         ...request.body,
//       }
//     );

//     return response.json({
//       message: "updated successfully",
//       data: updateProduct,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const updateProductDetails = async (request, response) => {
  try {
    const { _id, ...updateFields } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide product _id",
        error: true,
        success: false,
      });
    }

    const setClause = Object.keys(updateFields)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updateFields), _id];

    const query = `UPDATE products SET ${setClause} WHERE id = ?`;
    const updateResult = await executeQuery(query, values);

    return response.json({
      message: "Updated successfully",
      data: updateResult,
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

// //delete product
// export const deleteProductDetails = async (request, response) => {
//   try {
//     const { _id } = request.body;

//     if (!_id) {
//       return response.status(400).json({
//         message: "provide _id ",
//         error: true,
//         success: false,
//       });
//     }

//     const deleteProduct = await ProductModel.deleteOne({ _id: _id });

//     return response.json({
//       message: "Product deleted successfully",
//       error: false,
//       success: true,
//       data: deleteProduct,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

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

//search product

// export const searchProduct = async (request, response) => {
//   try {
//     let { search, page, limit } = request.body;

//     if (!page) {
//       page = 1;
//     }
//     if (!limit) {
//       limit = 10;
//     }

//     const query = search
//       ? {
//           $text: {
//             $search: search,
//           },
//         }
//       : {};

//     const skip = (page - 1) * limit;

//     const [data, dataCount] = await Promise.all([
//       ProductModel.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("category subCategory"),
//       ProductModel.countDocuments(query),
//     ]);

//     return response.json({
//       message: "Product data",
//       error: false,
//       success: true,
//       data: data,
//       totalCount: dataCount,
//       totalPage: Math.ceil(dataCount / limit),
//       page: page,
//       limit: limit,
//     });
//   } catch (error) {
//     console.log("Search error: ", error || error.message);
//     return response.status(500).json({
//       message:
//         error.message ||
//         error ||
//         "An unexpected error occured while processing your request",
//       error: true,
//       success: false,
//     });
//   }
// };

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
    console.log("Search error: ", error || error.message);
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

// export const getProductByCategoryAndSubCategory = async (request, response) => {
//   try {
//     const { categoryId, subCategoryId, page, limit } = request.body;

//     if (!categoryId || !subCategoryId) {
//       return response.status(400).json({
//         message: "Provide categoryId and subCategoryId",
//         error: true,
//         success: false,
//       });
//     }

//     if (!page) {
//       page = 1;
//     }

//     if (!limit) {
//       limit = 10;
//     }

//     const query = {
//       category: { $in: categoryId },
//       subCategory: { $in: subCategoryId },
//     };

//     const skip = (page - 1) * limit;

//     const [data, dataCount] = await Promise.all([
//       ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
//       ProductModel.countDocuments(query),
//     ]);

//     return response.json({
//       message: "Product list",
//       data: data,
//       totalCount: dataCount,
//       page: page,
//       limit: limit,
//       success: true,
//       error: false,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const getProductByCategoryAndSubCategory = async (request, response) => {
  try {
    const { categoryId, subCategoryId, page = 1, limit = 10 } = request.body;

    if (!categoryId || !subCategoryId) {
      return response.status(400).json({
        message: "Provide categoryId and subCategoryId",
        error: true,
        success: false,
      });
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM products 
      WHERE category = ? AND subCategory = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS totalCount FROM products 
      WHERE category = ? AND subCategory = ?
    `;

    const [data, dataCount] = await Promise.all([
      executeQuery(query, [categoryId, subCategoryId, parseInt(limit), offset]),
      executeQuery(countQuery, [categoryId, subCategoryId]),
    ]);

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
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

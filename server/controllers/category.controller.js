import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";
import { executeQuery } from "../utils/DBUtils.js";

// export const AddCategoryController = async(request,response)=>{
//     try {
//         const { name , image } = request.body

//         if(!name || !image){
//             return response.status(400).json({
//                 message : "Enter required fields",
//                 error : true,
//                 success : false
//             })
//         }

//         const addCategory = new CategoryModel({
//             name,
//             image
//         })

//         const saveCategory = await addCategory.save()

//         if(!saveCategory){
//             return response.status(500).json({
//                 message : "Not Created",
//                 error : true,
//                 success : false
//             })
//         }

//         return response.json({
//             message : "Category has been created",
//             data : saveCategory,
//             success : true,
//             error : false
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

export const AddCategoryController = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false,
      });
    }

    const query = "INSERT INTO categories (name, image) VALUES (?, ?)";
    const result = await executeQuery(query, [name, image]);

    if (!result.insertId) {
      return res.status(500).json({
        message: "Not Created",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Category has been created",
      data: { id: result.insertId, name, image },
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// export const getCategoryController = async (request, response) => {
//   try {
//     const data = await CategoryModel.find().sort({ createdAt: -1 });

//     return response.json({
//       data: data,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.messsage || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const getCategoryController = async (req, res) => {
  try {
    console.log("gettting categories");
    const query = "SELECT * FROM categories ORDER BY created_at DESC";
    const data = await executeQuery(query);

    return res.json({
      data,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// export const updateCategoryController = async (request, response) => {
//   try {
//     const { _id, name, image } = request.body;

//     const update = await CategoryModel.updateOne(
//       {
//         _id: _id,
//       },
//       {
//         name,
//         image,
//       }
//     );

//     return response.json({
//       message: "Updated Category",
//       success: true,
//       error: false,
//       data: update,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

export const updateCategoryController = async (req, res) => {
  try {
    const { _id, name, image } = req.body;

    if (!_id || !name || !image) {
      return res.status(400).json({
        message: "Missing required fields",
        error: true,
        success: false,
      });
    }

    const query = "UPDATE categories SET name = ?, image = ? WHERE id = ?";
    const update = await executeQuery(query, [name, image, _id]);

    return res.json({
      message: "Updated Category",
      success: true,
      error: false,
      data: update,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// export const deleteCategoryController = async (request, response) => {
//   try {
//     const { _id } = request.body;

//     const checkSubCategory = await SubCategoryModel.find({
//       category: {
//         $in: [_id],
//       },
//     }).countDocuments();

//     const checkProduct = await ProductModel.find({
//       category: {
//         $in: [_id],
//       },
//     }).countDocuments();

//     if (checkSubCategory > 0 || checkProduct > 0) {
//       return response.status(400).json({
//         message: "Category is already use can't delete",
//         error: true,
//         success: false,
//       });
//     }

//     const deleteCategory = await CategoryModel.deleteOne({ _id: _id });

//     return response.json({
//       message: "Category deleted successfully",
//       data: deleteCategory,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       success: false,
//       error: true,
//     });
//   }
// };

export const deleteCategoryController = async (req, res) => {
  try {
    const { _id } = req.body;

    // Check if subcategories exist
    const checkSubCategory = await executeQuery(
      "SELECT COUNT(*) AS count FROM sub_categories WHERE category_id = ?",
      [_id]
    );

    console.log("sb", checkSubCategory);

    // Check if products exist
    const checkProduct = await executeQuery(
      "SELECT COUNT(*) AS count FROM products WHERE JSON_CONTAINS(category, ?, '$')",
      [JSON.stringify(_id)]
    );

    console.log("cp", checkProduct);

    if (checkSubCategory[0].count > 0 || checkProduct[0].count > 0) {
      return res.status(400).json({
        message: "Category is already in use, cannot delete",
        error: true,
        success: false,
      });
    }

    const deleteCategory = await executeQuery(
      "DELETE FROM categories WHERE id = ?",
      [_id]
    );

    return res.json({
      message: "Category deleted successfully",
      data: deleteCategory,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};

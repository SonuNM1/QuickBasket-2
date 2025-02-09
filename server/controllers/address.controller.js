import AddressModel from "../models/address.model.js";
import { executeQuery } from "../utils/DBUtils.js";

export const addAddressController = async (request, response) => {
  try {
    const userId = request.userId; // Retrieved from middleware

    if (!userId) {
      return response.status(401).json({
        message: "Unauthorized: Missing userId",
        error: true,
        success: false,
      });
    }

    const { address_line, city, state, pincode, country, mobile } =
      request.body;

    console.log("new address", request.body);

    if (!mobile || isNaN(Number(mobile))) {
      return response.status(400).json({
        message: "Invalid mobile number",
        error: true,
        success: false,
      });
    }

    // **Insert Address into Database**
    const insertQuery = `
      INSERT INTO address (address_line, city, state, pincode, country, mobile, userId) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      address_line,
      city,
      state,
      pincode,
      country,
      mobile,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return response.status(500).json({
        message: "Failed to create address",
        error: true,
        success: false,
      });
    }

    // Fetch the newly inserted address ID
    const newAddressId = result.insertId;

    // **Update user's `address_details` field (if applicable)**

    return response.json({
      message: "Address Created Successfully",
      error: false,
      success: true,
      data: {
        id: newAddressId,
        address_line,
        city,
        state,
        pincode,
        country,
        mobile,
        userId,
      },
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const getAddressController = async (request, response) => {
  try {
    const userId = request.userId; // Middleware authentication

    const query = `
        SELECT * FROM address 
        WHERE userId = ? 
        ORDER BY created_at DESC
      `;

    const data = await executeQuery(query, [userId]);

    return response.json({
      data,
      message: "List of addresses",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};
export const updateAddressController = async (request, response) => {
  try {
    const userId = request.userId; // Middleware authentication
    const { _id, address_line, city, state, country, pincode, mobile } =
      request.body;

    // Ensure ID is provided

    console.log("update", request.body);
    if (!_id) {
      return response.status(400).json({
        message: "Missing address ID",
        error: true,
        success: false,
      });
    }

    const query = `
        UPDATE address 
        SET address_line = ?, city = ?, state = ?, country = ?, pincode = ?, mobile = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND userId = ?
      `;

    const result = await executeQuery(query, [
      address_line,
      city,
      state,
      country,
      pincode,
      mobile,
      _id,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return response.status(404).json({
        message: "Address not found or not updated",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Address Updated Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const deleteAddresscontroller = async (request, response) => {
  try {
    const userId = request.userId; // Middleware authentication
    const { _id } = request.body;

    // Ensure ID is provided
    if (!_id) {
      return response.status(400).json({
        message: "Missing address ID",
        error: true,
        success: false,
      });
    }

    const query = `
        UPDATE address 
        SET status = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND userId = ?
      `;

    const result = await executeQuery(query, [_id, userId]);

    if (result.affectedRows === 0) {
      return response.status(404).json({
        message: "Address not found or already removed",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Address Removed Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

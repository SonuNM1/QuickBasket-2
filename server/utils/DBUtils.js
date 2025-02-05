import pool from "../config/SqlDB.js";

// Reusable function to handle queries
export const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.query(query, params);

    // Loop through the rows and rename `id` to `_id`
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].id) {
        rows[i]._id = rows[i].id; // Add `_id` field
      }
    }

    console.log(rows);

    return rows;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Reusable function to handle buffer conversion
export const convertBuffers = (data) => {
  return data.map((row) => {
    const newRow = { ...row };
    Object.keys(newRow).forEach((key) => {
      if (Buffer.isBuffer(newRow[key])) {
        newRow[key] = newRow[key].toString(); // Convert buffer to string
      }
    });
    return newRow;
  });
};

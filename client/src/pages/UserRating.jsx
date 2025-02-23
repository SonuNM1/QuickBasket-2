import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import StarIcon from "@mui/icons-material/Star";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";

const labels = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "OK",
  3: "OK+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

const UserRating = ({ initialValue = 2.5, onChange, product_id }) => {
  const [value, setValue] = useState(initialValue);
  const [hover, setHover] = useState(-1);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (product_id) {
      fetchReviews(product_id);
    }
  }, [product_id]); // Runs when product_id changes

  const fetchReviews = async (product_id) => {
    try {
      const res = await Axios({
        ...SummaryApi.fetchRating,
        method: "POST", // Ensure the correct method
        data: { product_id }, // Send product_id in request body
      });

      console.log("res", res);

      setReview(res.data.data?.review);
      setValue(res.data.data?.rating);
    } catch (error) {
      console.log("Fetch reviews error:", error);
      toast.error("Error fetching reviews");
    }
  };

  const handleSubmit = async () => {
    console.log("Rating: ", value);
    console.log("Review: ", review);

    if (review == "" || review == undefined || review == null) {
      toast.alert("review cannot be blank!!");
      return;
    }

    if (!review.trim()) return;

    try {
      await Axios({
        ...SummaryApi.addRating,
        data: {
          product_id: product_id, // set this correctly
          rating: value,
          review: review,
        },
      });

      setReview("");
      toast.success("Review submitted successfully!");
      fetchReviews(product_id); //
    } catch (error) {
      console.log("Error submitting review: ", error || error.message);
      toast.error("Error submitting review.");
    }
  };

  const handleRatingChange = (event, newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: 500,
        margin: "auto",
      }}
    >
      {/* Rating Title */}
      <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
        Rate Your Experience
      </Typography>

      {/* Rating Component */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        <Rating
          name="hover-feedback"
          value={value}
          precision={0.5}
          getLabelText={getLabelText}
          onChange={handleRatingChange}
          onChangeActive={(event, newHover) => setHover(newHover)}
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          size="large"
        />
        {value != null && (
          <Box
            sx={{
              ml: 2,
              fontWeight: "bold",
              minWidth: "75px",
              textAlign: "center",
            }}
          >
            {hover !== -1 ? labels[hover] || labels[value] : labels[value]}
          </Box>
        )}
      </Box>

      {/* Review Input */}
      <TextField
        id="outlined-basic"
        label="Write a Review"
        variant="outlined"
        multiline
        rows={3}
        fullWidth
        sx={{ marginBottom: 2 }}
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      {/* Submit Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{
          width: "100%",
          padding: "10px 0",
          fontSize: "1rem",
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        Submit Review
      </Button>
    </Box>
  );
};

export default UserRating;

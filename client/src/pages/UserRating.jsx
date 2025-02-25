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
import { FaAngleLeft, FaAngleRight } from "react-icons/fa"; // Navigation buttons

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

const UserRating = ({ product_id }) => {
  const [value, setValue] = useState(2.5);
  const [hover, setHover] = useState(-1); // Ensure hover state is working
  const [review, setReview] = useState("");
  const [allReviews, setAllReviews] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0); // Track the visible review

  useEffect(() => {
    if (product_id) {
      fetchAllReviews();
    }
  }, [product_id]);

  // Fetch all ratings & reviews
  const fetchAllReviews = async () => {
    try {
      const res = await Axios({
        ...SummaryApi.fetchAllRatings,
        data: { product_id },
      });

      setAllReviews(res.data.data);
    } catch (error) {
      toast.error("Error fetching reviews");
    }
  };

  // Submit a new review
  const handleSubmit = async () => {
    if (!review.trim()) {
      toast.error("Review cannot be empty!");
      return;
    }

    try {
      await Axios({
        ...SummaryApi.addRating,
        data: { product_id, rating: value, review },
      });

      toast.success("Review submitted successfully!");
      setReview("");
      fetchAllReviews();
    } catch (error) {
      toast.error("Error submitting review!");
    }
  };

  // Edit review
  const editReview = async (reviewId) => {
    try {
      await Axios({
        ...SummaryApi.editRating,
        data: { review_id: reviewId, review: editText },
      });

      toast.success("Review updated successfully!");
      setEditMode(null);
      fetchAllReviews();
    } catch (error) {
      toast.error("Error updating review!");
    }
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    try {
      await Axios({
        ...SummaryApi.deleteRating,
        data: { review_id: reviewId },
      });

      toast.success("Review deleted successfully!");
      fetchAllReviews();
    } catch (error) {
      toast.error("Error deleting review.");
    }
  };

  // Navigation for reviews
  const handleNext = () => {
    if (currentIndex < allReviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <Box
        sx={{ width: "100%", maxWidth: 500, margin: "auto", paddingBottom: 3 }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
          Rate Your Experience
        </Typography>

        {/* Rating Input */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
          <Rating
            name="hover-feedback"
            value={value}
            precision={0.5}
            getLabelText={getLabelText}
            onChange={(event, newValue) => setValue(newValue)}
            onChangeActive={(event, newHover) => setHover(newHover)} // Fix hover state update
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
            }
            size="large"
          />
          {value !== null && (
            <Box
              sx={{
                ml: 2,
                fontWeight: "bold",
                minWidth: "75px",
                textAlign: "center",
              }}
            >
              {hover !== -1 ? labels[hover] || labels[value] : labels[value]}{" "}
              {/* ✅ Fix label display */}
            </Box>
          )}
        </Box>

        {/* Review Input */}
        <TextField
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
          onClick={handleSubmit}
          sx={{
            width: "100%",
            backgroundColor: "#43A047", // Green color
            "&:hover": {
              backgroundColor: "#2E7D32", // Darker green on hover
            },
          }}
        >
          Submit Review
        </Button>
      </Box>

      {/* Reviews Section */}
      <Box className="relative w-full max-w-xl mx-auto mt-6">
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 2 }}
        >
          Customer Reviews
        </Typography>

        {/* Navigation buttons & Reviews */}
        <div className="relative flex items-center">
          {/* Left Button */}
          <button
            className={`absolute left-0 z-10 p-2 bg-gray-200 rounded-full shadow transition hover:bg-gray-300 ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <FaAngleLeft size={24} />
          </button>

          {/* Reviews Carousel */}
          <div className="overflow-hidden w-full px-10">
            <div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {allReviews.map((review, index) => (
                <div
                  key={index}
                  className="min-w-full p-4 border rounded shadow-md"
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {review.username}
                  </Typography>
                  <Rating
                    value={review.rating}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <Typography sx={{ color: "gray" }}>
                    {review.review}
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          {/* Right Button */}
          <button
            className={`absolute right-0 z-10 p-2 bg-gray-200 rounded-full shadow transition hover:bg-gray-300 ${
              currentIndex === allReviews.length - 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleNext}
            disabled={currentIndex === allReviews.length - 1}
          >
            <FaAngleRight size={24} />
          </button>
        </div>

        {/* Pagination Indicator */}
        <Typography
          sx={{
            textAlign: "center",
            marginTop: 2,
            fontWeight: "bold",
            color: "gray",
          }}
        >
          {allReviews.length > 0
            ? `${currentIndex + 1} / ${allReviews.length} reviews`
            : "No reviews yet"}
        </Typography>
      </Box>
    </>
  );
};

export default UserRating;

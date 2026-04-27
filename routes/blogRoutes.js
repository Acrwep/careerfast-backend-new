const express = require("express");
const {
    addBlog,
    updateBlog,
    getBlogs,
    getBlogById,
    deleteBlog
} = require("../controllers/blogController");

const router = express.Router();

// Create
router.post("/add", addBlog);

// Update
router.put("/update/:id", updateBlog);

// Read
router.get("/all-blogs", getBlogs);
router.get("/:id", getBlogById);

// Delete
router.delete("/delete/:id", deleteBlog);

module.exports = router;

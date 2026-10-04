const Category = require("../models/Category");


// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAllCategories();

        res.status(200).json({
            categories
        });
    } catch (error) {
        console.error("Get all categories error:", error);

        res.status(500).json({
            message: "Failed to get categories",
            error: error.message
        });
    }
};


// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);

        if (isNaN(categoryId)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const category = await Category.getCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            category
        });
    } catch (error) {
        console.error("Get category error:", error);

        res.status(500).json({
            message: "Failed to get category",
            error: error.message
        });
    }
};


// Create category
const createCategory = async (req, res) => {
    try {
        const {
            CategoryName,
            Description
        } = req.body;

        if (!CategoryName) {
            return res.status(400).json({
                message: "CategoryName is required"
            });
        }

        const category = await Category.createCategory({
            CategoryName,
            Description
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        console.error("Create category error:", error);

        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
};


// Update category
const updateCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);

        if (isNaN(categoryId)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const {
            CategoryName,
            Description
        } = req.body;

        if (!CategoryName) {
            return res.status(400).json({
                message: "CategoryName is required"
            });
        }

        const existingCategory = await Category.getCategoryById(categoryId);

        if (!existingCategory) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const updatedCategory = await Category.updateCategory(
            categoryId,
            {
                CategoryName,
                Description
            }
        );

        res.status(200).json({
            message: "Category updated successfully",
            category: updatedCategory
        });
    } catch (error) {
        console.error("Update category error:", error);

        res.status(500).json({
            message: "Failed to update category",
            error: error.message
        });
    }
};


// Delete category
const deleteCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);

        if (isNaN(categoryId)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const existingCategory = await Category.getCategoryById(categoryId);

        if (!existingCategory) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        await Category.deleteCategory(categoryId);

        res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Delete category error:", error);

        res.status(500).json({
            message: "Failed to delete category",
            error: error.message
        });
    }
};


module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
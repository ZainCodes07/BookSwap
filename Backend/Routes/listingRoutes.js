const express = require("express");

const {
    getAllListings,
    getListingById,
    getListingsBySeller,
    createListing,
    updateListing,
    deleteListing
} = require("../Controllers/listingController");

const router = express.Router();

router.get("/", getAllListings);
router.get("/seller/:sellerId", getListingsBySeller);
router.get("/:id", getListingById);

router.post("/", createListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

module.exports = router;
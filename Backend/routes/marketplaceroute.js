const express = require("express");
const router = express.Router();

const marketplaceController = require("../controllers/marketplacecontroller");

router.get(
  "/listings",
  marketplaceController.getListings
);

router.get(
  "/listings/:roomUid",
  marketplaceController.getListing
);

router.get(
  "/search",
  marketplaceController.searchListings
);

module.exports = router;
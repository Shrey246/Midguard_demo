const marketplaceService = require("../services/marketplaceservice");


async function getListings(req, res) {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const listings = await marketplaceService.getMarketplaceListings(page, limit);

    res.status(200).json({
      success: true,
      listings
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



async function getListing(req, res) {

  try {

    const { roomUid } = req.params;

    const listing = await marketplaceService.getListingDetails(roomUid);

    res.status(200).json({
      success: true,
      listing
    });

  } catch (error) {

    res.status(404).json({
      success: false,
      message: error.message
    });

  }

}



async function searchListings(req, res) {

  try {

    const { q } = req.query;

    const listings = await marketplaceService.searchMarketplace(q);

    res.status(200).json({
      success: true,
      listings
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



module.exports = {
  getListings,
  getListing,
  searchListings
};
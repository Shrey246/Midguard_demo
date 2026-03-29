const { Room, Asset } = require("../models");
const { Op } = require("sequelize");


/**
 * Get public marketplace listings
 */
async function getMarketplaceListings(page = 1, limit = 20) {

  const offset = (page - 1) * limit;

  const listings = await Room.findAll({

    where: {
      room_type: "public",
      listing_status: "active"
    },

    include: [{
      model: Asset,
      as: "assets",
      attributes: ["asset_uid", "url"]
    }],

    order: [["createdAt", "DESC"]],
    limit,
    offset

  });

  return listings;

}



/**
 * Get single listing details
 */
async function getListingDetails(roomUid) {

  const listing = await Room.findOne({

    where: {
      room_uid: roomUid,
      room_type: "public"
    },

    include: [{
      model: Asset,
      as: "assets"
    }]

  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  return listing;

}



/**
 * Search marketplace
 */
async function searchMarketplace(query) {

  const listings = await Room.findAll({

    where: {
      room_type: "public",
      listing_status: "active",
      title: {
        [Op.iLike]: `%${query}%`
      }
    },

    order: [["createdAt", "DESC"]]

  });

  return listings;

}



module.exports = {
  getMarketplaceListings,
  getListingDetails,
  searchMarketplace
};
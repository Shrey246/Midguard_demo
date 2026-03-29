const tradeService = require("../services/tradeservice");


/**
 * Initiate trade
 */
async function initiateTrade(req, res) {

  try {

    const { sessionId } = req.body;

    const result = await tradeService.initiateTrade(sessionId);

    return res.status(200).json(result);

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



/**
 * Buyer approves trade
 */
async function approveTrade(req, res) {

  try {

    const buyerPublicId = req.user.publicId;
    const { sessionId } = req.body;

    const result = await tradeService.approveTrade(
      sessionId,
      buyerPublicId
    );

    return res.status(200).json(result);

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



/**
 * Seller confirms shipment
 */
async function confirmShipment(req, res) {

  try {

    const sellerPublicId = req.user.publicId;

    const {
      sessionId,
      courierName,
      trackingLink
    } = req.body;

    const result = await tradeService.confirmShipment(
      sessionId,
      sellerPublicId,
      courierName,
      trackingLink
    );

    return res.status(200).json(result);

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



/**
 * Seller confirms digital delivery
 */
async function confirmDigitalDelivery(req, res) {

  try {

    const sellerPublicId = req.user.publicId;
    const { sessionId } = req.body;

    const result = await tradeService.confirmDigitalDelivery(
      sessionId,
      sellerPublicId
    );

    return res.status(200).json(result);

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



/**
 * Buyer confirms delivery
 */
async function confirmDelivery(req, res) {

  try {

    const buyerPublicId = req.user.publicId;
    const { sessionId } = req.body;

    const result = await tradeService.confirmDelivery(
      sessionId,
      buyerPublicId
    );

    return res.status(200).json(result);

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



/**
 * Cancel trade
 */
async function cancelTrade(req, res) {

  try {

    const userPublicId = req.user.publicId;
    const { sessionId } = req.body;

    const result = await tradeService.cancelTrade(
      sessionId,
      userPublicId
    );

    return res.status(200).json(result);

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



/**
 * Raise dispute
 */
async function raiseDispute(req, res) {

  try {

    const userPublicId = req.user.publicId;
    const { sessionId } = req.body;

    const result = await tradeService.raiseDispute(
      sessionId,
      userPublicId
    );

    return res.status(200).json(result);

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



module.exports = {
  initiateTrade,
  approveTrade,
  confirmShipment,
  confirmDigitalDelivery,
  confirmDelivery,
  cancelTrade,
  raiseDispute
};
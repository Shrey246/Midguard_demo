const digitalService = require("../services/digitalservice");


/**
 * Seller uploads digital product
 */
async function uploadDigitalProduct(req, res) {

    try {

        const sellerPublicId = req.user.publicId;
        const { sessionId, assetUid } = req.body;

        const result = await digitalService.uploadDigitalProduct({
            sessionId,
            sellerPublicId,
            assetUid
        });

        return res.status(200).json(result);

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}



/**
 * Buyer downloads digital product
 */
async function downloadDigitalProduct(req, res) {

    try {

        const buyerPublicId = req.user.publicId;
        const { sessionId } = req.params;

        const result = await digitalService.downloadDigitalProduct({
            sessionId,
            buyerPublicId
        });

        return res.status(200).json({
            success: true,
            data: result
        });

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

        const result = await digitalService.confirmDelivery({
            sessionId,
            buyerPublicId
        });

        return res.status(200).json(result);

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

}



module.exports = {
    uploadDigitalProduct,
    downloadDigitalProduct,
    confirmDelivery
};
const disputeService = require("../services/disputeservice");


async function raiseDispute(req, res) {

  try {

    const userId = req.user.publicId;
    const { sessionId, reason, description } = req.body;

    const dispute = await disputeService.raiseDispute(
      sessionId,
      userId,
      reason,
      description
    );

    res.status(201).json({
      success: true,
      dispute
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}


async function resolveDispute(req, res) {

  try {

    const adminId = req.user.publicId;

    const { disputeId, decision } = req.body;

    const dispute = await disputeService.resolveDispute(
      disputeId,
      decision,
      adminId
    );

    res.status(200).json({
      success: true,
      dispute
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}

async function getAllDisputes(req, res) {

  try {

    const disputes = await disputeService.getAllDisputes();

    res.status(200).json({
      success: true,
      disputes
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}

async function getOpenDisputes(req, res) {

  try {

    const disputes = await disputeService.getOpenDisputes();

    res.status(200).json({
      success: true,
      disputes
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}

async function getHighPriorityDisputes(req, res) {

  try {

    const disputes = await disputeService.getHighPriorityDisputes();

    res.status(200).json({
      success: true,
      disputes
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}

async function getDisputeById(req, res) {

  try {

    const { disputeId } = req.params;

    const dispute = await disputeService.getDisputeById(disputeId);

    res.status(200).json({
      success: true,
      dispute
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

}



module.exports = {
  raiseDispute,
  resolveDispute,
  getAllDisputes,
  getOpenDisputes,
  getHighPriorityDisputes,
  getDisputeById
};
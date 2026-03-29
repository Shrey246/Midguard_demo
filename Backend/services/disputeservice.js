// ===============================
// DISPUTE SERVICE
// ===============================

const { Dispute, Order, Escrow } = require("../models");

class DisputeService {

  // =========================
  // CREATE DISPUTE
  // =========================
  static async createDispute({
    order_uid,
    raised_by,
    reason,
    description
  }) {
    if (!order_uid || !raised_by || !reason) {
      throw new Error("MISSING_REQUIRED_FIELDS");
    }

    const order = await Order.findOne({ where: { order_uid } });
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const existing = await Dispute.findOne({
      where: { order_uid }
    });

    if (existing) {
      throw new Error("DISPUTE_ALREADY_EXISTS");
    }

    const dispute = await Dispute.create({
      dispute_id: "DSP_" + Date.now(),
      order_uid,
      raised_by,
      reason,
      description,
      status: "open",
      priority: "medium"
    });

    return dispute;
  }


  // =========================
  // GET ALL DISPUTES
  // =========================
  static async getAllDisputes() {
    return await Dispute.findAll({
      order: [["created_at", "DESC"]]
    });
  }


  // =========================
  // GET OPEN DISPUTES
  // =========================
  static async getOpenDisputes() {
    return await Dispute.findAll({
      where: { status: "open" },
      order: [["created_at", "DESC"]]
    });
  }


  // =========================
  // HIGH PRIORITY DISPUTES
  // =========================
  static async getHighPriorityDisputes() {
    return await Dispute.findAll({
      where: { priority: "high" },
      order: [["created_at", "DESC"]]
    });
  }


  // =========================
  // GET BY ID
  // =========================
  static async getDisputeById(disputeId) {
    const dispute = await Dispute.findOne({
      where: { dispute_id: disputeId }
    });

    if (!dispute) throw new Error("DISPUTE_NOT_FOUND");

    return dispute;
  }


  // =========================
  // RESOLVE DISPUTE
  // =========================
  static async resolveDispute(disputeId, decision, adminId) {
    const dispute = await Dispute.findOne({
      where: { dispute_id: disputeId }
    });

    if (!dispute) throw new Error("DISPUTE_NOT_FOUND");

    if (dispute.status !== "open") {
      throw new Error("DISPUTE_ALREADY_RESOLVED");
    }

    const escrow = await Escrow.findOne({
      where: { order_uid: dispute.order_uid }
    });

    if (!escrow) throw new Error("ESCROW_NOT_FOUND");

    // =========================
    // DECISION LOGIC
    // =========================
    if (decision === "release_to_seller") {
      escrow.status = "released";
    }

    else if (decision === "refund_buyer") {
      escrow.status = "refunded";
    }

    else {
      throw new Error("INVALID_DECISION");
    }

    await escrow.save();

    // =========================
    // UPDATE DISPUTE
    // =========================
    dispute.status = "resolved";
    dispute.resolution = decision;
    dispute.resolved_by = adminId;
    dispute.resolved_at = new Date();

    await dispute.save();

    return {
      dispute,
      escrow
    };
  }
}

module.exports = DisputeService;
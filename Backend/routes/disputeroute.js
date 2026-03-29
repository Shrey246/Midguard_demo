const express = require("express");
const router = express.Router();

const disputeController = require("../controllers/disputecontroller");
const vanguard = require("../vanguard/authguard");


router.post(
  "/raise",
  vanguard,
  disputeController.raiseDispute
);

router.post(
  "/resolve",
  vanguard,
  disputeController.resolveDispute
);

router.get(
  "/all",
  vanguard,
  disputeController.getAllDisputes
);

router.get(
  "/open",
  vanguard,
  disputeController.getOpenDisputes
);

router.get(
  "/high-priority",
  vanguard,
  disputeController.getHighPriorityDisputes
);

router.get(
  "/:disputeId",
  vanguard,
  disputeController.getDisputeById
);

module.exports = router;
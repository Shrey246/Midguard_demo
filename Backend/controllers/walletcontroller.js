// backend/controllers/walletcontroller.js
const WalletService = require('../services/walletservice');

class WalletController {

  // GET /wallet
  static async getWallet(req, res) {
    try {
      const wallet = await WalletService.getWallet(req.user.publicId);

      return res.status(200).json({
        success: true,
        data: wallet || {
          available_balance: 0,
          locked_balance: 0
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'FAILED_TO_FETCH_WALLET'
      });
    }
  }

  // POST /wallet/topup
  static async topUp(req, res) {
    try {
      const { amount } = req.body;

      const wallet = await WalletService.topUpWallet(
        req.user.publicId,
        Number(amount)
      );

      return res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ FIXED: GET /wallet/ledger
  static async getLedger(req, res) {
    try {
     const userId = req.user.publicId;

      const transactions = await WalletService.getLedger(userId);

      return res.status(200).json({
        success: true,
        transactions,
      });
    } catch (err) {
      console.error("Ledger Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}

module.exports = WalletController;
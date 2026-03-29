const { Wallet, WalletTransaction, sequelize } = require('../models');
const { ulid } = require('ulid');
const notificationService = require("./notificationservice");
const { Sequelize } = require('sequelize');

class WalletService {

  // 🔹 Ensure wallet exists (safe + locked)
  static async getOrCreateWallet(userPublicId, transaction = null) {
    let wallet = await Wallet.findOne({
      where: { user_public_id: userPublicId },
      transaction,
      lock: transaction ? Sequelize.Transaction.LOCK.UPDATE : undefined
    });

    if (!wallet) {
      wallet = await Wallet.create(
        { user_public_id: userPublicId },
        { transaction }
      );
    }

    return wallet;
  }

  // 🔹 TOP-UP
  static async topUpWallet(userPublicId, amount) {
    if (Number(amount) <= 0) {
      throw new Error('INVALID_TOPUP_AMOUNT');
    }

    return sequelize.transaction(async (t) => {
      const wallet = await this.getOrCreateWallet(userPublicId, t);

      wallet.available_balance =
        Number(wallet.available_balance) + Number(amount);

      await wallet.save({ transaction: t });

      await WalletTransaction.create({
        transaction_uid: ulid(),
        user_public_id: userPublicId,
        amount,
        transaction_type: 'credit',
        reference_type: 'topup',
        reference_id: null
      }, { transaction: t });

      await notificationService.createNotification(
        userPublicId,
        "wallet_topup",
        "Wallet Credited",
        `Your wallet has been credited with ${amount}.`,
        "wallet",
        userPublicId
      );

      return wallet;
    });
  }

  // 🔹 LOCK FUNDS (for bidding)
  static async lockFunds(userPublicId, amount, referenceId) {
    if (Number(amount) <= 0) {
      throw new Error('INVALID_LOCK_AMOUNT');
    }

    return sequelize.transaction(async (t) => {
      const wallet = await this.getOrCreateWallet(userPublicId, t);

      if (Number(wallet.available_balance) < Number(amount)) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      wallet.available_balance -= Number(amount);
      wallet.locked_balance += Number(amount);

      await wallet.save({ transaction: t });

      await WalletTransaction.create({
        transaction_uid: ulid(),
        user_public_id: userPublicId,
        amount,
        transaction_type: 'lock',
        reference_type: 'bid',
        reference_id: referenceId
      }, { transaction: t });

      return wallet;
    });
  }

  // 🔹 UNLOCK FUNDS
  static async unlockFunds(userPublicId, amount, referenceId) {
    if (Number(amount) <= 0) {
      throw new Error('INVALID_UNLOCK_AMOUNT');
    }

    return sequelize.transaction(async (t) => {
      const wallet = await this.getOrCreateWallet(userPublicId, t);

      if (Number(wallet.locked_balance) < Number(amount)) {
        throw new Error('INVALID_UNLOCK_OPERATION');
      }

      wallet.locked_balance -= Number(amount);
      wallet.available_balance += Number(amount);

      await wallet.save({ transaction: t });

      await WalletTransaction.create({
        transaction_uid: ulid(),
        user_public_id: userPublicId,
        amount,
        transaction_type: 'unlock',
        reference_type: 'bid',
        reference_id: referenceId
      }, { transaction: t });

      return wallet;
    });
  }

  // 🔒 AVAILABLE → ESCROW (BUY NOW)
  static async availableToEscrow(userPublicId, amount, sessionId, transaction) {

    const wallet = await Wallet.findOne({
      where: { user_public_id: userPublicId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!wallet) throw new Error('WALLET_NOT_FOUND');

    if (Number(wallet.available_balance) < Number(amount)) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    wallet.available_balance -= Number(amount);

    await wallet.save({ transaction });

    await WalletTransaction.create({
      transaction_uid: ulid(),
      user_public_id: userPublicId,
      amount,
      transaction_type: 'escrow_in',
      reference_type: 'escrow',
      reference_id: sessionId
    }, { transaction });

    return true;
  }

  // 🔒 LOCKED → ESCROW (AUCTION)
  static async lockedToEscrow(userPublicId, amount, sessionId, transaction) {

    const wallet = await Wallet.findOne({
      where: { user_public_id: userPublicId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!wallet) throw new Error('WALLET_NOT_FOUND');

    if (Number(wallet.locked_balance) < Number(amount)) {
      throw new Error('INSUFFICIENT_LOCKED_BALANCE');
    }

    wallet.locked_balance -= Number(amount);

    await wallet.save({ transaction });

    await WalletTransaction.create({
      transaction_uid: ulid(),
      user_public_id: userPublicId,
      amount,
      transaction_type: 'escrow_in',
      reference_type: 'escrow',
      reference_id: sessionId
    }, { transaction });

    return true;
  }

  // 🔹 CREDIT SELLER (escrow release)
  static async creditSeller(userPublicId, amount, transaction) {

    const wallet = await Wallet.findOne({
      where: { user_public_id: userPublicId },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE
    });

    if (!wallet) throw new Error('WALLET_NOT_FOUND');

    wallet.available_balance += Number(amount);

    await wallet.save({ transaction });

    await WalletTransaction.create({
      transaction_uid: ulid(),
      user_public_id: userPublicId,
      amount,
      transaction_type: 'credit',
      reference_type: 'escrow',
      reference_id: null
    }, { transaction });

    return true;
  }

  // 🔹 GET WALLET
  static async getWallet(userPublicId) {
    return Wallet.findOne({
      where: { user_public_id: userPublicId }
    });
  }

  // 🔹 GET LEDGER
  static async getLedger(userPublicId) {
    return WalletTransaction.findAll({
      where: { user_public_id: userPublicId },
      order: [['created_at', 'DESC']]
    });
  }

  // =========================
  // 🔻 ADMIN DEBIT WALLET
  // =========================
  static async adminDebitWallet(userPublicId, amount, reason = "admin_adjustment") {

    if (Number(amount) <= 0) {
      throw new Error("INVALID_DEBIT_AMOUNT");
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error("DEBIT_REASON_REQUIRED");
    }

    return sequelize.transaction(async (t) => {

      const wallet = await this.getOrCreateWallet(userPublicId, t);

      if (Number(wallet.available_balance) < Number(amount)) {
        throw new Error("INSUFFICIENT_FUNDS_FOR_DEBIT");
      }

      wallet.available_balance -= Number(amount);

      await wallet.save({ transaction: t });

      await WalletTransaction.create({
        transaction_uid: ulid(),
        user_public_id: userPublicId,
        amount,
        transaction_type: "debit",
        reference_type: reason,
        reference_id: null
      }, { transaction: t });

      return wallet;

    }).then(async (wallet) => {

      // ✅ Notify AFTER successful commit
      await notificationService.createNotification(
        userPublicId,
        "wallet_debited",
        "Wallet Debited",
        `An amount of ${amount} has been deducted from your wallet.`,
        "wallet",
        userPublicId
      );

      return wallet;
    });
  }

}

module.exports = WalletService;
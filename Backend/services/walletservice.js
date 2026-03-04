// backend/services/walletservice.js

const { Wallet, WalletTransaction, sequelize } = require('../models');
const { ulid } = require('ulid');

class WalletService {

  // 🔹 Ensure wallet exists (lazy creation)
  static async getOrCreateWallet(userPublicId, transaction = null) {
    let wallet = await Wallet.findOne({
      where: { user_public_id: userPublicId },
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined
    });

    if (!wallet) {
      wallet = await Wallet.create(
        { user_public_id: userPublicId },
        { transaction }
      );
    }

    return wallet;
  }

  // 🔹 MOCK TOP-UP (replace trigger later with Razorpay)
  static async topUpWallet(userPublicId, amount) {
    if (amount <= 0) {
      throw new Error('INVALID_TOPUP_AMOUNT');
    }

    return sequelize.transaction(async (t) => {
      const wallet = await this.getOrCreateWallet(userPublicId, t);

      wallet.available_balance =
        Number(wallet.available_balance) + Number(amount);

      await wallet.save({ transaction: t });

      await WalletTransaction.create(
        {
          transaction_uid: ulid(),
          user_public_id: userPublicId,
          amount,
          transaction_type: 'credit',
          reference_type: 'topup',
          reference_id: null
        },
        { transaction: t }
      );

      return wallet;
    });
  }

  // 🔹 Lock money (used by bidding)
  static async lockFunds(userPublicId, amount, referenceId) {
    if (amount <= 0) {
      throw new Error('INVALID_LOCK_AMOUNT');
    }

    return sequelize.transaction(async (t) => {
      const wallet = await this.getOrCreateWallet(userPublicId, t);

      if (Number(wallet.available_balance) < amount) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      wallet.available_balance =
        Number(wallet.available_balance) - Number(amount);

      wallet.locked_balance =
        Number(wallet.locked_balance) + Number(amount);

      await wallet.save({ transaction: t });

      await WalletTransaction.create(
        {
          transaction_uid: ulid(),
          user_public_id: userPublicId,
          amount,
          transaction_type: 'lock',
          reference_type: 'bid',
          reference_id: referenceId
        },
        { transaction: t }
      );

      return wallet;
    });
  }

  // 🔹 Unlock money (outbid / bid cancelled)
  static async unlockFunds(userPublicId, amount, referenceId) {
    if (amount <= 0) {
      throw new Error('INVALID_UNLOCK_AMOUNT');
    }

    return sequelize.transaction(async (t) => {
      const wallet = await this.getOrCreateWallet(userPublicId, t);

      if (Number(wallet.locked_balance) < amount) {
        throw new Error('INVALID_UNLOCK_OPERATION');
      }

      wallet.locked_balance =
        Number(wallet.locked_balance) - Number(amount);

      wallet.available_balance =
        Number(wallet.available_balance) + Number(amount);

      await wallet.save({ transaction: t });

      await WalletTransaction.create(
        {
          transaction_uid: ulid(),
          user_public_id: userPublicId,
          amount,
          transaction_type: 'unlock',
          reference_type: 'bid',
          reference_id: referenceId
        },
        { transaction: t }
      );

      return wallet;
    });
  }

  // 🔹 Read-only wallet fetch
  static async getWallet(userPublicId) {
    return Wallet.findOne({
      where: { user_public_id: userPublicId }
    });
  }


  // 🔒 Move available funds directly into escrow (public buy-now)
  static async availableToEscrow(userPublicId, amount, sessionId) {
    return sequelize.transaction(async (t) => {

      const wallet = await Wallet.findOne({
        where: { user_public_id: userPublicId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!wallet) {
        throw new Error('WALLET_NOT_FOUND');
      }

      if (Number(wallet.available_balance) < Number(amount)) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // Deduct from available balance
      await wallet.update(
        {
          available_balance:
            Number(wallet.available_balance) - Number(amount)
        },
        { transaction: t }
      );

      // Record escrow transaction
      await WalletTransaction.create(
        {
          transaction_uid: ulid(),
          user_public_id: userPublicId,
          amount: amount,
          transaction_type: 'escrow_hold',
          reference_id: sessionId,
          reference_type: 'order',
          status: 'completed'
        },
        { transaction: t }
      );

      return true;
    });
  }


  // 🔒 Move locked funds into escrow (after bid confirmation)
static async lockedToEscrow(userPublicId, amount, sessionId) {
  return sequelize.transaction(async (t) => {

    const wallet = await Wallet.findOne({
      where: { user_public_id: userPublicId },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!wallet) {
      throw new Error('WALLET_NOT_FOUND');
    }

    if (Number(wallet.locked_balance) < Number(amount)) {
      throw new Error('INSUFFICIENT_LOCKED_BALANCE');
    }

    // Reduce locked balance
    await wallet.update(
      {
        locked_balance:
          Number(wallet.locked_balance) - Number(amount)
      },
      { transaction: t }
    );

    // Record transaction
    await WalletTransaction.create(
      {
        transaction_uid: ulid(),
        user_public_id: userPublicId,
        amount: amount,
        transaction_type: 'escrow_hold',
        reference_id: sessionId,
        reference_type: 'order',
        status: 'completed'
      },
      { transaction: t }
    );

    return true;
  });
}

  // 🔹 Credit seller after escrow release (internal use, same transaction)
  static async creditSeller(userPublicId, amount, transaction) {
    const wallet = await Wallet.findOne({
      where: { user_public_id: userPublicId },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!wallet) {
      throw new Error('WALLET_NOT_FOUND');
    }

    await wallet.update(
      {
        available_balance:
          Number(wallet.available_balance) + Number(amount)
      },
      { transaction }
    );

    await WalletTransaction.create(
      {
        transaction_uid: ulid(),
        user_public_id: userPublicId,
        amount: amount,
        transaction_type: 'credit',
        reference_type: 'escrow_release',
        reference_id: null,
        status: 'completed'
      },
      { transaction }
    );

    return true;
  }


}

module.exports = WalletService;

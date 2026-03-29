const {
  Message,
  MessageAttachment,
  Escrow
} = require("../models");

const { ulid } = require("ulid");

class MessageService {

  // =========================
  // HELPERS
  // =========================

  static _clean(value) {
    return typeof value === "string" ? value.trim() : value;
  }

  static _toPlain(message) {
    if (!message) return null;
    return message.get ? message.get({ plain: true }) : message;
  }

  // ✅ ONLY ESCROW VALIDATION
  static async _getEscrowOrThrow(sessionUid) {
    const escrow = await Escrow.findOne({
      where: { session_id: this._clean(sessionUid) }
    });

    if (!escrow) throw new Error("Session not found");

    if (
      escrow.escrow_status === "cancelled" ||
      escrow.escrow_status === "completed"
    ) {
      throw new Error("Session is closed");
    }

    return escrow;
  }

  // ✅ VALIDATE USER USING ESCROW (NO PARTICIPANT TABLE)
  static _ensureUserInEscrow(escrow, senderId) {
    if (
      escrow.buyer_public_id !== senderId &&
      escrow.seller_public_id !== senderId
    ) {
      throw new Error("Not allowed in this session");
    }
  }

  // =========================
  // CORE CREATION
  // =========================

  static async _createMessage({
    sessionUid,
    senderId,
    messageType,
    body = null,
    bypassUserCheck = false
  }) {
    const escrow = await this._getEscrowOrThrow(sessionUid);

    if (!bypassUserCheck) {
      this._ensureUserInEscrow(escrow, senderId);
    }

    const message = await Message.create({
      message_uid: ulid(),
      session_id: this._clean(sessionUid),
      sender_public_id: this._clean(senderId),
      message_type: messageType,
      body
    });

    return this._toPlain(message);
  }

  // =========================
  // PUBLIC METHODS
  // =========================

  static async sendTextMessage({ sessionUid, senderId, body }) {
    if (!body || body.trim().length === 0) {
      throw new Error("Message body cannot be empty");
    }

    const message = await this._createMessage({
      sessionUid,
      senderId,
      messageType: "text",
      body
    });

    return {
      message,
      attachments: []
    };
  }

  static async sendSystemMessage(sessionUid, body) {
    if (!body || body.trim().length === 0) {
      throw new Error("System message body cannot be empty");
    }

    const message = await this._createMessage({
      sessionUid,
      senderId: "SYSTEM",
      messageType: "system",
      body,
      bypassUserCheck: true
    });

    return {
      message,
      attachments: []
    };
  }

  static async sendAttachmentMessage({
    sessionUid,
    senderId,
    attachment
  }) {
    if (!attachment) {
      throw new Error("Attachment data missing");
    }

    const { type, fileName, filePath, mimeType, fileSize } = attachment;

    if (!["image", "document"].includes(type)) {
      throw new Error("Invalid attachment type");
    }

    const message = await this._createMessage({
      sessionUid,
      senderId,
      messageType: type,
      body: null
    });

    const attachmentRow = await MessageAttachment.create({
      attachment_uid: ulid(),
      message_uid: message.message_uid,
      session_id: this._clean(sessionUid),
      file_name: fileName,
      file_path: filePath,
      mime_type: mimeType,
      file_size: fileSize
    });

    return {
      message,
      attachments: [this._toPlain(attachmentRow)]
    };
  }

  // =========================
  // FETCH
  // =========================

  static async getMessages(sessionUid) {
    await this._getEscrowOrThrow(sessionUid);

    const messages = await Message.findAll({
      where: {
        session_id: this._clean(sessionUid)
      },
      include: [
        {
          model: MessageAttachment,
          as: "attachments"
        }
      ],
      order: [["created_at", "ASC"]]
    });

    return messages.map((m) => this._toPlain(m));
  }
}

module.exports = MessageService;
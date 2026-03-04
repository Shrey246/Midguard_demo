const {
  Message,
  MessageAttachment,
  Session,
  SessionParticipant
} = require("../models");

const { ulid } = require("ulid");

class MessageService {

  // =========================
  // INTERNAL HELPERS
  // =========================

  static _clean(value) {
    return typeof value === "string" ? value.trim() : value;
  }

  static async _getSessionOrThrow(sessionUid) {
    const session = await Session.findOne({
      where: { session_uid: this._clean(sessionUid) }
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "active") {
      throw new Error("Session is closed");
    }

    return session;
  }

  static async _ensureParticipant(sessionUid, senderId) {
    const participant = await SessionParticipant.findOne({
      where: {
        session_uid: this._clean(sessionUid),
        user_public_id: this._clean(senderId)
      }
    });

if (!participant) {
  throw new Error("Not a session participant");
}


    return participant;
  }

  // =========================
  // MESSAGE CREATION CORE
  // =========================

  static async _createMessage({
    sessionUid,
    senderId,
    messageType,
    body = null,
    bypassParticipantCheck = false
  }) {
    await this._getSessionOrThrow(sessionUid);

    if (!bypassParticipantCheck) {
      await this._ensureParticipant(sessionUid, senderId);
    }

    const message = await Message.create({
      message_uid: ulid(),
      session_uid: this._clean(sessionUid),
      sender_public_id: this._clean(senderId),
      message_type: messageType,
      body
    });

    return message;
  }

  // =========================
  // PUBLIC METHODS
  // =========================

  // ---- TEXT MESSAGE ----
  static async sendTextMessage({ sessionUid, senderId, body }) {
    if (!body || body.trim().length === 0) {
      throw new Error("Message body cannot be empty");
    }

    return this._createMessage({
      sessionUid,
      senderId,
      messageType: "text",
      body
    });
  }

  // ---- SYSTEM MESSAGE ----
  static async sendSystemMessage(sessionUid, body) {
    if (!body || body.trim().length === 0) {
      throw new Error("System message body cannot be empty");
    }

    return this._createMessage({
      sessionUid,
      senderId: "SYSTEM",
      messageType: "system",
      body,
      bypassParticipantCheck: true
    });
  }

  // ---- ATTACHMENT MESSAGE (IMAGE / DOCUMENT) ----
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
      session_uid: this._clean(sessionUid),
      file_name: fileName,
      file_path: filePath,
      mime_type: mimeType,
      file_size: fileSize
    });

    return {
      message,
      attachment: attachmentRow
    };
  }

  // ---- FETCH MESSAGES ----
  static async getMessages(sessionUid) {
    await this._getSessionOrThrow(sessionUid);

    const messages = await Message.findAll({
      where: {
        session_uid: this._clean(sessionUid)
      },
      include: [
        {
          model: MessageAttachment,
          as: "attachments"
        }
      ],
      order: [["id", "ASC"]]
    });

    return messages;
  }
}

module.exports = MessageService;

const MessageService = require("../services/messageservice");

class MessageController {

  // =========================
  // SEND TEXT MESSAGE
  // =========================
  static async sendText(req, res) {
    try {
      const { body, message, message_text } = req.body;
      const sessionUid = req.params.session_id;

      const finalBody = body || message || message_text;

      // ✅ VALIDATION
      if (!finalBody || typeof finalBody !== "string" || finalBody.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Message body cannot be empty"
        });
      }

      if (!sessionUid) {
        return res.status(400).json({
          success: false,
          error: "Session ID is required"
        });
      }

      const result = await MessageService.sendTextMessage({
        sessionUid,
        senderId: req.user.publicId,
        body: finalBody.trim()
      });

      return res.status(201).json({
        success: true,
        data: result // { message, attachments }
      });

    } catch (err) {
      console.error("❌ sendText error:", err.message);

      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // =========================
  // GET MESSAGES
  // =========================
  static async getMessages(req, res) {
    try {
      const sessionUid = req.params.session_id;

      if (!sessionUid) {
        return res.status(400).json({
          success: false,
          error: "Session ID is required"
        });
      }

      const messages = await MessageService.getMessages(sessionUid);

      return res.status(200).json({
        success: true,
        data: messages || []
      });

    } catch (err) {
      console.error("❌ getMessages error:", err.message);

      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}

module.exports = MessageController;
const MessageService = require("../services/messageservice");

class MessageController {
  static async sendText(req, res) {
    try {
      const { body } = req.body;
      const { sessionUid } = req.params;

      const message = await MessageService.sendTextMessage({
        sessionUid,
        senderId: req.user.publicId,
        body
      });

      res.status(201).json({ success: true, data: message });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getMessages(req, res) {
    try {
      const messages = await MessageService.getMessages(
        req.params.sessionUid
      );
      res.json({ success: true, data: messages });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  }
}

module.exports = MessageController;

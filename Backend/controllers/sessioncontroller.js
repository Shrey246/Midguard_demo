const SessionService = require("../services/sessionservice");

class SessionController {
  static async createSession(req, res) {
    try {
      const { sessionType, participants } = req.body;

      const session = await SessionService.createSession({
        sessionType,
        createdBy: req.user.publicId,
        participants,
      });

      res.status(201).json({ success: true, data: session });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getSession(req, res) {
    try {
      const session = await SessionService.getSession(req.params.sessionUid);
      res.json({ success: true, data: session });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  static async getMySessions(req, res) {
    try {
      const sessions = await SessionService.getUserSessions(
        req.user.publicId
      );
      res.json({ success: true, data: sessions });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async closeSession(req, res) {
    try {
      const session = await SessionService.closeSession(
        req.params.sessionUid,
        req.user.publicId
      );

      res.json({ success: true, data: session });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

module.exports = SessionController;

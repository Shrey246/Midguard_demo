const { Session, SessionParticipant } = require("../models");
const { ulid } = require("ulid");
const notificationService = require("./notificationservice");

class SessionService {
  static async createSession({ sessionType, createdBy, participants }) {
    const sessionUid = ulid();

    const session = await Session.create({
      session_id: sessionUid,
      session_type: sessionType,
      created_by: createdBy,
    });

    const participantRows = participants.map((p) => ({
      session_id: sessionUid,
      user_public_id: p.userPublicId,
      role: p.role,
    }));

    await SessionParticipant.bulkCreate(participantRows);

    return {
      session_id: sessionUid,
      session_type: sessionType,
      status: session.status,
      participants: participantRows,
    };
  }

  static async getSession(sessionUid) {
    const session = await Session.findOne({
      where: { session_id: sessionUid },
      include: [
        {
          model: SessionParticipant,
          as: 'participants',
        },
      ],
    });

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }

  static async getUserSessions(userPublicId) {
    const sessions = await SessionParticipant.findAll({
      where: { user_public_id: userPublicId },
      include: [{ model: Session }],
    });

    return sessions;
  }

  static async closeSession(sessionUid, requesterPublicId) {
    const session = await Session.findOne({
      where: { session_id: sessionUid },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status === "closed") {
      throw new Error("Session already closed");
    }

    if (session.created_by !== requesterPublicId) {
      throw new Error("Only creator can close session");
    }

    session.status = "closed";
    await session.save();

    const participants = await SessionParticipant.findAll({
  where: { session_id: sessionUid }
});

    for (const p of participants) {
      await notificationService.createNotification(
        p.user_public_id,
        "session_closed",
        "Session Closed",
        "This trade session has been closed.",
        "session",
        sessionUid
      );
    }
    return session;
  }
}

module.exports = SessionService;

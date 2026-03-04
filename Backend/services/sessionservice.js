const { Session, SessionParticipant } = require("../models");
const { ulid } = require("ulid");

class SessionService {
  static async createSession({ sessionType, createdBy, participants }) {
    const sessionUid = ulid();

    const session = await Session.create({
      session_uid: sessionUid,
      session_type: sessionType,
      created_by: createdBy,
    });

    const participantRows = participants.map((p) => ({
      session_uid: sessionUid,
      user_public_id: p.userPublicId,
      role: p.role,
    }));

    await SessionParticipant.bulkCreate(participantRows);

    return {
      session_uid: sessionUid,
      session_type: sessionType,
      status: session.status,
      participants: participantRows,
    };
  }

  static async getSession(sessionUid) {
    const session = await Session.findOne({
      where: { session_uid: sessionUid },
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
      where: { session_uid: sessionUid },
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

    return session;
  }
}

module.exports = SessionService;

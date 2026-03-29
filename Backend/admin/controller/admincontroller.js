const AdminService = require("../service/adminservice");

class AdminController {

  // helper to extract metadata
  static getMeta(req) {
    return {
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    };
  }

  // ================= ROOM =================

  static async getRooms(req, res) {
    try {
      const adminId = req.user.admin_id;

      const filters = {
        status: req.query.status,
        type: req.query.type
      };

      const data = await AdminService.getAllRooms(
        adminId,
        filters,
        this.getMeta(req)
      );

      return res.json(data);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async activateRoom(req, res) {
    try {
      const adminId = req.user.admin_id;
      const { roomUid } = req.params;

      const result = await AdminService.forceActivateRoom(
        adminId,
        roomUid,
        this.getMeta(req)
      );

      return res.json(result);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async cancelRoom(req, res) {
    try {
      const adminId = req.user.admin_id;
      const { roomUid } = req.params;

      const result = await AdminService.forceCancelRoom(
        adminId,
        roomUid,
        this.getMeta(req)
      );

      return res.json(result);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ================= ORDER =================

  static async getOrders(req, res) {
    try {
      const adminId = req.user.admin_id;

      const filters = {
        status: req.query.status,
        payment_status: req.query.payment_status
      };

      const data = await AdminService.getAllOrders(
        adminId,
        filters,
        this.getMeta(req)
      );

      return res.json(data);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ================= ESCROW =================

  static async releaseEscrow(req, res) {
    try {
      const adminId = req.user.admin_id;
      const { sessionId } = req.params;

      const result = await AdminService.forceReleaseEscrow(
        adminId,
        sessionId,
        this.getMeta(req)
      );

      return res.json(result);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ================= WALLET =================

  static async adjustWallet(req, res) {
    try {
      const adminId = req.user.admin_id;

      const { userPublicId, amount, type } = req.body;

      const result = await AdminService.adjustWallet(
        adminId,
        userPublicId,
        amount,
        type,
        this.getMeta(req)
      );

      return res.json(result);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ================= DISPUTE =================

  static async resolveDispute(req, res) {
    try {
      const adminId = req.user.admin_id;

      const { disputeId, decision } = req.body;

      const result = await AdminService.resolveDispute(
        adminId,
        disputeId,
        decision,
        this.getMeta(req)
      );

      return res.json(result);

    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
static async getDisputes(req, res) {
  try {
    const adminId = req.user.admin_id;

    const data = await AdminService.getAllDisputes(
      adminId,
      this.getMeta(req)
    );

    return res.json(data);

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ================= ADMIN MANAGEMENT =================

static async createAdmin(req, res) {
  try {
    const adminId = req.user.admin_id;

    const { email, password, role } = req.body;

    const result = await AdminService.createAdmin(
      adminId,
      { email, password, role },
      this.getMeta(req)
    );

    return res.json({
      success: true,
      admin: {
        id: result.admin_id,
        email: result.email,
        role: result.role
      }
    });

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ================= USERS =================

static async getUsers(req, res) {
  try {
    const adminId = req.user.admin_id;

    const data = await AdminService.getAllUsers(
      adminId,
      this.getMeta(req)
    );

    return res.json(data);

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

static async getUser(req, res) {
  try {
    const adminId = req.user.admin_id;
    const { userId } = req.params;

    const data = await AdminService.getUserById(
      adminId,
      userId,
      this.getMeta(req)
    );

    return res.json(data);

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}


}



module.exports = AdminController;
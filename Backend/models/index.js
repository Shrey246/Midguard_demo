const { Sequelize, DataTypes, Op } = require('sequelize');

// 🔧 DB CONFIG
const sequelize = new Sequelize(
  'midguard-final',
  'root',
  '',
  {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false,

    define: {
      freezeTableName: true,
      underscored: true
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// ================= IMPORT MODELS =================
const UserModel = require('./user');
const RoomModel = require('./room');
const WalletModel = require('./wallet');
const WalletTransactionModel = require('./wallettransaction');
const BidModel = require('./bid');
const OrderModel = require('./order');
const EscrowModel = require('./escrow');
const SessionModel = require('./session');
const SessionParticipantModel = require('./sessionparticipant');
const MessageModel = require('./message');
const MessageAttachmentModel = require('./message_attachments');
const AssetModel = require('./assets');
const UserAddressModel = require('./useraddress');
const OrderAddressModel = require('./orderaddress');
const NotificationModel = require("./notification");
const DisputeModel = require("./dispute");
const WishlistModel = require('./wishlist');
const AdminModel = require("./admin");
const AdminLogModel = require("./adminlog");

// ================= INIT MODELS =================
const User = UserModel(sequelize, DataTypes);
const Room = RoomModel(sequelize, DataTypes);
const Wallet = WalletModel(sequelize, DataTypes);
const WalletTransaction = WalletTransactionModel(sequelize, DataTypes);
const Bid = BidModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const Escrow = EscrowModel(sequelize, DataTypes);
const Session = SessionModel(sequelize, DataTypes);
const SessionParticipant = SessionParticipantModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const MessageAttachment = MessageAttachmentModel(sequelize, DataTypes);
const Asset = AssetModel(sequelize, DataTypes);
const UserAddress = UserAddressModel(sequelize, DataTypes);
const OrderAddress = OrderAddressModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const Dispute = DisputeModel(sequelize, DataTypes);
const Wishlist = WishlistModel(sequelize, DataTypes);
const Admin = AdminModel(sequelize, DataTypes);
const AdminLog = AdminLogModel(sequelize, DataTypes);

// ================= BLACKLIST MODEL =================
const BlacklistedToken = sequelize.define("BlacklistedToken", {
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  expires_at: { // ✅ FIXED
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: "blacklisted_tokens",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
  indexes: [
    { fields: ["token"] },
    { fields: ["expires_at"] } // ✅ FIXED
  ]
});

// ================= ASSOCIATIONS =================
function applyAssociations() {

  // Session
  Session.hasMany(SessionParticipant, { foreignKey: 'session_uid', sourceKey: 'session_uid', as: 'participants' });
  SessionParticipant.belongsTo(Session, { foreignKey: 'session_uid', targetKey: 'session_uid' });

  Session.hasMany(Message, { foreignKey: 'session_uid', sourceKey: 'session_uid', as: 'messages' });
  Message.belongsTo(Session, { foreignKey: 'session_uid', targetKey: 'session_uid' });

  Message.hasMany(MessageAttachment, { foreignKey: 'message_uid', sourceKey: 'message_uid', as: 'attachments' });
  MessageAttachment.belongsTo(Message, { foreignKey: 'message_uid', targetKey: 'message_uid' });

  // Order
  Order.belongsTo(Room, { foreignKey: "room_uid", targetKey: "room_uid" });
  Room.hasMany(Order, { foreignKey: "room_uid", sourceKey: "room_uid" });

  Order.hasOne(Escrow, { foreignKey: "order_uid", sourceKey: "order_uid" });
  Escrow.belongsTo(Order, { foreignKey: "order_uid", targetKey: "order_uid" });

  // Wishlist
  Wishlist.belongsTo(Room, { foreignKey: "room_uid", targetKey: "room_uid" });
  Wishlist.belongsTo(User, { foreignKey: "user_public_id", targetKey: "publicId" });

  // Admin
  Admin.hasMany(AdminLog, { foreignKey: "admin_id", as: "logs" });
  AdminLog.belongsTo(Admin, { foreignKey: "admin_id", as: "admin" });
}


applyAssociations();

// ================= DB CONNECTION =================
sequelize.authenticate()
  .then(() => console.log('Database connected ✅'))
  .catch(err => console.error('DB connection failed ❌', err));

// 

// ================= CLEANUP =================
const cleanExpiredTokens = async () => {
  try {
    await BlacklistedToken.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });
  } catch (err) {
    console.error("Blacklist cleanup error:", err.message);
  }
};

setInterval(cleanExpiredTokens, 60 * 60 * 1000);

// ================= SHUTDOWN =================
process.on("SIGINT", async () => {
  console.log("Closing DB connection...");
  await sequelize.close();
  process.exit(0);
});

// ================= EXPORT =================
module.exports = {
  sequelize,
  User,
  Room,
  Wallet,
  WalletTransaction,
  Bid,
  Order,
  Escrow,
  Session,
  SessionParticipant,
  Message,
  MessageAttachment,
  Asset,
  UserAddress,
  OrderAddress,
  Notification,
  Dispute,
  Wishlist,
  BlacklistedToken,
  Admin,
  AdminLog
};

console.log('Loaded models:', Object.keys(module.exports));
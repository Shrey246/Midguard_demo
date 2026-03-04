// backend/models/index.js

const { Sequelize, DataTypes } = require('sequelize');

// 🔧 change these to your DB details
const sequelize = new Sequelize(
  'midguard',
  'root',
  '', // XAMPP default password is EMPTY
  {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false
  }
);

// Import model definitions
const UserModel = require('./user');
const RoomModel = require('./room'); // ✅ ADD THIS
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



// Initialize models
const User = UserModel(sequelize, DataTypes);
const Room = RoomModel(sequelize, DataTypes); // ✅ ADD THIS
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


// Test connection
sequelize.authenticate()
  .then(() => console.log('Database connected ✅'))
  .catch(err => console.error('DB connection failed ❌', err));


Session.hasMany(SessionParticipant, {
  foreignKey: 'session_uid',
  sourceKey: 'session_uid',
  as: 'participants'
});

SessionParticipant.belongsTo(Session, {
  foreignKey: 'session_uid',
  targetKey: 'session_uid'
});

Session.hasMany(Message, {
  foreignKey: 'session_uid',
  sourceKey: 'session_uid',
  as: 'messages'
});

Message.belongsTo(Session, {
  foreignKey: 'session_uid',
  targetKey: 'session_uid'
});

Message.hasMany(MessageAttachment, {
  foreignKey: 'message_uid',
  sourceKey: 'message_uid',
  as: 'attachments'
});

MessageAttachment.belongsTo(Message, {
  foreignKey: 'message_uid',
  targetKey: 'message_uid'
});



// Export initialized models
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
  OrderAddress
};

console.log(
  'Loaded models:',
  Object.keys(module.exports)
);

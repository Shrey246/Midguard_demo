CREATE DATABASE IF NOT EXISTS midguard_db;
USE midguard_db;

--------------------USER RELATED TABLES--------------------

CREATE TABLE users (
    -- Internal primary key (for joins & performance)
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Public ID (ULID)
    public_id CHAR(26) NOT NULL UNIQUE,
    -- Identity
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    -- Contact
    email VARCHAR(255) UNIQUE,
    phone_number CHAR(10) UNIQUE,
    -- Authentication
    password_hash VARCHAR(255) NOT NULL,
    auth_provider ENUM('email', 'google', 'apple') NOT NULL DEFAULT 'email',
    -- Verification flags
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    -- Personal details
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    profession VARCHAR(150),
    bio TEXT,
    -- Profile
    profile_picture VARCHAR(512),
    preferred_language VARCHAR(50),
    timezone VARCHAR(50),
    -- Timestamps (system-managed)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
)ENGINE=InnoDB;

CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- User reference (public ID)
    user_public_id CHAR(26) NOT NULL,
    -- Room reference
    room_id INT NOT NULL,
    -- Timestamp
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Relations
    FOREIGN KEY (user_public_id) REFERENCES users(public_id)
) ENGINE=InnoDB;


---------------------PRODUCT RELATED TABLES--------------------

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_uid CHAR(26) NOT NULL UNIQUE,
    seller_public_id CHAR(26) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(12,2) NOT NULL,
    used_duration VARCHAR(100),
    warranty_remaining VARCHAR(100),
    original_box_available BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_available BOOLEAN NOT NULL DEFAULT FALSE,
    listing_status ENUM(
        'draft',
        'active',
        'locked',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'draft',
    room_type ENUM(
        'auction',
        'public',
        'private',
        'digital'
    ) NOT NULL DEFAULT 'auction',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_seller
        FOREIGN KEY (seller_public_id)
        REFERENCES users(public_id)
) ENGINE=InnoDB;



CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,

    image_uid CHAR(26) NOT NULL UNIQUE,
    room_uid CHAR(26) NOT NULL,

    image_path VARCHAR(512) NOT NULL,
    mime_type ENUM('image/jpeg','image/png','image/webp') NOT NULL,

    image_role ENUM('product','invoice') NOT NULL DEFAULT 'product',

    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    uploaded_by CHAR(26) NOT NULL,

    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_image_room
        FOREIGN KEY (room_uid)
        REFERENCES rooms(room_uid)
        ON DELETE CASCADE
) ENGINE=InnoDB;


---------------------ORDER RELATED TABLES--------------------

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    session_id CHAR(36) NOT NULL UNIQUE,

    accepted_bid_uid CHAR(26) NULL,
    room_uid CHAR(26) NOT NULL,

    buyer_public_id CHAR(26) NOT NULL,
    seller_public_id CHAR(26) NOT NULL,

    final_amount DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL,
    seller_net_amount DECIMAL(12,2) NOT NULL,

    order_status ENUM(
        'created',
        'in_progress',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'created',

    buyer_confirmation_status ENUM(
        'pending',
        'confirmed',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    payment_status ENUM(
        'pending',
        'held',
        'released',
        'refunded'
    ) NOT NULL DEFAULT 'pending',

    payment_reference_id VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    FOREIGN KEY (buyer_public_id) REFERENCES users(public_id),
    FOREIGN KEY (seller_public_id) REFERENCES users(public_id)
) ENGINE=InnoDB;

CREATE TABLE escrow (
    id INT AUTO_INCREMENT PRIMARY KEY,

    session_id CHAR(36) NOT NULL UNIQUE,
    order_uid CHAR(26) NOT NULL,
    room_uid CHAR(26) NOT NULL,

    buyer_public_id CHAR(26) NOT NULL,
    seller_public_id CHAR(26) NOT NULL,

    escrow_amount DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL,
    seller_net_amount DECIMAL(12,2) NOT NULL,

    currency ENUM('INR','USD','EUR') NOT NULL DEFAULT 'INR',

    escrow_status ENUM(
        'initiated',
        'funds_received',
        'in_transit',
        'delivered',
        'completed',
        'disputed',
        'refunded',
        'cancelled'
    ) NOT NULL DEFAULT 'initiated',

    seller_dispatched BOOLEAN NOT NULL DEFAULT FALSE,
    buyer_received BOOLEAN NOT NULL DEFAULT FALSE,
    buyer_approved BOOLEAN NOT NULL DEFAULT FALSE,
    dispute_raised BOOLEAN NOT NULL DEFAULT FALSE,

    dispute_reason TEXT,

    incoming_payment_reference VARCHAR(100),
    outgoing_payment_reference VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    funds_received_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,

    FOREIGN KEY (buyer_public_id) REFERENCES users(public_id),
    FOREIGN KEY (seller_public_id) REFERENCES users(public_id)
) ENGINE=InnoDB;

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    -- Public transaction reference (safe to expose)
    transaction_uid CHAR(36) NOT NULL UNIQUE,
    -- Context
    session_id CHAR(36) NOT NULL,
    escrow_id INT NOT NULL,
    order_id INT NOT NULL,
    -- Financials
    amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    -- Transaction nature
    transaction_type ENUM(
        'wallet_debit',
        'wallet_credit',
        'escrow_hold',
        'escrow_release',
        'refund',
        'platform_fee'
    ) NOT NULL,
    -- Parties (public IDs)
    from_public_id CHAR(26),
    to_public_id CHAR(26),
    -- Status
    transaction_status ENUM(
        'initiated',
        'pending',
        'completed',
        'failed'
    ) NOT NULL DEFAULT 'initiated',
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    -- Relations
    FOREIGN KEY (escrow_id) REFERENCES escrow(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (from_public_id) REFERENCES users(public_id),
    FOREIGN KEY (to_public_id) REFERENCES users(public_id)
) ENGINE=InnoDB;

CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Public identity
    bid_uid CHAR(26) NOT NULL UNIQUE,

    -- Relations
    room_uid CHAR(26) NOT NULL,
    bidder_public_id CHAR(26) NOT NULL,

    -- Financials
    bid_amount DECIMAL(12,2) NOT NULL,
    locked_amount DECIMAL(12,2) NOT NULL,

    -- Bid state
    bid_status ENUM(
        'placed',
        'leading',
        'waitlisted',
        'outbid',
        'won',
        'cancelled',
        'expired'
    ) NOT NULL DEFAULT 'placed',

    -- Ranking (1 = highest)
    bid_rank INT NULL,

    -- Time enforcement
    expires_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_bid_room
        FOREIGN KEY (room_uid)
        REFERENCES rooms(room_uid),

    CONSTRAINT fk_bid_user
        FOREIGN KEY (bidder_public_id)
        REFERENCES users(public_id)
) ENGINE=InnoDB;


---------------------Wallet related tables---------------------
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_public_id CHAR(26) NOT NULL UNIQUE,

    available_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    locked_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_wallet_user
        FOREIGN KEY (user_public_id)
        REFERENCES users(public_id)
) ENGINE=InnoDB;

CREATE TABLE wallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    transaction_uid CHAR(26) NOT NULL UNIQUE,

    user_public_id CHAR(26) NOT NULL,

    amount DECIMAL(12,2) NOT NULL,

    transaction_type ENUM(
        'credit',        -- add money
        'debit',         -- withdraw (later)
        'lock',          -- lock for bid
        'unlock',        -- outbid / cancel
        'escrow_in',     -- move to escrow
        'escrow_out',    -- release to seller
        'refund'
    ) NOT NULL,

    reference_type ENUM(
        'topup',
        'bid',
        'room',
        'escrow',
        'admin'
    ) NOT NULL,

    reference_id CHAR(26) NULL,  -- room_uid / bid_uid / escrow_uid

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tx_user
        FOREIGN KEY (user_public_id)
        REFERENCES users(public_id)
) ENGINE=InnoDB;


---------------------logging and communication tables---------------------

CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_uid CHAR(26) NOT NULL UNIQUE,
  session_type ENUM(
    'auction',
    'private_room',
    'marketplace',
    'direct',
    'support'
  ) NOT NULL,
  status ENUM('active','closed') DEFAULT 'active',
  created_by CHAR(26) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE session_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_uid CHAR(26) NOT NULL,
  user_public_id CHAR(26) NOT NULL,
  role ENUM('buyer','seller','admin') NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_session_user (session_uid, user_public_id),
  FOREIGN KEY (session_uid) REFERENCES sessions(session_uid)
    ON DELETE CASCADE
) ENGINE=InnoDB;


----------------------Communication tables----------------------
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_uid CHAR(26) NOT NULL UNIQUE,

  session_uid CHAR(26) NOT NULL,
  sender_public_id CHAR(26) NOT NULL,

  message_type ENUM(
    'text',
    'system',
    'image',
    'document'
  ) NOT NULL DEFAULT 'text',

  body TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_uid)
    REFERENCES sessions(session_uid)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE message_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attachment_uid CHAR(26) NOT NULL UNIQUE,

  message_uid CHAR(26) NOT NULL,
  session_uid CHAR(26) NOT NULL,

  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (message_uid)
    REFERENCES messages(message_uid)
    ON DELETE CASCADE,

  FOREIGN KEY (session_uid)
    REFERENCES sessions(session_uid)
    ON DELETE CASCADE
) ENGINE=InnoDB;

----------------------Images and addresses----------------------
CREATE TABLE assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    asset_uid CHAR(26) NOT NULL UNIQUE,        -- ULID
    uploader_public_id CHAR(26) NOT NULL,       -- who uploaded

    context_type ENUM(
        'room',
        'chat',
        'escrow',
        'profile'
    ) NOT NULL,

    context_id CHAR(26) NOT NULL,                -- room_uid / session_uid / user_public_id

    purpose ENUM(
        'listing_image',
        'chat_attachment',
        'shipment_proof',
        'invoice',
        'profile_avatar'
    ) NOT NULL,

    file_url VARCHAR(512) NOT NULL,
    file_type VARCHAR(50) NOT NULL,              -- image/jpeg, image/png, application/pdf
    file_size INT NOT NULL,                      -- bytes

    is_primary BOOLEAN DEFAULT FALSE,             -- for listing / avatar
    is_active BOOLEAN DEFAULT TRUE,               -- avatar replacement / soft disable

    immutable BOOLEAN DEFAULT FALSE,               -- escrow proofs, chat images

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_assets_context (context_type, context_id),
    INDEX idx_assets_uploader (uploader_public_id)
) ENGINE=InnoDB;

CREATE TABLE user_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    address_uid CHAR(26) NOT NULL UNIQUE,
    user_public_id CHAR(26) NOT NULL,

    label ENUM('home', 'work', 'other') NOT NULL,

    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'India',

    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_addresses_user (user_public_id)
) ENGINE=InnoDB;

CREATE TABLE order_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_uid CHAR(26) NOT NULL UNIQUE,
    buyer_public_id CHAR(26) NOT NULL,

    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_addresses_order (order_uid)
) ENGINE=InnoDB;

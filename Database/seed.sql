USE midguard_db;

--------------------------------------------------
-- 1️⃣ USERS (ROOT DEPENDENCY)
--------------------------------------------------

INSERT INTO users (
    public_id, full_name, username, email, phone_number,
    password_hash, auth_provider,
    email_verified, phone_verified,
    date_of_birth, gender, profession, bio,
    preferred_language, timezone
) VALUES
(
    '01HZXUSER0000000000000001',
    'Shrey Kumar',
    'shrey',
    'shrey@test.com',
    '9876543210',
    '$2b$10$seedhashedpassword',
    'email',
    TRUE, TRUE,
    '2007-01-19',
    'male',
    'Student',
    'Founder of MidGuard',
    'en',
    'Asia/Kolkata'
),
(
    '01HZXUSER0000000000000002',
    'Aarav Mehta',
    'aarav',
    'aarav@test.com',
    '9123456789',
    '$2b$10$seedhashedpassword',
    'email',
    TRUE, TRUE,
    '2000-06-15',
    'male',
    'Seller',
    'Verified electronics seller',
    'en',
    'Asia/Kolkata'
);

--------------------------------------------------
-- 2️⃣ ADDRESSES
--------------------------------------------------

INSERT INTO addresses (
    user_public_id, address_line, city, state, country,
    postal_code, address_type, is_default
) VALUES
(
    '01HZXUSER0000000000000001',
    '123 Main Street, Near Tech Park',
    'Bengaluru',
    'Karnataka',
    'India',
    '560037',
    'home',
    TRUE
);

--------------------------------------------------
-- 3️⃣ LISTED PRODUCTS (ROOMS)
--------------------------------------------------

INSERT INTO rooms (
    room_id, room_uid, product_name, description,
    base_price, used_duration, warranty_remaining,
    original_box_available, invoice_available,
    seller_public_id, listing_status
) VALUES
(
    1,
    '01HZXROOM0000000000000001',
    'iPhone 13 Pro',
    'Well maintained, no scratches',
    65000.00,
    '1 year',
    '6 months',
    TRUE,
    TRUE,
    '01HZXUSER0000000000000002',
    'active'
);

--------------------------------------------------
-- 4️⃣ PRODUCT IMAGES
--------------------------------------------------

INSERT INTO product_images (
    room_uid, image_path, image_type,
    display_order, is_primary
) VALUES
(
    '01HZXROOM0000000000000001',
    'uploads/iphone13/front.webp',
    'image/webp',
    1,
    TRUE
);

--------------------------------------------------
-- 5️⃣ WISHLIST
--------------------------------------------------

INSERT INTO wishlist (
    user_public_id, room_id
) VALUES
(
    '01HZXUSER0000000000000001',
    1
);

--------------------------------------------------
-- 6️⃣ BIDS
--------------------------------------------------

INSERT INTO bids (
    session_id, room_id,
    bidder_public_id, seller_public_id,
    bid_amount, bid_status
) VALUES
(
    'SESSION-BID-0001',
    1,
    '01HZXUSER0000000000000001',
    '01HZXUSER0000000000000002',
    70000.00,
    'accepted'
);

--------------------------------------------------
-- 7️⃣ ORDERS
--------------------------------------------------

INSERT INTO orders (
    session_id, accepted_bid_id, room_id,
    buyer_public_id, seller_public_id,
    final_amount, platform_fee, seller_net_amount,
    order_status, buyer_confirmation_status, payment_status
) VALUES
(
    'SESSION-ORDER-0001',
    1,
    1,
    '01HZXUSER0000000000000001',
    '01HZXUSER0000000000000002',
    70000.00,
    2000.00,
    68000.00,
    'active',
    'pending',
    'held'
);

--------------------------------------------------
-- 8️⃣ ESCROW
--------------------------------------------------

INSERT INTO escrow (
    session_id, order_id, room_id,
    buyer_public_id, seller_public_id,
    escrow_amount, platform_fee, seller_net_amount,
    escrow_status
) VALUES
(
    'SESSION-ESCROW-0001',
    1,
    1,
    '01HZXUSER0000000000000001',
    '01HZXUSER0000000000000002',
    70000.00,
    2000.00,
    68000.00,
    'funds_received'
);

--------------------------------------------------
-- 9️⃣ TRANSACTIONS (LEDGER)
--------------------------------------------------

INSERT INTO transactions (
    transaction_uid, session_id,
    escrow_id, order_id,
    amount, currency,
    transaction_type,
    from_public_id, to_public_id,
    transaction_status
) VALUES
(
    'TXN-00000000000000000000000001',
    'SESSION-ESCROW-0001',
    1,
    1,
    70000.00,
    'INR',
    'escrow_hold',
    '01HZXUSER0000000000000001',
    NULL,
    'completed'
);

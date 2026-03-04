
-- Wishlist uniqueness
ALTER TABLE wishlist
ADD CONSTRAINT unique_user_room
UNIQUE (user_public_id, room_id);

-- Orders ↔ Bids
ALTER TABLE orders
ADD CONSTRAINT fk_orders_accepted_bid
FOREIGN KEY (accepted_bid_id) REFERENCES bids(id);

-- Escrow ↔ Orders
ALTER TABLE escrow
ADD CONSTRAINT fk_escrow_order
FOREIGN KEY (order_id) REFERENCES orders(id);

-- Indexes (performance)
CREATE INDEX idx_bids_room_id ON bids(room_id);
CREATE INDEX idx_orders_room_id ON orders(room_id);
CREATE INDEX idx_escrow_room_id ON escrow(room_id);
CREATE INDEX idx_wishlist_room_id ON wishlist(room_id);
CREATE INDEX idx_transactions_session_id ON transactions(session_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_escrow_id ON transactions(escrow_id);



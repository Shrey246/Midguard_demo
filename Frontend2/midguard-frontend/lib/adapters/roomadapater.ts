export function adaptRoom(room: any) {
  return {
    id: room.room_uid,

    // 🔥 CORE
    type: room.room_type,
    status: room.listing_status,
    endTime: room.end_time || null,

    // 🔥 NEW (IMPORTANT)
    isAuction: room.room_type === "auction",
    isPrivate: room.room_type === "private",
    duration: room.auction_duration_hours || null,

    product: {
      name: room.product_name,
      sellerId: room.seller_public_id,
      price: Number(room.base_price),
      description: room.description,

      usedDuration: room.used_duration,
      warranty: room.warranty_remaining,

      originalBox: room.original_box_available,
      invoiceAvailable: room.invoice_available,
    },

    images: [],
  };
}
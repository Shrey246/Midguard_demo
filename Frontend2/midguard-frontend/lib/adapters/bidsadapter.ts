export function adaptBid(b: any) {
  if (!b) return null;

  const user =
    b.bidder_public_id ||
    b.bidderPublicId ||
    b.user ||
    null;

  if (!user) {
    console.error("Invalid bid object:", b);
    return null;
  }

  return {
    id: b.bid_uid,
    user,
    amount: Number(b.bid_amount ?? 0),

    // 🔥 NEW
    status: b.bid_status,
    rank: b.bid_rank || null,
    expiresAt: b.expires_at || null,
  };
}
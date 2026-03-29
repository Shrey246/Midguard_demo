export default function ActionButton({
  type,
  onClick,
}: {
  type: string;
  onClick: () => void;
}) {
  const isAuction = type === "auction";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // ✅ prevents card click conflict
        onClick();
      }}
      className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
    >
      {isAuction ? "Bid Now" : "Buy Now"}
    </button>
  );
}
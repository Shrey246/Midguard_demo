"use client";

type Product = {
  name: string;
  sellerId: string;
  price: number;
  description: string;
  usedDuration?: string;
  warranty?: string;
  invoiceAvailable?: boolean;
  originalBox?: boolean;
};

type Props = {
  product: Product;
};

export default function ProductView({ product }: Props) {
  return (
    <div className="
      bg-gradient-to-br from-gray-100 to-white 
      dark:from-white/5 dark:to-white/10
      backdrop-blur-xl
      rounded-2xl p-4 sm:p-6 shadow-xl space-y-6
      border border-gray-200 dark:border-white/10
      transition-all duration-300
    ">

      {/* TOP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="space-y-4">

          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold leading-snug">
            {product.name}
          </h1>

          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Seller:
            <span className="ml-1 text-black dark:text-white font-medium">
              {product.sellerId}
            </span>
          </div>

          {/* PRICE BLOCK */}
          <div className="
            inline-block
            bg-orange-500/10 border border-orange-500/20
            px-4 py-2 rounded-xl
          ">
            <span className="text-2xl sm:text-3xl font-bold text-orange-500">
              ₹{product.price.toLocaleString()}
            </span>
          </div>

        </div>

        {/* RIGHT SIDE (ATTRIBUTES) */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">

          {product.usedDuration && (
            <Card title="Used Duration" value={product.usedDuration} />
          )}

          {product.warranty && (
            <Card title="Warranty" value={product.warranty} />
          )}

          {product.originalBox !== undefined && (
            <Card
              title="Original Box"
              value={product.originalBox ? "Available" : "No"}
              highlight={product.originalBox}
            />
          )}

          {product.invoiceAvailable !== undefined && (
            <Card
              title="Invoice"
              value={product.invoiceAvailable ? "Available" : "No"}
              highlight={product.invoiceAvailable}
            />
          )}

        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="
        bg-gray-200 dark:bg-white/10
        p-4 rounded-xl
        border border-gray-300 dark:border-white/10
      ">
        <h2 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Description
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {product.description}
        </p>
      </div>

    </div>
  );
}

/* 🔥 SMALL CARD COMPONENT (UI BOOST) */
function Card({ title, value, highlight }: any) {
  return (
    <div className="
      bg-white dark:bg-white/10
      border border-gray-200 dark:border-white/10
      p-3 rounded-xl
      shadow-sm
      transition
    ">
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <p className={`
        mt-1 font-medium
        ${highlight ? "text-green-500" : "text-black dark:text-white"}
      `}>
        {value}
      </p>
    </div>
  );
}
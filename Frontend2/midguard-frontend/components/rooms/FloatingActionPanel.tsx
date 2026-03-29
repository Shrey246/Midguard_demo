"use client";

type Action = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

type Props = {
  roomType: "public" | "private" | "digital";
  actions: Action[];
};

export default function FloatingActionPanel({
  roomType,
  actions,
}: Props) {
  return (
    <div className="sticky bottom-4 z-50 px-2 sm:px-0">

      <div className="
        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4
        bg-gray-100 dark:bg-white/5 backdrop-blur-xl
        p-3 sm:p-4 rounded-2xl shadow-xl
        transition-all duration-300
      ">

        {/* LEFT: ROOM TYPE */}
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Room:{" "}
          <span className="text-black dark:text-white capitalize font-medium">
            {roomType}
          </span>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">

          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`
                w-full sm:w-auto
                px-4 sm:px-5 py-2 rounded-xl font-medium transition text-sm sm:text-base
                ${
                  action.variant === "primary"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-black dark:text-white"
                }
              `}
            >
              {action.label}
            </button>
          ))}

        </div>

      </div>
    </div>
  );
}
"use client";

import { useState } from "react";

type Props = {
  images: string[];
};

export default function ImageView({ images }: Props) {
  const [selected, setSelected] = useState(0);

  const hasImages = images && images.length > 0;

  return (
    <div className="
      bg-gray-100 dark:bg-white/5 backdrop-blur-xl
      p-3 sm:p-4 rounded-2xl shadow-lg
      transition-all duration-300
    ">

      {/* MAIN IMAGE */}
      <div className="
        w-full 
        h-[220px] sm:h-[280px] md:h-[320px]
        rounded-xl overflow-hidden
        bg-gray-300 dark:bg-black/30
        flex items-center justify-center
      ">
        {hasImages ? (
          <img
            src={images[selected]}
            alt="product"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            No Image Available
          </span>
        )}
      </div>

      {/* THUMBNAILS */}
      {hasImages && images.length > 1 && (
        <div className="
          flex gap-2 sm:gap-3 mt-4
          overflow-x-auto scrollbar-hide
        ">

          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              onClick={() => setSelected(index)}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                object-cover rounded-lg cursor-pointer
                border-2 flex-shrink-0 transition
                ${
                  selected === index
                    ? "border-orange-500 scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                }
              `}
            />
          ))}

        </div>
      )}
    </div>
  );
}
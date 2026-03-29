// components/ProductImage.tsx

type Props = {
  src?: string;
};

export default function ProductImage({ src }: Props) {
  return (
    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
      {src ? (
        <img
          src={src}
          alt="product"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-500 text-sm">Image</span>
      )}
    </div>
  );
}
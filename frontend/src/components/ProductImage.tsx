import { Product } from "../types";

interface Props {
  product: Product;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ProductImage({ product, size = "md" }: Props) {
  const dims =
    size === "sm"
      ? "h-10 w-10"
      : size === "md"
      ? "h-16 w-16"
      : size === "lg"
      ? "h-20 w-20"
      : "h-24 w-24";
  const textSize =
    size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : size === "lg" ? "text-3xl" : "text-4xl";

  if (product.image_url) {
    return (
      <img
        src={product.image_url}
        alt={product.name}
        className={`${dims} flex-shrink-0 rounded-xl object-cover`}
      />
    );
  }

  return (
    <div
      className={`${dims} flex flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 ${textSize}`}
    >
      <span className="select-none text-slate-300">
        {product.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

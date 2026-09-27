import Image from "next/image";
import { COLOR_BAND, type WineColor } from "@/lib/catalog";

export function WineImage({
  src,
  alt,
  color,
  sizes,
  className = "",
  badge,
}: {
  src: string;
  alt: string;
  color: WineColor;
  sizes: string;
  className?: string;
  badge?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#f3ece0] ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-contain"
        />
      ) : (
        <div className={`absolute inset-0 ${COLOR_BAND[color]}`} aria-hidden />
      )}
      {badge ? (
        <span
          className={`absolute top-3 left-3 text-[0.68rem] tracking-[0.2em] uppercase ${
            src ? "text-foreground/80" : ""
          }`}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

import { useEffect, useState } from "react";

/**
 * Yalnızca food.imageUrl (yerel veya null). Harici rastgele görsel yok.
 * Yükleme hatasında veya URL yoksa "Görsel hazırlanıyor" placeholder.
 */
export default function FoodImage({
  imageUrl,
  src,
  imageAlt,
  alt,
  className = "",
  loading = "lazy",
  ...rest
}) {
  const primary = (imageUrl ?? src ?? "").trim();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [primary]);

  if (!primary || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 text-center text-sm font-semibold px-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        Görsel hazırlanıyor
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={primary}
      alt={imageAlt || alt}
      loading={loading}
      className={className}
      onError={() => {
        console.warn("[FoodImage] yüklenemedi, placeholder:", primary);
        setFailed(true);
      }}
    />
  );
}

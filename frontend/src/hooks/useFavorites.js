import { useEffect, useState, useCallback } from "react";

const KEY = "yemek_favorites_v1";

function readFavs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => readFavs());

  useEffect(() => {
    const handler = (e) => {
      if (e.key === KEY) setFavorites(readFavs());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const save = useCallback((list) => {
    setFavorites(list);
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
  }, []);

  const toggle = useCallback(
    (food) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === food.id);
        const next = exists
          ? prev.filter((f) => f.id !== food.id)
          : [...prev, food];
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (foodId) => favorites.some((f) => f.id === foodId),
    [favorites]
  );

  const clear = useCallback(() => save([]), [save]);

  return { favorites, toggle, isFavorite, clear };
}

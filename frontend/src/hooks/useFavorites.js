import { useEffect, useState } from "react";

const KEY = "mta_favorite_stations";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    setFavorites(saved);
  }, []);

  const toggleFavorite = (stationId) => {
    setFavorites((prev) => {
      const updated = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];

      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { favorites, toggleFavorite };
}

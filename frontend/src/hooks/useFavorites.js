import { useState } from "react";

const KEY = "mta_favorite_stations";

function readStoredFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readStoredFavorites);

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

<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";

const KEY = "mta_favorite_stations";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    setFavorites(saved);
  }, []);
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4

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

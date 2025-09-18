import { useMemo } from "react";

/**
 * Hook pour générer les initiales d'un nom d'utilisateur
 * - 1 mot : prend les 2 premières lettres
 * - 2+ mots : première lettre du premier mot + première lettre du dernier mot
 */
export const useInitials = (username?: string): string => {
  return useMemo(() => {
    if (!username) return "??";

    const words = username.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    } else {
      const firstLetter = words[0].charAt(0);
      const lastLetter = words[words.length - 1].charAt(0);
      return (firstLetter + lastLetter).toUpperCase();
    }
  }, [username]);
};

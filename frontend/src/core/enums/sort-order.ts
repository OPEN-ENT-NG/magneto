export enum SORT_ORDER {
  ALPHABETICAL = "alphabetical",
  ANTI_ALPHABETICAL = "anti-alphabetical",
  OLDEST_FIRST = "oldest-first",
  NEWEST_FIRST = "newest-first",
}

export const SORT_ORDER_OPTIONS = [
  { value: SORT_ORDER.ALPHABETICAL, label: "Titre (A → Z)" },
  { value: SORT_ORDER.ANTI_ALPHABETICAL, label: "Titre (Z → A)" },
  { value: SORT_ORDER.OLDEST_FIRST, label: "Création (ancien → récent)" },
  { value: SORT_ORDER.NEWEST_FIRST, label: "Création (récent → ancien)" },
] as const;

export enum POSITION_MODE {
  FREE = "free",
  ORDERED = "ordered",
}

export enum NEW_CARD_POSITION {
  START = "start",
  END = "end",
}

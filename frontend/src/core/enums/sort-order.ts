export enum POSITION_MODE {
  FREE = "free",
  ORDERED = "ordered",
}

export enum SORT_OR_CREATE_BY {
  START = "start",
  END = "end",
  ALPHABETICAL = "alphabetical",
  ANTI_ALPHABETICAL = "anti-alphabetical",
  OLDEST_FIRST = "oldest-first",
  NEWEST_FIRST = "newest-first",
}

export const SORT_ORDER_OPTIONS = [
  { value: SORT_OR_CREATE_BY.ALPHABETICAL, label: "Titre (A → Z)" },
  { value: SORT_OR_CREATE_BY.ANTI_ALPHABETICAL, label: "Titre (Z → A)" },
  {
    value: SORT_OR_CREATE_BY.OLDEST_FIRST,
    label: "Création (ancien → récent)",
  },
  {
    value: SORT_OR_CREATE_BY.NEWEST_FIRST,
    label: "Création (récent → ancien)",
  },
] as const;

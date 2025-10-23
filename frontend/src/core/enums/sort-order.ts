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
  {
    value: SORT_OR_CREATE_BY.ALPHABETICAL,
    label: "magneto.sort.order.options.alphabetical",
  },
  {
    value: SORT_OR_CREATE_BY.ANTI_ALPHABETICAL,
    label: "magneto.sort.order.options.anti.alphabetical",
  },
  {
    value: SORT_OR_CREATE_BY.OLDEST_FIRST,
    label: "magneto.sort.order.options.oldest.first",
  },
  {
    value: SORT_OR_CREATE_BY.NEWEST_FIRST,
    label: "magneto.sort.order.options.newest.first",
  },
] as const;

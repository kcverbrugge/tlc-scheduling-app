export const STATUSES = [
    "AVAILABLE",
    "IN_SESSION",
    "CALLED_OUT",
    "OFF_SHIFT",
    "UNAVAILABLE",
  ] as const;
  
  export type StatusEnum = typeof STATUSES[number];
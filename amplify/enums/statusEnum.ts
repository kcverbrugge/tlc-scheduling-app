export const STATUSES = [
    "AVAILABLE",
    "IN_SESSION",
    "OVER_TIME",
    "CALLED_OUT",
    "NOT_SCHEDULED",
  ] as const;
  
  export type StatusEnum = typeof STATUSES[number];
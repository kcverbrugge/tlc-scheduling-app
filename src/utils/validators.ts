import { STATUSES, StatusEnum } from "../../amplify/enums/statusEnum";



export function isValidStatus(status: string): status is StatusEnum { //"status is StatusEnum" is important for casting types
  return STATUSES.includes(status as StatusEnum);
}

export function isEmailFormat(email: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //email regex used for checking email format
  return emailPattern.test(email);
}
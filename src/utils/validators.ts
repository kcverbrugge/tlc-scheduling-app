import { STATUSES, StatusEnum } from "../../amplify/enums/statusEnum";

//Tutor Validators
export function isValidStatus(status: string): status is StatusEnum { //"status is StatusEnum" is important for casting types
  return STATUSES.includes(status as StatusEnum);
}

export function isEmailFormat(email: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //email regex used for checking email format
  return emailPattern.test(email);
}

//Course Validators
export function isDepartmentCode(departmentCode: string) {
  const departmentCodePattern = /^([A-Z]|[a-z]){4}$/;
  return departmentCodePattern.test(departmentCode);
}

export function isCourseNumber(courseNumber: string) {
  //maybe more refined pattern matching (maybe shouldn't count things like 001 )
  const courseNumberPattern = /^[0-9]{3}$/;
  return courseNumberPattern.test(courseNumber);
}

export function isDateTime(inputDate: string | Date | null) {
  if (!inputDate) {
    return false;
  }

  const checkDate = typeof inputDate === "string" ? new Date(inputDate?.trim()) : inputDate;

  return !isNaN(checkDate.getDate());
}
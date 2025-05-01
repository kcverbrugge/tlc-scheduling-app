// Author: Kyle Verbrugge
// Description: Service Functions for the Course model.
// done
// 
// 
// 
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { normalizeDepartmentCode, normalizeCourseNumber, normalizeCourseName } from "../utils/normalizers"
import { isDepartmentCode, isCourseNumber } from "../utils/validators"



const client = generateClient<Schema>();

//takes in DepCode string, courseNumber as number or string (preferred string), courseName as a string.
export async function createCourse(departmentCode: string | null, courseNumber: number | string | null, courseName: string | null) {
  //make sure raw inputs and trimmed inputs are not empty
  if ((!departmentCode || !courseNumber || !courseName) || (!departmentCode.trim() || !courseNumber.toString().trim() || !courseName.trim())) {
    throw new Error("Inputs cannot be empty.");
  }

  //normalize by trimming and making sure they return the right type
  const cleanDepartmentCode = normalizeDepartmentCode(departmentCode);
  const cleanCourseNumber = normalizeCourseNumber(courseNumber.toString());
  const cleanCourseName = normalizeCourseName(courseName);

  //ensure that the department code and course number are in a valid format (uses regex)
  if (!isDepartmentCode(cleanDepartmentCode)) {
    throw new Error("Invalid department code format.")
  }

  if (!isCourseNumber(cleanCourseNumber)) {
    throw new Error("Invalid course number format.")
  }

  //ensure that there is no repeat classes with the same dep code and course number
  const existing = await client.models.Course.list({ //can confirm that fliter has an AND relationship between the two filters
    filter: { departmentCode: { eq: cleanDepartmentCode }, courseNumber: { eq: cleanCourseNumber } },
  });

  if (existing.data.length > 0) {
    throw new Error(`Course ${cleanDepartmentCode}${cleanCourseNumber} already exists.`);
  }

  //create the course
  const result = await client.models.Course.create({
    departmentCode: cleanDepartmentCode,
    courseNumber: cleanCourseNumber,
    courseName: cleanCourseName,
  });

  return result.data;
}

export async function setDepartmentCode(id: string, newDepartmentCode: string | null) {
  if (!newDepartmentCode || !normalizeDepartmentCode(newDepartmentCode)) {
    throw new Error("Department code box cannot be empty.");
  }

  const cleanDepartmentCode = normalizeDepartmentCode(newDepartmentCode);

  if (!isDepartmentCode(cleanDepartmentCode)) {
    throw new Error("Invalid department code format.")
  }

  const result = await client.models.Course.update({
    id: id,
    departmentCode: cleanDepartmentCode,
  });

  return result.data;
}

export async function setCourseNumber(id: string, newCourseNumber: string | null) {
  if (!newCourseNumber || !normalizeCourseNumber(newCourseNumber)) {
    throw new Error("Course number box cannot be empty.");
  }

  const cleanCourseNumber = normalizeCourseNumber(newCourseNumber);

  if (!isCourseNumber(cleanCourseNumber)) {
    throw new Error("Invalid course number format.")
  }

  const result = await client.models.Course.update({
    id: id,
    courseNumber: cleanCourseNumber
  });

  return result.data;
}

export async function setCourseName(id: string, newCourseName: string | null) {
  if (!newCourseName || !normalizeCourseName(newCourseName)) {
    throw new Error("Course name box cannot be empty.");
  }

  const cleanCourseName = normalizeCourseName(newCourseName);

  const result = await client.models.Course.update({
    id: id,
    courseName: cleanCourseName
  });

  return result.data;
}

export async function deleteCourse(id: string) {
  const result = await client.models.Course.delete({
    id: id
  });

  return result.data;
}

//subscription not necessary since courses are not going to be added/removed frequently, this will likely be a presemester process
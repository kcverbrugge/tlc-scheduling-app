import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { normalizeDepartmentCode, normalizeCourseNumber, normalizeCourseName } from "../utils/normalizers"
import { isDepartmentCode, isCourseNumber } from "../utils/validators"



const client = generateClient<Schema>();

export async function getCoursesForTutor(tutorId: string) {
  const availableCourses = await client.models.AvailableCourse.list({
    filter: { tutorId: { eq: tutorId } }
  });

  return availableCourses.data;
}

export async function getDetailedCoursesForTutor(tutorId: string) {
  const available = await getCoursesForTutor(tutorId);

  const courseDetails = await Promise.all(
      available.map((ac) => client.models.Course.get({ id: ac.courseId }))
  );

  return courseDetails
      .map((res) => res.data)
      .filter((c) => !!c); // remove nulls if any courseId is broken
}
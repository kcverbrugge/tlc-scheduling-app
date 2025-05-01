import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";



const client = generateClient<Schema>();

export async function addCourseToTutor(tutorId: string, courseId: string) {
  const result = await client.models.AvailableCourse.create({
    tutorId: tutorId,
    courseId: courseId,
  });

  if (!result) {
    throw new Error("Failed to add course to tutor.");
  }

  return result.data;
}

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

export async function deleteCourseForTutor(id: string) {
  const result = await client.models.AvailableCourse.delete({ id });

  if (!result) {
    throw new Error("Failed to delete course for the tutor.");
  }

  return result.data;

}

export function observeAvailableCourses(callback: (AvailableCourses: Schema["AvailableCourse"]["type"][]) => void) {
  return client.models.AvailableCourse.observeQuery().subscribe({
    next: ({ items }) => callback(items),
    error: (err) => console.error("Error observing Callouts:", err),
  });
}
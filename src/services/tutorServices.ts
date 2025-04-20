import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export async function createTutor(firstName: string | null, lastName: string | null, email: string | null) {
  if (!firstName || !lastName || !email) { //makes sure that first, last, and email are all populated
    throw new Error("Inputs cannot be empty.");
  }
  const trimmedFirst = firstName.trim().toLowerCase();
  const trimmedLast = lastName.trim().toLowerCase();
  const trimmedEmail = email.trim().toLowerCase();

  //is there ever a case where a students email is entered as a non CMU email?
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //email regex used for checking email format
  if (!trimmedFirst || !trimmedLast || !trimmedEmail) { //makes sure that first, last, and email are all populated
    throw new Error("Inputs cannot be empty.");
  } else if (!emailPattern.test(trimmedEmail)) { //checks email format
    throw new Error("Email format is invalid.")
  }

  const existing = await client.models.Tutor.list({
    filter: { email: { eq: trimmedEmail } }, //goes into DB to see if the student email is already there
  });

  if (existing.data.length > 0) {
    throw new Error("Duplicate email, student may already be in the database.");
  }

  return client.models.Tutor.create({
    firstName: trimmedFirst,
    lastName: trimmedLast,
    email: trimmedEmail,
  });
}

export async function setFirstName(firstName: string | null) {
  if (!firstName) {
    throw new Error("Input cannot be empty.")
  }

  
}

export async function deleteTutor(id: string) {
  return client.models.Tutor.delete({ id }, { authMode: "userPool" });
}

export function observeTutors(callback: (tutors: Schema["Tutor"]["type"][]) => void) {
  return client.models.Tutor.observeQuery().subscribe({
    next: (data) => callback(data.items),
  });
}

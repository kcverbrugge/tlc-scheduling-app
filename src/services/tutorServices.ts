import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { STATUSES } from "../../amplify/enums/statusEnum";
import { isValidStatus, isEmailFormat } from "../utils/validators"
import { normalizeName, normalizeEmail, normalizeStatus } from "../utils/normalizers"



const client = generateClient<Schema>();

export async function createTutor(firstName: string | null, lastName: string | null, email: string | null) {
  //checks to see if raw inputs are null, once checked, then the trimmed versions are checked. 
  //This is because typescript doesn't allow trim to be used on nullable strings, so they must
  //be checked to be null.
  if ((!firstName || !lastName || !email) || (!firstName.trim() || !lastName.trim() || !email.trim())) { 
    throw new Error("Inputs cannot be empty.");
  }
  const cleanFirstName = normalizeName(firstName);
  const cleanLastName = normalizeEmail(lastName);
  const cleanEmail = normalizeEmail(email);

  //is there ever a case where a students email is entered as a non CMU email?
  if (!isEmailFormat(cleanEmail)) { //checks email format
    throw new Error("Email format is invalid.");
  }

  const existing = await client.models.Tutor.list({
    filter: { email: { eq: cleanEmail } },
  });

  if (existing.data.length > 0) {
    throw new Error(`Email ${email.trim()} already exists.`);
  }

  return client.models.Tutor.create({
    firstName: cleanFirstName,
    lastName: cleanLastName,
    email: cleanEmail,
  });
}

export async function setFirstName(id: string, newFirstName: string | null) {
  if (!newFirstName || !normalizeName(newFirstName)) {
    throw new Error("Input cannot be empty.");
  }

  return client.models.Tutor.update({
    id: id,
    firstName: normalizeName(newFirstName)
  });
}

export async function setLastName(id: string, newLastName: string | null) {
  if (!newLastName || !normalizeName(newLastName)) {
    throw new Error("Input cannot be empty.");
  }

  return client.models.Tutor.update({
    id: id,
    lastName: normalizeName(newLastName)
  });
}

export async function setEmail(id: string, newEmail: string | null) {
  if (!newEmail || !normalizeEmail(newEmail)) {
    throw new Error("Input cannot be empty.");
  } 

  const cleanEmail = normalizeEmail(newEmail);

  if (!isEmailFormat(cleanEmail)) {
    throw new Error("Email format is invalid.");
  }

  const existing = await client.models.Tutor.list({
    filter: { email: { eq: cleanEmail } },
  });

  if (existing.data.some(tutor => tutor.id !== id)) {
    throw new Error(`Email ${newEmail.trim()} already exists.`); //perhaps display more information on the student already found inthe DB
  }

  return client.models.Tutor.update({
    id: id,
    email: cleanEmail
  });
}

export async function setStatus(id: string, newStatus: string) {
  const cleanStatus = normalizeStatus(newStatus);
  if (!isValidStatus(cleanStatus)) {
    throw new Error(`Invalid input ${newStatus}. Tutor status can only be one of the following: ${STATUSES.join(", ")}`);
  }

  return client.models.Tutor.update({
    id: id,
    status: cleanStatus
  });
}

export async function setContactHours(id: string, newContactHours: number) {
  if (newContactHours < 0) {
    throw new Error('Contact hours cannot be negative.')
  }

  return client.models.Tutor.update({
    id: id,
    contactHours: newContactHours
  });
}

export async function deleteTutor(id: string) {
  return client.models.Tutor.delete({ id }, { authMode: "userPool" });
}

export function observeTutors(callback: (tutors: Schema["Tutor"]["type"][]) => void) {
  return client.models.Tutor.observeQuery().subscribe({
    next: (data) => callback(data.items),
    error: (err) => console.error("Error observing tutors:", err),
  });
}
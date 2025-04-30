// Tutor service functions for managing tutor data. This is designed to be integrated with
// front end functionality so that users know if they're inputting invalid data, dauplicate
// data, etc. Make sure these are called instead of directly using the client.

//STATUS WIP, need to add functionality for adding/updating schedules, adding appointments, callouts, etc...
// That will come when those service fucntions are created

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { STATUSES } from "../../amplify/enums/statusEnum";
import { isValidStatus, isEmailFormat } from "../utils/validators";
import { normalizeName, normalizeEmail, normalizeStatus } from "../utils/normalizers";



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
    alert("Email format is invalid.");
    throw new Error("Email format is invalid.");
  }

  const existing = await client.models.Tutor.list({
    filter: { email: { eq: cleanEmail } },
  });

  if (existing.data.length > 0) {
    alert(`Email ${email.trim()} already exists.`);
    throw new Error(`Email ${email.trim()} already exists.`);
  }

  const { data: tutorData, errors } = await client.models.Tutor.create({  
    /*
    .create returns in the form: {
    data: Tutor,
    errors?: Array<GraphQLError>
    }
    So we can destructure the data and errors from the response and return just the tutorData
  */
    firstName: cleanFirstName,
    lastName: cleanLastName,
    email: cleanEmail,
  });

  if (errors?.length) {
    console.error("Error creating tutor:", errors);
  }
  if(!tutorData) {
    alert("Error creating tutor.");
  }

  return tutorData;

}

export async function setFirstName(id: string, newFirstName: string | null) {
  if (!newFirstName || !normalizeName(newFirstName)) {
    alert("Input cannot be empty.");
    throw new Error("First name cannot be empty.");
  }

  const result = await client.models.Tutor.update({
    id: id,
    firstName: normalizeName(newFirstName)
  });

  return result;
}

export async function setLastName(id: string, newLastName: string | null) {
  if (!newLastName || !normalizeName(newLastName)) {
    alert("Input cannot be empty.");
    throw new Error("Last name cannot be empty.");
  }

  const result = await client.models.Tutor.update({
    id: id,
    lastName: normalizeName(newLastName)
  });

  return result;
}

export async function setEmail(id: string, newEmail: string | null) {
  if (!newEmail || !normalizeEmail(newEmail)) {
    alert("Input cannot be empty.");
    throw new Error("Email cannot be empty.");
  } 

  const cleanEmail = normalizeEmail(newEmail);

  if (!isEmailFormat(cleanEmail)) {
    alert("Email format is invalid.");
    throw new Error("Email format is invalid.");
  }

  const existing = await client.models.Tutor.list({
    filter: { email: { eq: cleanEmail } },
  });

  if (existing.data.some(tutor => tutor.id !== id)) {
    alert(`Email ${newEmail.trim()} already exists.`); //perhaps display more information on the student already found in the DB
    throw new Error(`Email ${newEmail.trim()} already exists.`); //perhaps display more information on the student already found inthe DB
  }

  const result = await client.models.Tutor.update({
    id: id,
    email: cleanEmail
  });

  return result;
}

export async function setStatus(id: string, newStatus: string) {
  const cleanStatus = normalizeStatus(newStatus);
  if (!isValidStatus(cleanStatus)) {
    alert(`Invalid input ${newStatus}. Tutor status can only be one of the following: ${STATUSES.join(", ")}`);
    throw new Error(`Invalid input ${newStatus}. Tutor status can only be one of the following: ${STATUSES.join(", ")}`);
  }

  const result = await client.models.Tutor.update({
    id: id,
    status: cleanStatus
  });

  return result;
}

export async function setContactHours(id: string, newContactHours: number) {
  if (newContactHours < 0) {
    alert("Contact hours cannot be negative.");
    throw new Error('Contact hours cannot be negative.')
  }

  const result = await client.models.Tutor.update({
    id: id,
    contactHours: newContactHours
  });

  return result;
}

export async function getTutor(id: string) {
  const tutorDataWrapper = await client.models.Tutor.get({ id });

  const tutorData = tutorDataWrapper.data;

  if(!tutorData) {
    alert("Error fetching tutor.");
  }

  return tutorData;
}

export async function deleteTutor(id: string) {
  const result = await client.models.Tutor.delete({ id }, { authMode: "userPool" });

  return result;
}

export function observeTutors(callback: (tutors: Schema["Tutor"]["type"][]) => void) {
  return client.models.Tutor.observeQuery().subscribe({
    next: (data) => callback(data.items),
    error: (err) => console.error("Error observing tutors:", err),
  });
}
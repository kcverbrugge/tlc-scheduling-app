// import { generateClient } from "aws-amplify/data";
// import type { Schema } from "../../amplify/data/resource";
// import { isDateTime } from "../utils/validators";
// import { normalizeDateTime } from "../utils/normalizers";



// const client = generateClient<Schema>();

// // Add DST considerations, recurring capability (with ending date)
// export async function createAppointment(tutorId: string, scheduledStartTime: string | Date | null, actualStartTime?: string | Date | null, endTime?: string | Date | null, recurrenceEnd?: string | Date | null, description?: string | null) {
//   if ((!tutorId || !scheduledStartTime) || (!tutorId.trim() || !scheduledStartTime.toString().trim())) {
//     throw new Error("Tutor ID and schuduled start time are required.");
//   }

//   const start = normalizeDateTime(scheduledStartTime);
//   const actStart =  normalizeDateTime(actualStartTime? actualStartTime : "");
//   const end = normalizeDateTime(endTime? endTime : "");
//   if (!isDateTime(start)) {
//     throw new Error("Start time is not a valid datetime.");
//   }

//   if (endTime) { //if a session endtime is specified

//     if (!isDateTime(end)) {
//       throw new Error("End time is not a valid datetime.");
//     }

//     if (end <= start) {
//       throw new Error("End time must be after start time.");
//     }

//     const result = await client.models.Appointment.create({
//       tutorId: tutorId,
//       startTime: start.toISOString(),
//       endTime: end.toISOString(),
//     });

//     return result;
//   }

//   const result = await client.models.Appointment.create({
//       tutorId: tutorId,
//       scheduledStartTime: start.toISOString(),
//       actualStartTime?: ...,
//       endTime?: ...,
//       recurrenceEnd?:  ...,
//       description: description?.trim(),
//   });

//   return result;
// }

// export async function setEndTime(tutorId: string, endTime: string | Date | null) {
//   if (!endTime || !endTime.toString().trim()) {
//     throw new Error("End time input is required.");
//   }

//   const newEndTime = normalizeDateTime(endTime);

//   if (!isDateTime(newEndTime)) {
//     throw new Error("End time is not a valid datetime.");
//   }

//   const result = await client.models.Appointment.update({
//     id: tutorId,
//     endTime: newEndTime.toISOString(),
//   });

//   return result;
// }

// export async function deleteAppointment(id: string) {
//   const result = await client.models.Appointment.delete({ id });

//   return result; //will return NULL if no Appointment is found with the ID given
// }

// /**
//  * List all Appointments for a tutor
//  */
// export async function listAppointmentsByTutor(tutorId: string) {
//   return await client.models.Appointment.list({
//     filter: { tutorId: { eq: tutorId } },
//   });
// }

// /**
//  * Observe all Appointments
//  */
// export function observeAppointments(callback: (Appointments: Schema["Appointment"]["type"][]) => void) {
//   return client.models.Appointment.observeQuery().subscribe({
//     next: ({ items }) => callback(items),
//     error: (err) => console.error("Error observing Appointments:", err),
//   });
// }
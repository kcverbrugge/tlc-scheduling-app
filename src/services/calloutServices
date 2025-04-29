import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { isDateTime } from "../utils/validators";
import { normalizeDateTime } from "../utils/normalizers";



const client = generateClient<Schema>();

// Add DST considerations, recurring capability (with ending date)
export async function createCallout(tutorId: string, startTime: string | Date | null, endTime: string | Date | null, reason: string | null) {
  if ((!tutorId || !startTime || !endTime || !reason) || (!tutorId.trim() || !startTime.toString().trim() || !endTime.toString().trim() || !reason.trim())) {
    throw new Error("Tutor ID, absent start time, absent end time, and reason are required.");
  }

  const start = normalizeDateTime(startTime);
  const end = normalizeDateTime(endTime);

  if (!isDateTime(start) || !isDateTime(end)) {
    throw new Error("Start time or end time is not a valid datetime.");
  }

  if (end <= start) {
    throw new Error("End time must be after start time.");
  }

  //let's make sure that the callout time period at least has the tutored scheduled within it, otherwise what is the point of calling out?
  const scheduleArray = await client.models.Schedule.list({
    filter: {
      and: [
        { tutorId: { eq: tutorId } },
        { startTime: { ge: start.toISOString() } },
        { startTime: { le: end.toISOString() } },
      ]
    }    
  })

  if (scheduleArray.data.length == 0) {
    throw new Error("Tutor is not scheduled during this callout period.");
  }


  const result = await client.models.Callout.create({
      tutorId: tutorId,
      absentStart: start.toISOString(),
      absentEnd: end.toISOString(),
      reason: reason.trim(),
  });

  return result;
}

export async function deleteCallout(id: string) {
  const result = await client.models.Callout.delete({ id });

  return result; //will return NULL if no Callout is found with the ID given
}

/**
 * List all Callouts for a tutor
 */
export async function listCalloutsByTutor(tutorId: string) {
  return await client.models.Callout.list({
    filter: { tutorId: { eq: tutorId } },
  });
}

/**
 * Observe all Callouts
 */
export function observeCallouts(callback: (Callouts: Schema["Callout"]["type"][]) => void) {
  return client.models.Callout.observeQuery().subscribe({
    next: ({ items }) => callback(items),
    error: (err) => console.error("Error observing Callouts:", err),
  });
}
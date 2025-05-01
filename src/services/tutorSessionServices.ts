// potential Ideas
// 1) Add a checker to make sure the tutor session is happening during the 
// 2)


import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { isDateTime } from "../utils/validators";
import { normalizeDateTime } from "../utils/normalizers";



const client = generateClient<Schema>();

// Add DST considerations, recurring capability (with ending date)
export async function createTutorSession(tutorId: string, startTime: string | Date | null, endTime?: string | Date | null) {
  if ((!tutorId || !startTime) || (!tutorId.trim() || !startTime.toString().trim())) {
    throw new Error("Tutor ID and start time are required.");
  }

  const start = normalizeDateTime(startTime);
  if (!isDateTime(start)) {
    throw new Error("Start time is not a valid datetime.");
  }

  if (endTime) { //if a session endtime is specified
    const end = normalizeDateTime(endTime);

    if (!isDateTime(end)) {
      throw new Error("End time is not a valid datetime.");
    }

    if (end <= start) {
      throw new Error("End time must be after start time.");
    }

    const result = await client.models.TutorSession.create({
      tutorId: tutorId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });

    return result.data;
  }

  const result = await client.models.TutorSession.create({
      tutorId: tutorId,
      startTime: start.toISOString(),
  });

  return result.data;
}

export async function setEndTime(tutorId: string, endTime: string | Date | null) {
  if (!endTime || !endTime.toString().trim()) {
    throw new Error("End time input is required.");
  }

  const newEndTime = normalizeDateTime(endTime);

  if (!isDateTime(newEndTime)) {
    throw new Error("End time is not a valid datetime.");
  }

  const result = await client.models.TutorSession.update({
    id: tutorId,
    endTime: newEndTime.toISOString(),
  });

  return result.data;
}

export async function deleteTutorSession(id: string) {
  const result = await client.models.TutorSession.delete({ id });

  return result.data; //will return NULL if no TutorSession is found with the ID given
}

/**
 * List all TutorSessions for a tutor
 */
export async function listTutorSessionsByTutor(tutorId: string) {
  const result = await client.models.TutorSession.list({
    filter: { tutorId: { eq: tutorId } },
  });

  //returns array of a tutor's sessions
  return result.data;
}

/**
 * Observe all TutorSessions
 */
export function observeTutorSessions(callback: (TutorSessions: Schema["TutorSession"]["type"][]) => void) {
  return client.models.TutorSession.observeQuery().subscribe({
    next: ({ items }) => callback(items),
    error: (err) => console.error("Error observing TutorSessions:", err),
  });
}

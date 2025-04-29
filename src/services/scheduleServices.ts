import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Result } from "aws-cdk-lib/aws-stepfunctions";

const client = generateClient<Schema>();

// Add DST considerations, recurring capability (with ending date)
export async function createSchedule(tutorId: string, startTime: string | Date | null, endTime: string | Date | null, recurrenceEnd: string | Date | null, roomId?: string | null) {
  if ((!tutorId || !startTime || !endTime) || (!tutorId.trim() || !startTime.toString().trim() || !endTime.toString().trim())) {
    throw new Error("Tutor ID, start time, end time, and recurrence end date required. are required.");
  }

  const start = typeof startTime === "string" ? new Date(startTime.trim()) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime.trim()) : endTime;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Start time or end time is not a valid datetime.");
  }

  if (end <= start) {
    throw new Error("End time must be after start time.");
  }

  //if recurrenceEnd is populated, create schedules until that specified date
  if (recurrenceEnd) {
    //clean up the variable and ensure that it is type DateTime
    const cleanRecurrenceEnd = typeof startTime === "string" ? new Date(startTime.trim()) : startTime;
    
    //ensure that it is an actual DateTime type
    if (isNaN(cleanRecurrenceEnd.getTime())) {
      throw new Error("Recurrence end time is not a valid datetime.");
    }

    while (start < cleanRecurrenceEnd) {
      const existingRecurrence = await client.models.Schedule.list({
        filter: {
          tutorId: { eq: tutorId },
          startTime: { le: end.toISOString() },
          endTime: { ge: start.toISOString() },
        },
      });
  
      if (existingRecurrence.data.length > 0) {
        throw new Error("A schedule already exists for this tutor during the specified time.");
      }

      await client.models.Schedule.create({
        tutorId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        recurrenceEnd: cleanRecurrenceEnd.toISOString(),
        ...(roomId ? { roomId } : {}),
      })
  
      start.setDate(start.getDate() + 7); // Move to next week
      end.setDate(end.getDate() + 7); // Move to next week
    }
    //don't know what to return here.
  } else {
    const result = await client.models.Schedule.create({
      tutorId: tutorId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      ...(roomId ? { roomId } : {}),
    });

    return result;
  }
}

export async function deleteSchedule(id: string) {
  const dataWrapper = await client.models.Schedule.get({ id: id });

  const schedule = dataWrapper.data

  if (!schedule) {
    throw new Error(`Schedule id, ${id}, not found in the database. Nothing deleted.`);
  }

  const result = await client.models.Schedule.delete({ id });

  if (schedule.recurrenceEnd) { //if recurrencEnd has a date in it and isn't null
    const start = new Date(schedule.startTime);
    const recurrenceEnd = new Date(schedule.recurrenceEnd);

    start.setDate(start.getDate() + 7); //add a week

    while (start < recurrenceEnd) { //while 
      const scheduleArray = await client.models.Schedule.list({
        filter: {
          tutorId: {eq: schedule.tutorId}, //ensures only this tutor gets deleted.
          startTime: {eq: start.toISOString()},
        },
      });

      const nextWeekSchedule = scheduleArray.data[0];

      nextWeekSchedule.id;

      await client.models.Schedule.delete({ id: nextWeekSchedule.id });
  
      start.setDate(start.getDate() + 7); // Move to next week
    }
  }

  return result; //will return NULL if no schedule is found with the ID given
}

/**
 * List all schedules for a tutor
 */
export async function listSchedulesByTutor(tutorId: string) {
  return await client.models.Schedule.list({
    filter: { tutorId: { eq: tutorId } },
  });
}

/**
 * Observe all schedules
 */
export function observeSchedules(callback: (schedules: Schema["Schedule"]["type"][]) => void) {
  return client.models.Schedule.observeQuery().subscribe({
    next: ({ items }) => callback(items),
    error: (err) => console.error("Error observing schedules:", err),
  });
}

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { normalizeDateTime } from "../utils/normalizers";
import { isDateTime } from "../utils/validators";



const client = generateClient<Schema>();

// Add DST considerations, recurring capability (with ending date)
export async function createSchedule(tutorId: string, startTime: string | Date | null, endTime: string | Date | null, recurrenceEnd: string | Date | null, roomId?: string | null) {
  if ((!tutorId || !startTime || !endTime) || (!tutorId.trim() || !startTime.toString().trim() || !endTime.toString().trim())) {
    throw new Error("Tutor ID, start time, end time are required.");
  }

  const start = normalizeDateTime(startTime);
  const end = normalizeDateTime(endTime);

  if (!isDateTime(start) || !isDateTime(end)) {
    throw new Error("Start time or end time is not a valid datetime.");
  }

  if (end <= start) {
    throw new Error("End time must be after start time.");
  }

  const existingSchedule = await client.models.Schedule.list({
    filter: {
      tutorId: { eq: tutorId },
      startTime: { le: end.toISOString() },
      endTime: { ge: start.toISOString() },
    },
  });

  if (existingSchedule.data.length > 0) {
    throw new Error("A schedule already exists for this tutor during the specified time.");
  }

  const result = await client.models.Schedule.create({
    tutorId: tutorId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    ...(roomId ? { roomId } : {}),
  });


  //if recurrenceEnd is populated, create schedules until that specified date
  if (recurrenceEnd) {
    //clean up the variable and ensure that it is type DateTime
    const cleanRecurrenceEnd = normalizeDateTime(recurrenceEnd);
    
    //ensure that it is an actual DateTime type
    if (!isDateTime(cleanRecurrenceEnd)) {
      throw new Error("Recurrence end time is not a valid datetime.");
    }
    //collects the errors so recurringSchedules can continue to populate
    const errors: string[] = [];

    let isAllowed: boolean = true;

    do {
      isAllowed = true;
      start.setDate(start.getDate() + 7); // Move to next week
      end.setDate(end.getDate() + 7); // Move to next week

      const existingRecurrence = await client.models.Schedule.list({
        filter: {
          tutorId: { eq: tutorId },
          startTime: { le: end.toISOString() },
          endTime: { ge: start.toISOString() },
        },
      });
  
      // store error messages into an array that will be thrown later
      if (existingRecurrence.data.length > 0) {
        const overlappingSchedule = new Date(existingRecurrence.data[0].startTime);

        errors.push(`A schedule already exists for this tutor on ${overlappingSchedule.getMonth()+1}/${overlappingSchedule.getDate()}/${overlappingSchedule.getFullYear()} at ${overlappingSchedule.toLocaleTimeString()}.`);

        //make sure that the schedule doesn't get pushed to the DB anyways
        isAllowed = false;
      }

      if (isAllowed) {
        await client.models.Schedule.create({
          tutorId: tutorId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          recurrenceEnd: cleanRecurrenceEnd.toISOString(),
          ...(roomId ? { roomId } : {}),
        })
      }
    } while (start < cleanRecurrenceEnd);

    if (errors.length > 0) {
      //throws all the strings and errors
      throw new Error(`Some schedules failed:\n${errors.join("\n")}`);
    }
  }
  //will return the first schedule of the recurrence
  return result.data;
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

  return result.data; //will return NULL if no schedule is found with the ID given
}

export async function listSchedulesByTutor(tutorId: string) {
  return await client.models.Schedule.list({
    filter: { tutorId: { eq: tutorId } },
  });
}

export function observeSchedules(callback: (schedules: Schema["Schedule"]["type"][]) => void) {
  return client.models.Schedule.observeQuery().subscribe({
    next: ({ items }) => callback(items),
    error: (err) => console.error("Error observing schedules:", err),
  });
}

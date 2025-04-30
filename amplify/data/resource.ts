import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { STATUSES } from "../enums/statusEnum"; // ← reuse the array!

const schema = a
  .schema({  // Begin schema definition
    // TUTOR MODEL
    Tutor: a.model({
      firstName: a.string(),  
      lastName: a.string(),         // Tutor's full name (required)
      email: a.string(),          // Their email (must be unique, uniqueness enforced in identifier right below the model)
      // status: a.enum(['AVAILABLE', 'TUTORING', 'OVERTIME', 'UNAVAILBLE', 'CALLED-OUT']),
      status: a.enum(STATUSES),
      contactHours: a.float().default(0.0),    // Number of hours they're available
      availableCourses: a.hasMany('AvailableCourse', 'tutorId'), // One-to-many relationship
      schedules: a.hasMany('Schedule', 'tutorId'),
      sessions: a.hasMany('TutorSession', 'tutorId'),
      appointments: a.hasMany('Appointment', 'tutorId'),
      callouts: a.hasMany('Callout', 'tutorId'),
    }), // Use email as a unique identifier for Tutors

    // ALLCOURSE MODEL (catalog of courses like CSCI 101)
    Course: a.model({
      departmentCode: a.string().required(), // "CSCI"
      courseNumber: a.string().required(),      // 101
      courseName: a.string().required(),     // "Intro to Programming"
      availableCourses: a.hasMany('AvailableCourse', 'courseId'), // link to tutors who can teach this
    }),
    // AVAILABLECOURSE MODEL (join table between tutors and courses)
    AvailableCourse: a.model({
      tutorId: a.id().required(),  // Which tutor is available
      courseId: a.id().required(), // For which course
      tutor: a.belongsTo('Tutor', 'tutorId'),    // Link to Tutor table
      course: a.belongsTo('Course', 'courseId'), // Link to Course table
    }), // Unique combo

    // CAMPUS MODEL (like Main Campus, Montrose)
    Campus: a.model({
      campusName: a.string().required(),
      buildings: a.hasMany('Building', 'campusId'), // Each campus has many buildings
    }),

    // BUILDING MODEL
    Building: a.model({
      buildingName: a.string().required(),
      campusId: a.id().required(),                  // Which campus it's part of
      campus: a.belongsTo('Campus', 'campusId'),    // Link to Campus
      rooms: a.hasMany('Room', 'buildingId'),       // A building can have many rooms
    }),

    // ROOM MODEL
    Room: a.model({
      roomNumber: a.string().required(),             // Like "101" or "A214"
      buildingId: a.id().required(),
      building: a.belongsTo('Building', 'buildingId'),
      schedules: a.hasMany('Schedule', 'roomId'),    // What sessions are scheduled here
    }),

    // SCHEDULE MODEL (a scheduled shift for a tutor)
    Schedule: a.model({
      tutorId: a.id().required(),
      tutor: a.belongsTo('Tutor', 'tutorId'),
      startTime: a.datetime().required(),            // When the session starts
      endTime: a.datetime().required(),              // When it ends
      recurrenceEnd: a.datetime(),                   // Optional end date for recurring sessions
      roomId: a.id(),                                // Optional room
      room: a.belongsTo('Room', 'roomId'),
    }),

    // TUTORSESSION MODEL (real-time record of a tutor actually tutoring)
    TutorSession: a.model({
      tutorId: a.id().required(),
      tutor: a.belongsTo('Tutor', 'tutorId'),
      startTime: a.datetime().required(),
      endTime: a.datetime(),                              // null if they're still tutoring
    }),

    Appointment: a.model({
        tutorId: a.id().required(),
        tutor: a.belongsTo('Tutor', 'tutorId'),
        scheduledStartTime: a.datetime().required(),
        actualStartTime: a.datetime(),
        endTime: a.datetime(),
        recurrenceEnd: a.datetime(),
        description: a.string(), 
    }),

    // CALLOUT MODEL (tutor is out that day or partially)
    Callout: a.model({
        tutorId: a.id().required(),
        tutor: a.belongsTo('Tutor', 'tutorId'),
        absentStart: a.datetime().required(),
        absentEnd: a.datetime().required(),
        reason: a.string().required(),
    }),
    
  }).authorization((allow) => [allow.authenticated()]); // End schema

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
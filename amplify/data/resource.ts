import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
// const schema = a
//   .schema({
//     Tutor: a.model({
//         // tutorId: a.id().required(),
//         // fields can be of various scalar types,
//         // such as string, boolean, float, integers etc.
//         firstName: a.string(),
//         lastName: a.string(),
//         email: a.string(),
//         classes: a.string().array(),
//         // fields can be of custom types
      
//         // collectionId: a.id(),
//         // collection: a.belongsTo("Collection", "collectionId")
//         // Use custom identifiers. By default, it uses an `id: a.id()` field
//       }),
//       // .identifier(["name"]),
//     // Collection: a
//     //   .model({
//     //     customers: a.hasMany("Customer", "collectionId"), // setup relationships between types
//     //     tags: a.string().array(), // fields can be arrays
//     //     representativeId: a.id().required(),
//     //     // customize secondary indexes to optimize your query performance
//     //   })
//       // .secondaryIndexes((index) => [index("representativeId")]),
  // })
//   .authorization((allow) => [allow.publicApiKey()]);

const schema = a
  .schema({  // Begin schema definition
    // TUTOR MODEL
    Tutor: a.model({
      firstName: a.string().required(),  
      lastName: a.string().required(),         // Tutor's full name (required)
      email: a.string().required(),          // Their email (must be unique, uniqueness enforced in identifier right below the model)
      status: a.enum(['AVAILABLE', 'TUTORING', 'OVERTIME', 'UNSCHEDULED', 'OUT']),
      contactHours: a.float().default(0.0),    // Number of hours they're available
      availableCourses: a.hasMany('AvailableCourse', 'tutorId'), // One-to-many relationship
      schedules: a.hasMany('Schedule', 'tutorId'),
      callouts: a.hasMany('TutorCallout', 'tutorId'),
    }), // Use email as a unique identifier for Tutors

    // ALLCOURSE MODEL (catalog of courses like CSCI 101)
    AllCourse: a.model({
      departmentCode: a.string().required(), // "CSCI"
      courseNumber: a.integer().required(),      // 101
      courseName: a.string().required(),     // "Intro to Programming"
      availableCourses: a.hasMany('AvailableCourse', 'courseId'), // link to tutors who can teach this
    }),
    // AVAILABLECOURSE MODEL (join table between tutors and courses)
    AvailableCourse: a.model({
      tutorId: a.id().required(),  // Which tutor is available
      courseId: a.id().required(), // For which course
      tutor: a.belongsTo('Tutor', 'tutorId'),    // Link to Tutor table
      course: a.belongsTo('AllCourse', 'courseId'), // Link to Course table
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
      roomId: a.id(),                                // Optional room
      room: a.belongsTo('Room', 'roomId'),
      sessions: a.hasMany('TutorSession', 'scheduleId'),
    }),

    // TUTORSESSION MODEL (real-time record of a tutor actually tutoring)
    TutorSession: a.model({
      scheduleId: a.id().required(),                      // Link to Schedule
      schedule: a.belongsTo('Schedule', 'scheduleId'),
      startTime: a.datetime().required(),
      endTime: a.datetime(),                              // null if they're still tutoring
    }),

    // TUTORCALLOUT MODEL (tutor is out that day or partially)
    TutorCallout: a.model({
        tutorId: a.id().required(),
        tutor: a.belongsTo('Tutor', 'tutorId'),
        absentStart: a.datetime().required(),
        absentEnd: a.datetime().required(),
        reason: a.string().required(),
    }),
    
  }).authorization((allow) => [allow.publicApiKey()]); // End schema

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
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

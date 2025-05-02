import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import { createTutor } from "./services/tutorServices";
import { createSchedule } from "./services/scheduleServices";
// import { NetworkAcl } from "aws-cdk-lib/aws-ec2";

const client = generateClient<Schema>();

type Course = Schema["Course"]["type"];


function Admin() {
  const { signOut } = useAuthenticator();

  //State to hold the list of all tutors retrieved from the database
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);
  const [showForm, setShowForm] = useState(false);

  const [courseSearch, setCourseSearch] = useState("");// Hold/track what the user types
  const [suggestions, setSuggestions] = useState<Array<Schema["Course"]["type"]>>([]);//hold/track the live search results
  const [selectedCourses, setSelectedCourses] = useState<Array<Schema["Course"]["type"]>>([]);//keep track of which courses the user has selected
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [availability, setAvailability] = useState<Array<{  //State to hold the list of available time slots for the tutor
    day: string;
    startTime: string;  //09:00
    endTime: string;    //11:00
    recurrenceEnd?: string;  //2025-12-31
  }>>([]);

  // useEffect(() => {
  //   client.models.AllCourse.list({ limit: 10 })
  //     .then(({ data, errors }) => {
  //       console.log("AllCourse.list →", { count: data?.length, data, errors });
  //     })
  //     .catch(err => console.error("Failed to list AllCourse:", err));
  // }, []);

  useEffect(() => { //This function is used to fetch all courses from the database


    let isCancelled = false;  //flag to prevent state updates if the component unmount
    async function loadAllCourses() {
      let nextToken: string | undefined = undefined;  // pagination cursor - undefined means “start” or “no more pages”
      const courseList: Course[] = [];  //accumulator for all fetched course objects
      do {
        const resp = await client.models.Course.list({ //Fetch the list of courses from the database
          limit: 250,       // how many items to fetch per request
          nextToken,        // pagination cursor from previous iteration
        }) as {
          data?: (Course | null)[];
          nextToken?: string;
        };
        
  
        const page = resp.data?.filter((c): c is Course => c !== null) ?? [];        // filter out any null placeholders, defaulting to an empty array
        courseList.push(...page); // add this page’s courses into our growing list
        nextToken = resp.nextToken; // set up the cursor for the next loop; undefined will break the loop
      } while (nextToken); // keep going until resp.nextToken is undefined
      if (!isCancelled) {
        console.log("Fetched courses:", courseList);
        setAllCourses(courseList);  
        // only update state if the component is still mounted
      }
    }



    loadAllCourses().catch(console.error); // kick off the loader and log any errors
    return () => {
      isCancelled = true;  // cleanup - prevent setAllCourses after unmount

    };
  }, []);  

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => {
        const validTutors = data.items.filter(
          (tutor) => tutor?.firstName && tutor?.lastName && tutor?.email
        );
        setTutors(validTutors);
      },
    });
  }, []);//tells react to run this effect only once when the component mounts

  useEffect(() => {
    const term = courseSearch.trim().toLowerCase(); //process the user input and store it in term
    if (!term) {  //If the user input is empty, clear the suggestions
      setSuggestions([]);
      return;
    }
  
    // filter local array
    const matches = allCourses.filter(c => //Make a new list of courses that match the search term
      c.departmentCode.toLowerCase().includes(term)
      || c.courseNumber.toLowerCase().includes(term)
      || c.courseName.toLowerCase().includes(term)
    );
  
    setSuggestions(matches);  //Set the suggestions to the filtered list
  }, [courseSearch, allCourses]); //tells react to run this effect whenever courseSearch or allCourses changes

  async function makeTutor() {
    setShowForm(true);
    // const firstName = window.prompt("First Name");
    // const lastName = window.prompt("Last Name");
    // const email = window.prompt("Email");
  
    // if (firstName && lastName && email) {
    //   client.models.Tutor.create({ firstName, lastName, email });
    // } else {
    //   alert("Are you fucking stupid you dumb bitch?");
    // }
  }
  

  //function to handle form submission from creating a new tutor
  async function submitTutor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;

    try {
      // create the tutor record
      const tutor = await createTutor(firstName, lastName, email);
      if(!tutor) {  //Was ye;lling at me if I didn't insure that tutor wasn't null
        throw new Error("Tutor was null");
        
      }
      //for each selected course, create the join record
      await Promise.all(
        selectedCourses.map(c =>
          client.models.AvailableCourse.create({
            tutorId:  tutor.id,
            courseId: c.id
          })
        )
      );

      //for each individual time slot that the user entered, add it to the schedule record
      await Promise.all(  //Just telling it to wait until all schedules have been created
        availability.map(slot => //Go through the availability array and add the times that the user entered into the schedule table
          createSchedule( //Service function to create a schedule
            tutor.id, //Link the schedule to the tutor
            computeDateTime(slot.day, slot.startTime),  // convert the start date and time to a DateTime string
            computeDateTime(slot.day, slot.endTime),  //Convert the end date and time to a DateTime string
            slot.recurrenceEnd ? slot.recurrenceEnd : null  //If the user entered a recurrence end date, use it. Otherwise, set it to null
          )
        )
      );

      setSelectedCourses([]);
      setShowForm(false);
    } catch (err) {
      console.error("CREATE TUTOR ERROR:", err);
      alert("Failed to create tutor");
    }
  }
    
  async function deleteTutor(id: string) { //async because we need to wait for the database to finish deleting the tutor
    try {
      await client.models.Tutor.delete({ id }); //delete the tutor with the given id
      const { data: updatedTutors } = await client.models.Tutor.list(); //Manually get the updated list of tutors from the database to avoid stale cache
      setTutors(updatedTutors.filter(t => t?.firstName && t?.lastName && t?.email));//Filter out any tutors that are missing required fields
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete tutor");
    }
  }

  //Function prompt for the user to enter the start and end time for a given day and then add it to the availability array
  async function handleAddTime(day: string) {
    const start = window.prompt(`Start time for ${day} (HH:MM)`) || "";
    const end = window.prompt(`End time for ${day} (HH:MM)`) || "";
    const recurrence = window.prompt(`Recurrence End Date for ${day} (YYYY-MM-DD, optional)`) || undefined;
  
    if (!start || !end) {
      alert("Start and end time are required");
      return;
    }
  
    setAvailability(prev => [...prev, { day, startTime: start, endTime: end, recurrenceEnd: recurrence }]); 
    //Add the new time slot to the availability array
  }

  //Here we just need to convert days (Monday)  and times (09:00) into offical DateTime strings
  function computeDateTime(day: string, time: string): string { //Takes in strings with format 
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(day); //Convert day name to a number (0-6)

    const currentDay = new Date();
    const todaysDay = currentDay.getDay(); //1 = monday, 2 = tuesday

    let daysAhead = 0;
    if (targetDay > todaysDay) { //The target day is this week
      daysAhead = targetDay - todaysDay;
    } else {
      daysAhead = 7 - (todaysDay - targetDay); //Else wrap around to next week
    }

    const date = new Date(currentDay);
    date.setDate(currentDay.getDate() + daysAhead); //Save the correct date that we want them to work
    const [hours, minutes] = time.split(":").map(Number); //save the hours and minutes
    date.setHours(hours, minutes, 0, 0);  //Set the time to the correct hours and minutes

    return date.toISOString();  //Return the date in the correct format
  }

  return (
    <main>
      {showForm ? ( //If showForm is true, show the form to create a new tutor
        // ONLY show the form when showForm is true
        <form onSubmit={submitTutor}>
        <input name="firstName" placeholder="First Name" />
        <input name="lastName"  placeholder="Last Name" />
        <input name="email"     placeholder="Email" />

        {/* Course Search Input */}
            <input
      type="text"
      placeholder="Search courses…"
      value={courseSearch}
      onChange={e => setCourseSearch(e.target.value)}
    />

    <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid black", marginTop: "0.5rem" }}>
      {allCourses
        .filter(c => {
          const term = courseSearch.toLowerCase();
          return (
            c.departmentCode.toLowerCase().includes(term) ||
            c.courseNumber.toLowerCase().includes(term) ||
            c.courseName.toLowerCase().includes(term)
          );
        })
        .map(c => (
          <div key={c.id} onClick={() => setSelectedCourses(prev => [...prev, c])}>
            {c.departmentCode} {c.courseNumber} — {c.courseName}
          </div>
        ))}
    </div>


        {/* SELECTED COURSES */}
        {selectedCourses.length > 0 && (  //If there are any selected courses, show them
          <div>
            <strong>Selected courses:</strong>
            <ul>
              {selectedCourses.map(c => ( //For each selected course, show the course name and number
                <li key={c.id}>
                  {c.departmentCode} {c.courseNumber} — {c.courseName}
                  <button type="button" onClick={() =>
                    setSelectedCourses(prev => prev.filter(x => x.id !== c.id)) //remove the course from the selected list
                  }>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Block for gathering/showing available time slots
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>  
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ( // loop through the days of the week and create a mini box for each one
          <div key={day} style={{ border: '1px solid #ccc', padding: '0.5rem', borderRadius: '8px', width: '150px' }}>
            <strong>{day}</strong>
            <button type="button" onClick={() => handleAddTime(day)}>Add Time</button>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {availability.filter(a => a.day === day).map((slot, index) => ( // list the time slots added for that day
                <li key={index}>
                  {slot.startTime}–{slot.endTime}
                  {slot.recurrenceEnd && ` (until ${slot.recurrenceEnd})`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div> */}

        <button type="submit">Add Tutor</button>
        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
      </form>
      ) : (
        // show everything else when showForm is false
        <>
          <center><h1>Tutors</h1></center>
  
          <button onClick={makeTutor}> Add new Tutor</button>
  
          <ul>
            {tutors.map((Tutor) => (
              <li onClick={() => deleteTutor(Tutor.id)} key={Tutor.id}>
                {Tutor.firstName}, {Tutor.lastName}, {Tutor.email}
              </li>
            ))}
          </ul>
          <button onClick={signOut}>Sign out</button>
        </>
      )}
    </main>
  );
}

function FrontDesk() {
  const { signOut } = useAuthenticator();
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => {
        const validTutors = data.items.filter(
          (tutor) => tutor?.firstName && tutor?.lastName && tutor?.email
        );
        setTutors(validTutors);
      },
    });
  }, []);

  return (
    <main>
      {/* <h1>{user?.signInDetails?.loginId}'s Todos </h1> */}
      <center><h1>Tutors</h1></center>

      <ul>
        {tutors.map((Tutor) => (
          <li key={Tutor.id}>{Tutor.firstName}, {Tutor.lastName}, {Tutor.email}</li>
        ))}
      </ul>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

function GetUser() {
  const [userGroup, setUserGroup] = useState<string | null>(null);
  const { signOut } = useAuthenticator();

  /*
  The issue here was caused by fetching the session outside of the useEffect hook.
  When fetchAuthSession ran, the session data (and thus the token payload) wasn't available yet,
  so 'groups' ended up being undefined (or an empty array). By moving the session fetch
  inside the useEffect, we ensure that the token payload is available when we try to extract 
  'cognito:groups', which resolves the bug.
  */

  useEffect(() => {
    async function fetchAndSetUserGroup() { // Use an async function to fetch the session so we can wait for it to resolve before fetching
      try {
        const session = await fetchAuthSession(); // Fetch session when it is available
        const payload = session.tokens?.accessToken?.payload;
        console.log("Token payload:", payload);
        const groups = (payload?.["cognito:groups"] as string[]) || [];
        console.log("User groups:", groups.toString());

        if (groups.includes("Admin")) {
          setUserGroup("Admin");
        } else if (groups.includes("FrontDesk")) {
          setUserGroup("FrontDesk");
        } else {
          setUserGroup("Unknown");
        }
      } catch (err) {
        console.error(err);
        setUserGroup("Unknown");
      }
    }
    fetchAndSetUserGroup();
  }, []);

  if (userGroup === "Admin") {
    return <Admin />;
  } else if (userGroup === "FrontDesk") {
    return <FrontDesk />;
  } else {
    return (
      <div>
        <p>You are not part of a recognized user group.</p>
        <button onClick={signOut}>Sign out</button>
      </div>
    );
  }
}

function App() {
  return (
    <Authenticator>
        <main style={{ padding: "2rem" }}>
          {/* Render the dashboard component based on the user's group */}
          <GetUser />
          {/* Sign out button */}
        </main>
    </Authenticator>
  );
}

export default App;
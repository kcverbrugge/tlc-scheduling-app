import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import { createTutor } from "./services/tutorServices";


type AllCourseType = Schema["Course"]["type"];
const client = generateClient<Schema>();

function Admin() {
  const { signOut } = useAuthenticator();

  //State to hold the list of all tutors retrieved from the database
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);
  const [showForm, setShowForm] = useState(false);

  const [courseSearch, setCourseSearch] = useState("");// Hold/track what the user types
  const [suggestions, setSuggestions] = useState<Array<Schema["Course"]["type"]>>([]);//hold/track the live search results
  const [selectedCourses, setSelectedCourses] = useState<Array<Schema["Course"]["type"]>>([]);//keep track of which courses the user has selected
  const [allCourses, setAllCourses] = useState<AllCourseType[]>([]);

  // useEffect(() => {
  //   client.models.AllCourse.list({ limit: 10 })
  //     .then(({ data, errors }) => {
  //       console.log("AllCourse.list →", { count: data?.length, data, errors });
  //     })
  //     .catch(err => console.error("Failed to list AllCourse:", err));
  // }, []);

  useEffect(() => {
    let isCancelled = false;  //flag to prevent state updates if the component unmount
    async function loadAllCourses() {
      let nextToken: string | undefined = undefined;  // pagination cursor - undefined means “start” or “no more pages”
      const courseList: AllCourseType[] = [];  //accumulator for all fetched course objects
      do {
        const resp = await client.models.Course.list({ //Fetch the list of courses from the database
          limit: 250,       // how many items to fetch per request
          nextToken,        // pagination cursor from previous iteration
        }) as {
          data?: (AllCourseType | null)[];
          nextToken?: string;
        };
  
        const page = resp.data?.filter((c): c is AllCourseType => c !== null) ?? [];        // filter out any null placeholders, defaulting to an empty array
        courseList.push(...page); // add this page’s courses into our growing list
        nextToken = resp.nextToken; // set up the cursor for the next loop; undefined will break the loop
      } while (nextToken); // keep going until resp.nextToken is undefined
      if (!isCancelled) {
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
      // 1) create the tutor record
      const tutor = await createTutor(firstName, lastName, email);
      if(!tutor) {  //Was ye;lling at me if I didn't insure that tutor wasn't null
        throw new Error("Tutor was null");
        
      }
      // 2) for each selected course, create the join record
      await Promise.all(
        selectedCourses.map(c =>
          client.models.AvailableCourse.create({
            tutorId:  tutor.id,
            courseId: c.id
          })
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

  return (
    <main>
      {showForm ? ( //If showForm is true, show the form to create a new tutor
        // ONLY show the form when showForm is true
        <form onSubmit={submitTutor}>
        <input name="firstName" placeholder="First Name" />
        <input name="lastName"  placeholder="Last Name" />
        <input name="email"     placeholder="Email" />

        {/* COURSE SEARCH */}
          <input
            type="text"
            placeholder="Search courses…"
            value={courseSearch}
            onChange={e => setCourseSearch(e.target.value)}
          />
          {suggestions.length > 0 && (  //If there are any suggestions, show them
            <ul style={{ border: "1px solid #ccc", maxHeight: 200, overflowY: "auto" }}>
              {suggestions.map(c => ( //For each suggestion, show the course name and number
                <li key={c.id} onClick={() => {
                  setSelectedCourses(prev => [...prev, c]); //add the course to the selected list
                  setCourseSearch("");
                  setSuggestions([]);
                }}>
                  {c.departmentCode} {c.courseNumber} — {c.courseName} 
                </li>
              ))}
            </ul>
          )}
        
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
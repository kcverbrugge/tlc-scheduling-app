import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";



const client = generateClient<Schema>();

function Admin() {
  const { signOut } = useAuthenticator();

  //State to hold the list of all tutors retrieved from the database
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);
  const [showForm, setShowForm] = useState(false);

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

  async function createTutor() {
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
  
    if (firstName && lastName && email) {
      await client.models.Tutor.create({ firstName, lastName, email }); //await to insure that the database entry is fulfilled before closing the form
      setShowForm(false);
      const { data: allTutors } = await client.models.Tutor.list(); //Manually get the updated list of tutors from the database to avoid stale cache
      setTutors(allTutors.filter(t => t?.firstName && t?.lastName && t?.email)); //Filter out any tutors that are missing required fields

    } else {
      alert("Please fill out all fields.");
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
      {showForm ? (
        // ONLY show the form when showForm is true
        <form onSubmit={submitTutor}>
          <input name="firstName" placeholder="First Name" />
          <input name="lastName" placeholder="Last Name" />
          <input name="email" placeholder="Email" />
          <button type="submit">Add Tutor</button>
          <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      ) : (
        // show everything else when showForm is false
        <>
          <center><h1>Tutors</h1></center>
  
          <button onClick={createTutor}> Add new Tutor</button>
  
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
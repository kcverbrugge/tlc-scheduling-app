import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import { createTutor } from "./services/tutorServices"



const client = generateClient<Schema>();

function Admin() {
  const { signOut } = useAuthenticator();

  //State to hold the list of all tutors retrieved from the database
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => setTutors([...data.items]),
    });
  }, []);

  function promptTutor() {
    const firstName = window.prompt("First Name");
    const lastName = window.prompt("Last Name");
    const email = window.prompt("Email");
  
    try {
      createTutor(firstName, lastName, email);
    } catch {
      alert("Are you fucking stupid you dumb bitch?");
    }
  }

    
  function deleteTutor(id: string) {
    client.models.Tutor.delete({ id }, { authMode: "userPool" });
  }

    return (
      <main>
        {/* <h1>{user?.signInDetails?.loginId}'s Todos </h1> */}
        <center><h1>Tutors</h1></center>
        <button onClick={createTutor}>+ new Tutor</button>
        <ul>
          {tutors.map((Tutor) => (
            <li onClick={() => deleteTutor(Tutor.id)} key={Tutor.id}>{Tutor.firstName}, {Tutor.lastName}, {Tutor.email}</li>
          ))}
        </ul>
        <div>
          🥳 App successfully hosted. Try creating a new tutor.
          <br />
          <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
            Review next step of this tutorial.
          </a>
        </div>
        <button onClick={signOut}>Sign out</button>
      </main>
    );
}

function FrontDesk() {
  const { signOut } = useAuthenticator();
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => setTutors([...data.items]),
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
      <div>
        🥳 App successfully hosted. Try creating a new tutor.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
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
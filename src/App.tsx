import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";



const client = generateClient<Schema>();

function Admin() {
  const { signOut } = useAuthenticator();
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);


  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => setTutors([...data.items]),
    });
  }, []);

  const createTutor = () => {
    const firstName = window.prompt("Enter First Name") || "";
    const lastName = window.prompt("Enter Last Name") || "";
    if (firstName && lastName) {
      client.models.Tutor.create({ firstName, lastName });
    }
  };

  function deleteTutor(id: string) {
      client.models.Tutor.delete({ id })
    }

    return (
      <main>
        {/* <h1>{user?.signInDetails?.loginId}'s Todos </h1> */}
        <center><h1>Tutors</h1></center>
        <button onClick={createTutor}>+ new Tutor</button>
        <ul>
          {tutors.map((Tutor) => (
            <li onClick={() => deleteTutor(Tutor.id)} key={Tutor.id}>{Tutor.firstName}, {Tutor.lastName}</li>
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
          <li key={Tutor.id}>{Tutor.firstName}, {Tutor.lastName}</li>
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

const session = await fetchAuthSession();
const groups = (session.tokens?.accessToken?.payload?.['cognito:groups'] as string[]) || [];

function GetUser() {
  const [userGroup, setUserGroup] = useState<string | null>(null);

  useEffect(() => {
      console.log('User groups:', groups);
      console.log('Token payload:', session.tokens?.accessToken?.payload);

      if (groups.includes("Admin")) {
        setUserGroup("Admin");
      } else if (groups.includes("FrontDesk")) {
        setUserGroup("FrontDesk");
      } else {
        setUserGroup("Unknown");
      }
  }, []);

  if (userGroup === "Admin") {
    return <Admin />;
  } else if (userGroup === "FrontDesk") {
    return <FrontDesk />;
  } else {
    return (
      <div>
        <p>You are not part of a recognized user group.</p>
      </div>
    );
  }
}

function App() {
  return (
    <Authenticator>
      {({ signOut}) => (
        <main style={{ padding: "2rem" }}>
          {/* Render the dashboard component based on the user's group */}
          <GetUser />
          {/* Sign out button */}
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}


// function App() {
//   const { signOut } = useAuthenticator();
//   // Since user is not being used, the build will fail even though it is just a warning.
//   // const { user, signOut } = useAuthenticator();

//   const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

//   useEffect(() => {
//     client.models.Tutor.observeQuery().subscribe({
//       next: (data) => setTutors([...data.items]),
//     });
//   }, []);

//   function createTutor() {
//     client.models.Tutor.create({ firstName: window.prompt("First Name"), lastName: window.prompt("Last Name") });
//   }

    
  // function deleteTutor(id: string) {
  //   client.models.Tutor.delete({ id })
  // }

  // return (
  //   <main>
  //     {/* <h1>{user?.signInDetails?.loginId}'s Todos </h1> */}
  //     <center><h1>Tutors</h1></center>
  //     <button onClick={createTutor}>+ new Tutor</button>
  //     <ul>
  //       {tutors.map((Tutor) => (
  //         <li onClick={() => deleteTutor(Tutor.id)} key={Tutor.id}>{Tutor.firstName}, {Tutor.lastName}</li>
  //       ))}
  //     </ul>
  //     <div>
  //       🥳 App successfully hosted. Try creating a new tutor.
  //       <br />
  //       <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
  //         Review next step of this tutorial.
  //       </a>
  //     </div>
  //     <button onClick={signOut}>Sign out</button>
  //   </main>
  // );
// }



export default App;

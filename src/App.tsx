import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const { signOut } = useAuthenticator();
  // Since user is not being used, the build will fail even though it is just a warning.
  // const { user, signOut } = useAuthenticator();

  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => setTutors([...data.items]),
    });
  }, []);

  function createTutor() {
    const firstName = window.prompt("First Name");
    const lastName = window.prompt("Last Name");
    const email = window.prompt("Email");
  
    if (firstName && lastName && email) {
      client.models.Tutor.create({ firstName, lastName, email });
    } else {
      alert("All fields are required to create a tutor.");
    }
  }

    
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



export default App;

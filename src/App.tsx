import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();

  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => setTutors([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Tutor.create({ firstName: window.prompt("Todo content"), lastName: window.prompt("Todo content") });
  }

    
  function deleteTodo(id: string) {
    client.models.Tutor.delete({ id })
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {tutors.map((Tutor) => (
          <li onClick={() => deleteTodo(Tutor.id)} key={Tutor.id}>{Tutor.firstName}, {Tutor.lastName}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
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

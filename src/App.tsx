import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useRouter } from 'next/router';

const client = generateClient<Schema>();

function App() {
  const { signOut } = useAuthenticator();
  // Since user is not being used, the build will fail even though it is just a warning.
  // const { user, signOut } = useAuthenticator();

  const router = useRouter();

  const goToHomePage = () => {
    router.push('/App');
  }
  const goToAddPage = () => {
    router.push('/add');
  }
  const goToEditPage = () => {
    router.push('/edit');
  }
  const goToDeletePage = () => {
    router.push('/delete');
  }

  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => setTutors([...data.items]),
    });
  }, []);

  return (
    <main>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      </head>
      <body>
        <div className="topnav">
          <a onClick={signOut}>Sign Out</a>
          <a className="active" onClick={goToHomePage}>Home</a>
          <a onClick={goToAddPage}>Add Tutor</a>
          <a onClick={goToEditPage}>Edit Tutor</a>
          <a onClick={goToDeletePage}>Delete Tutor</a>
        </div>
        <p>App Page</p>
      </body>
    </main>
  );
}



export default App;

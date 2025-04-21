import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import "./index.css"

const client = generateClient<Schema>();

function Home() {
    const { signOut } = useAuthenticator();
      // Since user is not being used, the build will fail even though it is just a warning.
      // const { user, signOut } = useAuthenticator(); 

    const navigate = useNavigate();
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
        alert("Are you fucking stupid you dumb bitch?");
      }
    }

    return (
      <main>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        </head>
        <body>
          <div className="topnav">
            <a onClick={signOut}>Sign Out</a>
            <a className="active" onClick={() => navigate('/')}>Home</a>
            <a onClick={() => navigate('/add')}>Add Tutor</a>
            <a onClick={() => navigate('/edit')}>Edit Tutor</a>
            <a onClick={() => navigate('/delete')}>Delete Tutor</a>
          </div>
          <div className="searchSpace">
            <center><h1>Tutors</h1></center>
            <ul>
              {tutors.map((Tutor) => (
                <li>{Tutor.firstName}, {Tutor.lastName}, {Tutor.email}</li>
              ))}
            </ul>
          </div>
        </body>
      </main>
    );
}


export default Home;
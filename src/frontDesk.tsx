import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

const client = generateClient<Schema>();

function FrontHome() {
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

    return (
      <main>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        </head>
        <body>
          <div className="topnav">
            <a onClick={signOut}>Sign Out</a>
            <a className="active" onClick={() => navigate('/')}>Home</a>
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


export default FrontHome;
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import "./add.css"

function Add() {
    const { signOut } = useAuthenticator();
      // Since user is not being used, the build will fail even though it is just a warning.
      // const { user, signOut } = useAuthenticator();

    const navigate = useNavigate();

    return(
        <main>
          <head>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          </head>
          <body>
            <div className="topnav">
              <a onClick={signOut}>Sign Out</a>
              <a onClick={() => navigate('/')}>Home</a>
              <a className="active" onClick={() => navigate('/add')}>Add Tutor</a>
              <a onClick={() => navigate('/edit')}>Edit Tutor</a>
              <a onClick={() => navigate('/delete')}>Delete Tutor</a>
            </div>
            <p>Add Page</p>
          </body>
        </main>
    )
}


export default Add;
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import "./index.css"

function Home() {
    const { signOut } = useAuthenticator();
      // Since user is not being used, the build will fail even though it is just a warning.
      // const { user, signOut } = useAuthenticator(); 

    const navigate = useNavigate();

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
          <p>Home Page</p>
        </body>
      </main>
    );
}


export default Home;
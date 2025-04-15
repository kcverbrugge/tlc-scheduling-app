import { useAuthenticator } from '@aws-amplify/ui-react';
import goToHomePage from "./App.tsx";
import goToAddPage from "./App.tsx";
import goToEditPage from "./App.tsx";
import goToDeletePage from "./App.tsx";
import "./app.css"

function Add() {
    const { signOut } = useAuthenticator();
      // Since user is not being used, the build will fail even though it is just a warning.
      // const { user, signOut } = useAuthenticator();

    return(
        <main>
          <head>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          </head>
          <body>
            <div className="topnav">
              <a onClick={signOut}>Sign Out</a>
              <a onClick={goToHomePage}>Home</a>
              <a className="active" onClick={goToAddPage}>Add Tutor</a>
              <a onClick={goToEditPage}>Edit Tutor</a>
              <a onClick={goToDeletePage}>Delete Tutor</a>
            </div>
            <p>Add Page</p>
          </body>
        </main>
    )
}


export default Add;
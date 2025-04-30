import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { createTutor } from "./services/tutorServices.ts";

function Add() {
    const { signOut } = useAuthenticator();
      // Since user is not being used, the build will fail even though it is just a warning.
      // const { user, signOut } = useAuthenticator();

    const navigate = useNavigate();

    function validateForm() {
      const inputs = document.querySelectorAll('#myForm input[type="text"]');
      let allFilled = true;
      const values = {};

      inputs.forEach(input => {
        const value = input.value.trim();
        if (!value) {
          input.classList.add('invalid');
          allFilled = false;
        } else {
          input.classList.remove('invalid');
          values[input.id] = value;
        }
      });

      if (allFilled) {
        createTutor(values.firstName, values.lastName, values.email);
        inputs.forEach(input => {
          input.value = '';
        });
        input.classList.remove('invalid');
      }
    }

    return(
        <main>
          <head>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          </head>
          <body>
            <div className="top-bar">
              <div className="top-bar-text">Add Tutor</div>
              <button className="top-bar-button" onClick={signOut}>Sign Out</button>
            </div>
            {/* Input box */}
            <center><h1>Add Tutor</h1></center>
            <div className="center-box">
              <form id="myForm">
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" id="firstName"></input>
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input type="text" id="lastName"></input>
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="text" id="email"></input>
                </div>
                <div className="button-group">
                  <button type="button" onClick={validateForm}>Add Tutor</button>
                  <button type="button" onClick={() => navigate('/')}>Home</button>
                </div>
              </form>
            </div>
            {/* End Input box */}
          </body>
        </main>
    )
}


export default Add;
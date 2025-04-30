import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { getTutor } from "./services/tutorServices.ts";
    

function Info() {
  const { signOut } = useAuthenticator();
  const navigate = useNavigate();
  const { id } = useParams();

  let tutor = getTutor(String(id));

  return(
    <main>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      </head>
      <body>
        <div className="top-bar">
            <div className="top-bar-text">Tutor Info</div>
            <button className="top-bar-button" onClick={signOut}>Sign Out</button>
        </div>
        {/* Display box */}
        <center><h1>Tutor Info</h1></center>
        <div className="center-wrapper">
          <div className="info-box">
            <div className="info-row">
              <div className="info-label">Name: </div>
              <div className="info-text">First Last</div>
            </div>
            <div className="info-row">
              <div className="info-label">Email:</div>
              <div className="info-text">Email@email.com</div>
            </div>
            <div className="info-row">
              <div className="info-label">Courses:</div>
              <div className="info-text">CSCI 110, CSCI 111, CSCI 112</div>
            </div>
            <div className="button-group">
              <button type="button" onClick={() => navigate(`/edit/${id}`)}>Edit Tutor</button>
              <button type="button" onClick={() => navigate('/')}>Home</button>
            </div>
          </div>
        </div>
        {/* End Display box */}
      </body>
    </main>
  )
}


export default Info;
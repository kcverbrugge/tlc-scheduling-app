import { useEffect, useState} from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, useParams} from 'react-router-dom';
import { getCoursesForTutor } from "./services/availableCourseServices.ts";

const client = generateClient<Schema>();
    
function Info() {
  const { signOut } = useAuthenticator();
  const navigate = useNavigate();
  const { id } = useParams();
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => {
        const validTutors = data.items.filter((tutor) => tutor?.firstName && tutor?.lastName && tutor?.email);
        setTutors(validTutors);
      },
    });
  }, []);//tells react to run this effect only once when the component mounts

  let tutor: { [key: string]: any } = {};
  for(let i=0; i<tutors.length; i++){
    if(id == tutors[i].id){
      tutor["firstName"] = tutors[i].firstName;
      tutor["lastName"] = tutors[i].lastName;
      tutor["email"] = tutors[i].email;
      tutor["id"] = tutors[i].id;
      break;
    }
  }

  let courseList = getCoursesForTutor(String(id));

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
              <div className="info-text">{tutor["firstName"]} {tutor["lastName"]}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Email:</div>
              <div className="info-text">{tutor["email"]}</div>
            </div>
            <div className="info-row">
              <div className="info-label">ID:</div>
              <div className="info-text">{tutor["id"]}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Courses:</div>
              <div className="info-text">{String(courseList)}</div>{/*///////////////////////////////////////////////////////////////////*/}
            </div>
            <div className="button-group">
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
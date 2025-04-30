import { useEffect, useState} from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { createTutor } from "./services/tutorServices.ts";

type AllCourseType = Schema["Course"]["type"];
const client = generateClient<Schema>();

function Add() {
    const { signOut } = useAuthenticator();

    const navigate = useNavigate();
    const [courseSearch, setCourseSearch] = useState("");// Hold/track what the user types
    const [suggestions, setSuggestions] = useState<Array<Schema["Course"]["type"]>>([]);//hold/track the live search results
    const [selectedCourses, setSelectedCourses] = useState<Array<Schema["Course"]["type"]>>([]);//keep track of which courses the user has selected
    const [allCourses, setAllCourses] = useState<AllCourseType[]>([]);

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

    //Course search effects
    useEffect(() => {
      let isCancelled = false;  //flag to prevent state updates if the component unmount
      async function loadAllCourses() {
        let nextToken: string | undefined = undefined;  // pagination cursor - undefined means “start” or “no more pages”
        const courseList: AllCourseType[] = [];  //accumulator for all fetched course objects
        do {
          const resp = await client.models.Course.list({ //Fetch the list of courses from the database
            limit: 250,       // how many items to fetch per request
            nextToken,        // pagination cursor from previous iteration
          }) as {
            data?: (AllCourseType | null)[];
            nextToken?: string;
          };
          
          const page = resp.data?.filter((c): c is AllCourseType => c !== null) ?? [];        // filter out any null placeholders, defaulting to an empty array
          courseList.push(...page); // add this page’s courses into our growing list
          nextToken = resp.nextToken; // set up the cursor for the next loop; undefined will break the loop
        } while (nextToken); // keep going until resp.nextToken is undefined
        if (!isCancelled) {
          setAllCourses(courseList);  
          // only update state if the component is still mounted
        }
      }
      
      loadAllCourses().catch(console.error); // kick off the loader and log any errors
      return () => {
        isCancelled = true;  // cleanup - prevent setAllCourses after unmount
        
      };
    }, []);  

    useEffect(() => {
        const term = courseSearch.trim().toLowerCase(); //process the user input and store it in term
        if (!term) {  //If the user input is empty, clear the suggestions
          setSuggestions([]);
          return;
        }
        
        // filter local array
        const matches = allCourses.filter(c => //Make a new list of courses that match the search term
          c.departmentCode.toLowerCase().includes(term)
          || c.courseNumber.toLowerCase().includes(term)
          || c.courseName.toLowerCase().includes(term)
        );
        
        setSuggestions(matches);  //Set the suggestions to the filtered list
    }, [courseSearch, allCourses]); //tells react to run this effect whenever courseSearch or allCourses changes
      

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
                <div>
                  <input type="text" placeholder="Search courses…" value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}></input>
                </div>
                <div className="button-group">
                  <button type="button" onClick={validateForm}>Add Tutor</button>
                  <button type="button" onClick={() => navigate('/')}>Home</button>
                </div>
              </form>
            </div>
            {/* End Input box */}
            {/* COURSE SEARCH */}
            {suggestions.length > 0 && (  //If there are any suggestions, show them
              <ul style={{ border: "1px solid #ccc", maxHeight: 200, overflowY: "auto" }}>
                {suggestions.map(c => ( //For each suggestion, show the course name and number
                  <li key={c.id} onClick={() => {
                    setSelectedCourses(prev => [...prev, c]); //add the course to the selected list
                    setCourseSearch("");
                    setSuggestions([]);
                  }}>
                    {c.departmentCode} {c.courseNumber} — {c.courseName} 
                  </li>
                ))}
              </ul>
            )}
            {/* END COURSE SEARCH */}
            {/* SELECTED COURSES */}
            {selectedCourses.length > 0 && (  //If there are any selected courses, show them
              <div>
                <strong>Selected courses:</strong>
                <ul>
                  {selectedCourses.map(c => ( //For each selected course, show the course name and number
                    <li key={c.id}>
                      {c.departmentCode} {c.courseNumber} — {c.courseName}
                      <button type="button" onClick={() =>
                        setSelectedCourses(prev => prev.filter(x => x.id !== c.id)) //remove the course from the selected list
                      }>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* END SELECTED COURSES */}
          </body>
        </main>
    )
}


export default Add;
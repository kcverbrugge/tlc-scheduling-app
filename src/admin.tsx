import { useEffect, useState, useRef} from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { deleteTutor } from "./services/tutorServices.ts";


const client = generateClient<Schema>();

function Home() {
  const { signOut } = useAuthenticator();

  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);
  const [menuState, setMenuState] = useState({ open: false, x: 0, y: 0, tutor: null });//Ellipsis Menu
  const menuRef = useRef(null);//Ellipsis Menu
  const [searchQuery, setSearchQuery] = useState("");

  
  //Ellipsis Menu functions
  const handleEllipsisClick = (e: any, tutor: any) => {
    e.stopPropagation(); // prevent immediately closing
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({
      open: true,
      x: e.clientX,
      y: rect.bottom + window.scrollY, // opens right under the button
      tutor: tutor,
    });
  };
  const handleClickOutside = (e: { target: any; }) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuState({ open: false, x: 0, y: 0, tutor: null });
    }
  };
  //End of Ellipsis Menu functions

  //Delete functions
  function deleteConfirmation(Tutor: any) {
    var result = confirm(`Are you sure you want to delete ${Tutor.firstName} ${Tutor.lastName}?`);
    if (result){
      deleteTutor(Tutor.id);
    }
  }
  
  useEffect(() => {
    client.models.Tutor.observeQuery().subscribe({
      next: (data) => {
        const validTutors = data.items.filter(
          (tutor) => tutor?.firstName && tutor?.lastName && tutor?.email
        );
        setTutors(validTutors);
      },
    });
  }, []);//tells react to run this effect only once when the component mounts

  useEffect(() => {
    if (menuState.open) {//Ellipsis Menu
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuState.open]);//Ellipsis Menu

  //Search filter
  const filteredTutors = tutors.filter((tutor) => {
    const query = searchQuery.toLowerCase();
    return (
      tutor.firstName?.toLowerCase().includes(query) ||
      tutor.lastName?.toLowerCase().includes(query) ||
      tutor.email?.toLowerCase().includes(query)
    );
  });

  return (
    <main>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      </head>
      <body>
        <div className="top-bar">
          <div className="top-bar-text">Home</div>
          <button className="top-bar-button" onClick={signOut}>Sign Out</button>
        </div>
        <div className="searchSpace">
          <center><h1>Tutors</h1></center>
          {/* Search bar */}
          <div className="search-bar-container">
            <input type="text" placeholder="Search..." className="search-input" 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}></input>
            <button className="search-button" onClick={() => setSearchQuery("")}>Clear</button>
            <button className="search-button" onClick={() => navigate('/add')}>Add Tutor</button>
          </div>
          {/* Search bar */}
          <ul>
            {filteredTutors.map((Tutor) => (
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Name as button */}
                <button
                onClick={() => navigate(`/info/${Tutor.id}`)}
                style={{ border: 'none', background: 'transparent' }}
                onMouseEnter={(e) => e.target.style.color = '#007BFF'}
                onMouseLeave={(e) => e.target.style.color = '#000'}>
                <span>{Tutor.firstName}, {Tutor.lastName}, {Tutor.email}</span>
                </button>
                {/* End Name as button */}
                {/* Ellipsis */}
                <button 
                  onClick={(e) => handleEllipsisClick(e, Tutor)} 
                  style={{fontSize: '32px', lineHeight: '1', padding: '0 8px', border: 'none', background: 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555'}}
                  onMouseEnter={(e) => e.target.style.color = '#007BFF'}
                  onMouseLeave={(e) => e.target.style.color = '#555'}>
                &#8230;
                </button>
                {/* End Ellipsis */}
                {/* Ellipsis Menu */}
                {menuState.open && (
                  <div
                    ref={menuRef}
                    style={{
                      position: 'absolute',
                      top: `${menuState.y}px`,
                      left: `${menuState.x}px`,
                      backgroundColor: 'white',
                      border: 'none',
                      zIndex: 1000,
                    }}>
                    <button onClick={() => navigate(`/edit/${menuState.tutor.id}`)} style={{ display: 'flex', width: '100%' }}>
                      Edit Tutor
                    </button>
                    <button onClick={() => deleteConfirmation(menuState.tutor)} style={{ display: 'flex', width: '100%' }}>
                      Delete Tutor
                    </button>
                  </div>
                )}
                {/* End Ellipsis Menu */}
              </li>
            ))}
          </ul>
        </div>
      </body>
    </main>
  );
}


export default Home;
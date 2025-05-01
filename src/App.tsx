import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./admin.tsx";
import FrontHome from "./frontDesk.tsx";
import Add from "./add.tsx";
import Edit from "./edit.tsx";
import Info from "./info.tsx";

function GetUser() {
  const [userGroup, setUserGroup] = useState<string | null>(null);
  const { signOut } = useAuthenticator();

  useEffect(() => {
    async function fetchAndSetUserGroup() { // Use an async function to fetch the session so we can wait for it to resolve before fetching
      try {
        const session = await fetchAuthSession(); // Fetch session when it is available
        const payload = session.tokens?.accessToken?.payload;
        console.log("Token payload:", payload);
        const groups = (payload?.["cognito:groups"] as string[]) || [];
        console.log("User groups:", groups.toString());

        if (groups.includes("Admin")) {
          setUserGroup("Admin");
        } else if (groups.includes("FrontDesk")) {
          setUserGroup("FrontDesk");
        } else {
          setUserGroup("Unknown");
        }
      } catch (err) {
        console.error(err);
        setUserGroup("Unknown");
      }
    }
    fetchAndSetUserGroup();
  }, []);

  if (userGroup === "Admin") {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<Add />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/info/:id" element={<Info />} />
        </Routes>
      </Router>
    );
  } else if (userGroup === "FrontDesk") {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<FrontHome />} />
          <Route path="/info/:id" element={<Info />} />
        </Routes>
      </Router>
    );
  } else {
    return (
      <div>
        <p>You are not part of a recognized user group.</p> 
        <button onClick={signOut}>Sign out</button>
      </div>
    );
 
  }
}

function App() {
  return (
    <Authenticator>
        <main>
          {/* Render the dashboard component based on the user's group */}
          <GetUser />
          {/* Sign out button */}
        </main>
    </Authenticator>
  );
}


export default App;
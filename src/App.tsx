
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Add from "./add.tsx"
import Home from "./homePage.tsx"

const client = generateClient<Schema>();

function App() {

  const [tutors, setTutors] = useState<Array<Schema["Tutor"]["type"]>>([]);

  useEffect(() => {
        client.models.Tutor.observeQuery().subscribe({
          next: (data) => setTutors([...data.items]),
        });
      }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
      </Routes>
    </Router>
  );
}


export default App;

import React from "react";
import Stat from "./Stat.js";
import { useServer } from "./hooks.js";
import "./App.css";

function App() {
  const experience = useServer("/experience");

  if (experience.loading) {
    return null;
  }
  return (
    <div className="App">
      <header className="App-header">
        <Stat name="attack" experienceData={experience.data} />
      </header>
    </div>
  );
}

export default App;

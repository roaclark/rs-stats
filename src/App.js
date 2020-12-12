import React from "react";
import _ from "lodash";
import Stat from "./Stat.js";
import { useServer } from "./hooks.js";
import "./App.css";

function App() {
  const experience = useServer("/experience");
  const stats = useServer("/stats");
  const skills = useServer("/skills");

  if (experience.loading || stats.loading || skills.loading) {
    return null;
  }

  const getLevel = (exp) =>
    _.findLastIndex(experience.data, (lvlExp) => lvlExp <= exp);

  return (
    <div className="App">
      <header className="App-header">
        {skills.data.map(([skill]) => (
          <Stat
            name={skill}
            experienceData={experience.data}
            statsData={stats.data}
            getLevel={getLevel}
          />
        ))}
      </header>
    </div>
  );
}

export default App;

import React from "react";
import _ from "lodash";
import Stat from "./Stat.js";
import { useServer } from "./hooks.js";
import "./App.css";

function App() {
  const experience = useServer("/experience");
  const stats = useServer("/stats");

  if (experience.loading || stats.loading) {
    return null;
  }

  const getLevel = (exp) =>
    _.findLastIndex(experience.data, (lvlExp) => lvlExp < exp);

  return (
    <div className="App">
      <header className="App-header">
        <Stat
          name="attack"
          experienceData={experience.data}
          statsData={stats.data}
          getLevel={getLevel}
        />
      </header>
    </div>
  );
}

export default App;

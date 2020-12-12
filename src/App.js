import React from "react";
import _ from "lodash";
import styled from "styled-components";
import Stat from "./Stat.js";
import { useServer } from "./hooks.js";
import "./App.css";

const Hidable = styled.div`
  display: ${(props) => (props.show ? "block" : "none")};
`;

const NavLabel = styled.p`
  text-transform: capitalize;
  margin: 0px;

  :not(:first-child):before {
    margin: 0 10px;
    content: "•";
  }
`;

const NavHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 800px;
`;

const AppInner = ({ experienceData, skillsData, statsData }) => {
  const [selected, setSelected] = React.useState(skillsData[0].name);
  const getLevel = (exp) =>
    _.findLastIndex(experienceData, (lvlExp) => lvlExp <= exp);

  return (
    <>
      <NavHeader>
        {skillsData.map(({ name }) => (
          <NavLabel onClick={() => setSelected(name)}>{name}</NavLabel>
        ))}
      </NavHeader>
      {skillsData.map(({ name }) => (
        <Hidable show={name === selected}>
          <Stat
            name={name}
            experienceData={experienceData}
            statsData={statsData}
            getLevel={getLevel}
          />
        </Hidable>
      ))}
    </>
  );
};

function App() {
  const experience = useServer("/experience");
  const stats = useServer("/stats");
  const skills = useServer("/skills");

  if (experience.loading || stats.loading || skills.loading) {
    return null;
  }

  return (
    <div className="App">
      <AppInner
        experienceData={experience.data}
        skillsData={skills.data}
        statsData={stats.data}
      />
    </div>
  );
}

export default App;

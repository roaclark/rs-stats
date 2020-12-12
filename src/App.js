import React from "react";
import _ from "lodash";
import styled from "styled-components";
import Stat from "./Stat.js";
import MembersToggle from "./MembersToggle.js";
import { useServer } from "./hooks.js";
import "./App.css";

const Toggle = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  padding: 15px;
`;

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

const AppInner = ({ experienceData, skillsData, statsData, members }) => {
  const [selected, setSelected] = React.useState(skillsData[0]);
  const getLevel = (exp) =>
    _.findLastIndex(experienceData, (lvlExp) => lvlExp <= exp);

  const filteredSkillsData = members
    ? skillsData
    : skillsData.filter((sk) => !sk.members);

  React.useEffect(() => {
    if (selected.members) {
      setSelected(filteredSkillsData[0]);
    }
  }, [members]);

  return (
    <>
      <NavHeader>
        {filteredSkillsData.map((skill) => (
          <NavLabel onClick={() => setSelected(skill)}>{skill.name}</NavLabel>
        ))}
      </NavHeader>
      {filteredSkillsData.map(({ name }) => (
        <Hidable show={name === selected.name}>
          <Stat
            name={name}
            experienceData={experienceData}
            statsData={statsData}
            getLevel={getLevel}
            members={members}
          />
        </Hidable>
      ))}
    </>
  );
};

function App() {
  const [members, setMembers] = React.useState(true);
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
        members={members}
      />
      <Toggle>
        <MembersToggle members={members} setMembers={setMembers} />
      </Toggle>
    </div>
  );
}

export default App;

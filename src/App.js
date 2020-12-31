import React from "react";
import _ from "lodash";
import styled from "styled-components";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import Stat from "./Stat.js";
import Quests from "./Quests.js";
import Achievements from "./Achievements.js";
import Summary from "./Summary.js";
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

const NavLabel = styled(Link)`
  text-transform: capitalize;
  margin: 0px;
  color: white;
  text-decoration: none;

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

const TabData = ({
  skillsData,
  experienceData,
  statsData,
  getLevel,
  members,
}) => {
  const { selected } = useParams();

  return (
    <>
      {!selected && (
        <Summary
          statsData={statsData}
          skillsData={skillsData}
          getLevel={getLevel}
          members={members}
        />
      )}
      {skillsData.map(({ name }) => (
        <Hidable show={name === selected} key={name}>
          <Stat
            name={name}
            experienceData={experienceData}
            statsData={statsData}
            getLevel={getLevel}
            members={members}
          />
        </Hidable>
      ))}
      <Hidable show={"quests" === selected}>
        <Quests statsData={statsData} members={members} getLevel={getLevel} />
      </Hidable>
      <Hidable show={"achievements" === selected}>
        <Achievements statsData={statsData} getLevel={getLevel} />
      </Hidable>
    </>
  );
};

const AppInner = ({ experienceData, skillsData, statsData, members }) => {
  const getLevel = (exp) =>
    _.findLastIndex(experienceData, (lvlExp) => lvlExp <= exp);

  const filteredSkillsData = members
    ? skillsData
    : skillsData.filter((sk) => !sk.members);

  return (
    <Router>
      <NavHeader>
        {filteredSkillsData.map((skill) => (
          <NavLabel key={skill.name} to={`/${skill.name}`}>
            {skill.name}
          </NavLabel>
        ))}
        <NavLabel to="/quests">Quests</NavLabel>
        {members && <NavLabel to="/achievements">Achievements</NavLabel>}
      </NavHeader>
      <Switch>
        <Route path="/:selected">
          <TabData
            skillsData={skillsData}
            experienceData={experienceData}
            statsData={statsData}
            getLevel={getLevel}
            members={members}
          />
        </Route>
        <Route path="/">
          <TabData
            skillsData={skillsData}
            experienceData={experienceData}
            statsData={statsData}
            getLevel={getLevel}
            members={members}
          />
        </Route>
      </Switch>
    </Router>
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

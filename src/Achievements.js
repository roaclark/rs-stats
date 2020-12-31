import React from "react";
import _ from "lodash";
import styled from "styled-components";
import Table from "./Table.js";
import { useServer } from "./hooks.js";

const difficultyOrder = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
  Elite: 3,
};

const areas = {
  lumbridge_draynor: "Lumbridge and Draynor",
  varrock: "Varrock",
};

const Hidable = styled.div`
  display: ${(props) => (props.show ? "block" : "none")};
`;

const Title = styled.h1`
  margin-bottom: 15px;
`;

const TableContainer = styled.div`
  margin-bottom: 50px;
`;

const ReqList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const ReqItem = styled.li`
  text-decoration: ${(props) => (props.complete ? "line-through" : "inherit")};
  color: ${(props) => (props.complete ? "#555" : "white")};
`;

const SkillName = styled.span`
  text-transform: capitalize;
`;

const AreaSelect = styled.a`
  margin: 0px;
  color: white;
  text-decoration: none;

  :not(:first-child):before {
    margin: 0 10px;
    content: "•";
  }
`;

const AreaBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 800px;
  margin: auto;
  margin-bottom: 25px;
`;

const achievementAvailable = (
  achievement,
  statsData,
  completedQuests,
  getLevel
) => {
  const skillsComplete = _.every(achievement.skillReqs, (lvl, skill) => {
    return getLevel(statsData[skill]) >= lvl;
  });
  const questsComplete = _.every(achievement.questReqs, (req) =>
    completedQuests.includes(req)
  );
  return skillsComplete && questsComplete;
};

const QuestReqs = ({ reqs, completedQuests }) => {
  return (
    <ReqList>
      {reqs.map((req) => (
        <ReqItem key={req} complete={completedQuests.includes(req)}>
          {req}
        </ReqItem>
      ))}
    </ReqList>
  );
};

const SkillReqs = ({ reqs, statsData, getLevel }) => {
  return (
    <ReqList>
      {_.map(reqs, (v, k) => {
        const complete = getLevel(statsData[k]) >= v;
        return (
          <ReqItem key={k} complete={complete}>
            <SkillName>{k}</SkillName> ({v})
          </ReqItem>
        );
      })}
    </ReqList>
  );
};

const AchivementsTable = ({ statsData, getLevel, area, completedQuests }) => {
  const achievements = useServer("/achievements/" + area);

  if (achievements.loading) {
    return null;
  }

  const filteredAchievements = _.map(
    achievements.data.filter((a) => !a.complete),
    (achievement) => ({
      ...achievement,
      available: achievementAvailable(
        achievement,
        statsData,
        completedQuests,
        getLevel
      ),
    })
  );
  const sortedAchievements = _.sortBy(filteredAchievements, (achievement) => [
    difficultyOrder[achievement.difficulty],
    achievement.available ? 0 : 1,
    achievement.name,
  ]);

  const headers = ["Difficulty", "Task", "Skills", "Quests"];
  const data = sortedAchievements.map((achievement) => {
    return [
      achievement.difficulty,
      achievement.name,
      <SkillReqs
        reqs={achievement.skillReqs}
        statsData={statsData}
        getLevel={getLevel}
      />,
      <QuestReqs
        reqs={achievement.questReqs}
        completedQuests={completedQuests}
      />,
    ];
  });

  return (
    <Table
      header={headers}
      data={data}
      rowStyles={(_row, i) => ({
        background: sortedAchievements[i].available
          ? "rgba(0, 255, 0, 0.05)"
          : "rgba(255, 0, 0, 0.05)",
      })}
    />
  );
};

const Achievements = ({ statsData, getLevel }) => {
  const completedQuests = useServer("/completed");
  const [selected, setSelected] = React.useState("lumbridge_draynor");

  if (completedQuests.loading) {
    return null;
  }

  return (
    <>
      <Title>Achievements</Title>
      <AreaBar>
        {_.map(areas, (name, id) => (
          <AreaSelect onClick={() => setSelected(id)}>{name}</AreaSelect>
        ))}
      </AreaBar>
      <TableContainer>
        {_.map(areas, (_name, id) => {
          return (
            <Hidable show={id === selected}>
              <AchivementsTable
                statsData={statsData}
                getLevel={getLevel}
                area={id}
                completedQuests={completedQuests.data}
              />
            </Hidable>
          );
        })}
      </TableContainer>
    </>
  );
};

export default Achievements;

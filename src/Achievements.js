import React from "react";
import _ from "lodash";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Table from "./Table.js";
import { useServer, serverPost } from "./hooks.js";

const difficultyOrder = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
  Elite: 3,
};

const areas = {
  ardougne: "Ardougne",
  desert: "Desert",
  falador: "Falador",
  fremennik: "Fremennik",
  kandarin: "Kandarin",
  karamja: "Karamja",
  kourend_kebos: "Kourend and Kebos",
  lumbridge_draynor: "Lumbridge and Draynor",
  morytania: "Morytania",
  varrock: "Varrock",
  western_provinces: "Western Provinces",
  wilderness: "Wilderness",
};

const Hidable = styled.div`
  display: ${(props) => (props.show ? "block" : "none")};
`;

const Title = styled.h1`
  margin-bottom: 15px;
`;

const Subtitle = styled.h2`
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

const AreaSelect = styled(Link)`
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

const CompleteButton = styled.button`
  color: white;
  background: none;
  border: 1px solid white;
  border-radius: 8px;
  margin: 3px;
  font-size: 20px;

  :hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const skillReqMet = (skill, req, statsData, getLevel) => {
  if (skill !== "combat") {
    return getLevel(statsData[skill]) >= req;
  }
  const combatLevel = _.floor(
    0.325 * getLevel(statsData["attack"]) +
      0.325 * getLevel(statsData["strength"]) +
      0.25 * getLevel(statsData["defence"]) +
      0.25 * getLevel(statsData["hitpoints"]) +
      0.25 * Math.floor(getLevel(statsData["prayer"]) * 0.5)
  );
  return combatLevel >= req;
};

const achievementAvailable = (
  achievement,
  statsData,
  completedQuests,
  getLevel
) => {
  const skillsComplete = _.every(achievement.skillReqs, (lvl, skill) => {
    return skillReqMet(skill, lvl, statsData, getLevel);
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
        if (!statsData[k] && k !== "combat") {
          console.log(" ", k !== "combat");
          console.log("Unexpected achievement skill:", k);
        }
        const complete = skillReqMet(k, v, statsData, getLevel);
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

  const headers = ["", "Difficulty", "Task", "Skills", "Quests"];
  const data = sortedAchievements.map((achievement) => {
    return [
      <CompleteButton
        onClick={() =>
          serverPost("/complete_achievement", { name: achievement.name, area })
        }
      >
        ✓
      </CompleteButton>,
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

  const totalCount = achievements.data.length;
  const completedCount = totalCount - filteredAchievements.length;

  return (
    <>
      <p>
        {completedCount} / {totalCount}
      </p>
      <Table
        header={headers}
        data={data}
        rowStyles={(_row, i) => ({
          background: sortedAchievements[i].available
            ? "rgba(0, 255, 0, 0.05)"
            : "rgba(255, 0, 0, 0.05)",
        })}
      />
    </>
  );
};

const Achievements = ({ statsData, getLevel, selectedArea }) => {
  const completedQuests = useServer("/completed");

  if (completedQuests.loading) {
    return null;
  }

  return (
    <>
      <Title>Achievements</Title>
      <AreaBar>
        <AreaSelect key="all" to={`/achievements`}>
          All
        </AreaSelect>
        {_.map(_.sortBy(_.entries(areas)), ([id, name]) => (
          <AreaSelect key={id} to={`/achievements/${id}`}>
            {name}
          </AreaSelect>
        ))}
      </AreaBar>
      <TableContainer>
        {_.map(areas, (_name, id) => {
          return (
            <Hidable key={id} show={id === selectedArea}>
              <Subtitle>{areas[id]}</Subtitle>
              <AchivementsTable
                statsData={statsData}
                getLevel={getLevel}
                area={id}
                completedQuests={completedQuests.data}
              />
            </Hidable>
          );
        })}
        <Hidable show={!selectedArea}>
          {_.map(areas, (_name, id) => {
            return (
              <div key={id}>
                <Subtitle>{areas[id]}</Subtitle>
                <AchivementsTable
                  statsData={statsData}
                  getLevel={getLevel}
                  area={id}
                  completedQuests={completedQuests.data}
                />
              </div>
            );
          })}
        </Hidable>
      </TableContainer>
    </>
  );
};

export default Achievements;

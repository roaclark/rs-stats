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

const CompletedCount = styled.span`
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

const AchievementsTable = ({
  statsData,
  getLevel,
  achievements,
  completedQuests,
  showArea = false,
}) => {
  const filteredAchievements = _.map(
    achievements.filter((a) => !a.complete),
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
    achievement.areaName,
    achievement.name,
  ]);

  const headers = [
    "",
    "",
    "Difficulty",
    ...(showArea ? ["Area"] : []),
    "Task",
    "Skills",
    "Quests",
  ];
  const data = sortedAchievements.map(
    ({ area, areaName, difficulty, name, skillReqs, questReqs }, i) => {
      return [
        i + 1,
        <CompleteButton
          onClick={() =>
            serverPost("/complete_achievement", {
              name,
              area,
            })
          }
        >
          ✓
        </CompleteButton>,
        difficulty,
        ...(showArea ? [areaName] : []),
        name,
        <SkillReqs
          reqs={skillReqs}
          statsData={statsData}
          getLevel={getLevel}
        />,
        <QuestReqs reqs={questReqs} completedQuests={completedQuests} />,
      ];
    }
  );

  const totalCount = achievements.length;
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

const AreaAchievementsTable = ({
  statsData,
  getLevel,
  areaData,
  completedQuests,
}) => {
  const { achievements, id: area, name: areaName } = areaData;

  if (achievements.loading) {
    return null;
  }

  const achievementList = achievements.data.map((achievement) => ({
    ...achievement,
    area,
    areaName,
  }));

  return (
    <AchievementsTable
      statsData={statsData}
      getLevel={getLevel}
      achievements={achievementList}
      completedQuests={completedQuests}
    />
  );
};

const AllAchievementsTable = ({
  statsData,
  getLevel,
  achievementsData,
  completedQuests,
}) => {
  if (_.some(achievementsData, (area) => area.achievements.loading)) {
    return null;
  }

  const completedCounts = _.map(
    achievementsData,
    ({ achievements }) => achievements.data.filter((a) => a.complete).length
  );

  const achievementList = _.flatMap(
    achievementsData,
    ({ id: area, name: areaName, achievements }) => {
      return achievements.data.map((achievement) => ({
        ...achievement,
        area,
        areaName,
      }));
    }
  );

  return (
    <>
      <AchievementsTable
        statsData={statsData}
        getLevel={getLevel}
        achievements={achievementList}
        completedQuests={completedQuests}
        showArea
      />
      <div>
        {completedCounts.map((count) => (
          <CompletedCount>{count}</CompletedCount>
        ))}
      </div>
    </>
  );
};

const useAchievements = (area, name) => {
  return {
    id: area,
    name,
    achievements: useServer("/achievements/" + area),
  };
};

const useAchievementData = () => {
  const data = [
    useAchievements("ardougne", "Ardougne"),
    useAchievements("desert", "Desert"),
    useAchievements("falador", "Falador"),
    useAchievements("fremennik", "Fremennik"),
    useAchievements("kandarin", "Kandarin"),
    useAchievements("karamja", "Karamja"),
    useAchievements("kourend_kebos", "Kourend and Kebos"),
    useAchievements("lumbridge_draynor", "Lumbridge and Draynor"),
    useAchievements("morytania", "Morytania"),
    useAchievements("varrock", "Varrock"),
    useAchievements("western_provinces", "Western Provinces"),
    useAchievements("wilderness", "Wilderness"),
  ];

  return _.keyBy(data, "id");
};

const Achievements = ({ statsData, getLevel, selectedArea }) => {
  const completedQuests = useServer("/completed");
  const achievementsData = useAchievementData();

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
        {_.sortBy(_.values(achievementsData), "id").map(({ id, name }) => (
          <AreaSelect key={id} to={`/achievements/${id}`}>
            {name}
          </AreaSelect>
        ))}
      </AreaBar>
      <TableContainer>
        {_.map(achievementsData, ({ id, name }) => {
          return (
            <Hidable key={id} show={id === selectedArea}>
              <Subtitle>{name}</Subtitle>
              <AreaAchievementsTable
                statsData={statsData}
                getLevel={getLevel}
                areaData={achievementsData[id]}
                completedQuests={completedQuests.data}
              />
            </Hidable>
          );
        })}
        <Hidable show={!selectedArea}>
          <Subtitle>All</Subtitle>
          <AllAchievementsTable
            statsData={statsData}
            getLevel={getLevel}
            achievementsData={achievementsData}
            completedQuests={completedQuests.data}
          />
        </Hidable>
      </TableContainer>
    </>
  );
};

export default Achievements;

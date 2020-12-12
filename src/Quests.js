import _ from "lodash";
import styled from "styled-components";
import Table from "./Table.js";
import { useServer } from "./hooks.js";

const difficultyOrder = {
  Novice: 0,
  Intermediate: 1,
  Experienced: 2,
  Master: 3,
  Grandmaster: 4,
};

const Title = styled.h1`
  margin-bottom: 30px;
`;

const TableContainer = styled.div`
  margin-bottom: 50px;
`;

const ReqList = styled.ul`
  list-style-type: none;
  margin: 0;
`;

const ReqItem = styled.ul`
  text-decoration: ${(props) => (props.complete ? "line-through" : "inherit")};
  color: ${(props) => (props.complete ? "#555" : "white")};
`;

const SkillName = styled.span`
  text-transform: capitalize;
`;

const questAvailable = (quest, statsData, completedQuests, getLevel) => {
  const skillsComplete = _.every(quest.skillReqs, (lvl, skill) => {
    return getLevel(statsData[skill]) >= lvl;
  });
  const questsComplete = _.every(quest.questReqs, (req) =>
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

const Quests = ({ statsData, members, getLevel }) => {
  const quests = useServer("/quests");
  const completed = useServer("/completed");

  if (quests.loading || completed.loading) {
    return null;
  }

  const completedQuests = completed.data;
  const filteredQuests = _.map(
    quests.data.filter((quest) => !completedQuests.includes(quest.name)),
    (quest) => ({
      ...quest,
      available: questAvailable(quest, statsData, completedQuests, getLevel),
    })
  ); // TODO members filter
  const sortedQuests = _.sortBy(filteredQuests, (quest) => [
    quest.available ? 0 : 1,
    difficultyOrder[quest.difficulty],
  ]);

  const headers = ["Name", "Difficulty", "Skills", "Prerequisites"];
  const data = sortedQuests.map((quest) => {
    return [
      quest.name,
      quest.difficulty,
      <SkillReqs
        reqs={quest.skillReqs}
        statsData={statsData}
        getLevel={getLevel}
      />,
      <QuestReqs reqs={quest.questReqs} completedQuests={completedQuests} />,
    ];
  });

  return (
    <>
      <Title>Quests</Title>
      <TableContainer>
        <Table
          header={headers}
          data={data}
          rowStyles={(_row, i) => ({
            background: sortedQuests[i].available
              ? "rgba(0, 255, 0, 0.05)"
              : "rgba(255, 0, 0, 0.05)",
          })}
        />
      </TableContainer>
    </>
  );
};

export default Quests;

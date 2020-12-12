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

const questAvailable = (quest, statsData, getLevel) => {
  return _.every(quest.skillReqs, (lvl, skill) => {
    return getLevel(statsData[skill]) >= lvl;
  });
};

const QuestReqs = ({ reqs }) => {
  return (
    <ReqList>
      {reqs.map((req) => (
        <ReqItem>{req}</ReqItem>
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
          <ReqItem complete={complete}>
            <SkillName>{k}</SkillName> ({v})
          </ReqItem>
        );
      })}
    </ReqList>
  );
};

const Quests = ({ statsData, members, getLevel }) => {
  const quests = useServer("/quests");

  if (quests.loading) {
    return null;
  }

  const filteredQuests = _.map(quests.data, (quest) => ({
    ...quest,
    available: questAvailable(quest, statsData, getLevel),
  })); // TODO members filter
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
      <QuestReqs reqs={quest.questReqs} />,
    ];
  });

  return (
    <Table
      header={headers}
      data={data}
      rowStyles={(_row, i) => ({
        background: sortedQuests[i].available
          ? "rgba(0, 255, 0, 0.05)"
          : "rgba(255, 0, 0, 0.05)",
      })}
    />
  );
};

export default Quests;

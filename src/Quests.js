import _ from "lodash";
import styled from "styled-components";
import Table from "./Table.js";
import { useServer } from "./hooks.js";

const ReqList = styled.ul`
  list-style-type: none;
  margin: 0;
`;

const SkillName = styled.span`
  text-transform: capitalize;
`;

const questAvailable = (quest, statsData, getLevel) => {
  _.map(quest.skillReqs, (lvl, skill) => {
    return getLevel(statsData[skill]) >= lvl;
  });
};

const QuestReqs = ({ reqs }) => {
  return (
    <ReqList>
      {reqs.map((req) => (
        <li>{req}</li>
      ))}
    </ReqList>
  );
};

const SkillReqs = ({ reqs }) => {
  return (
    <ReqList>
      {_.map(reqs, (v, k) => (
        <li>
          <SkillName>{k}</SkillName> ({v})
        </li>
      ))}
    </ReqList>
  );
};

const Quests = ({ statsData, members, getLevel }) => {
  const quests = useServer("/quests");

  if (quests.loading) {
    return null;
  }

  const filteredQuests = quests.data; // TODO members filter

  const headers = ["Name", "Difficulty", "Skills", "Prerequisites"];
  const data = filteredQuests.map((quest) => {
    return [
      quest.name,
      quest.skill,
      <SkillReqs reqs={quest.skillReqs} />,
      <QuestReqs reqs={quest.questReqs} />,
    ];
  });

  return <Table header={headers} data={data} />;
};

export default Quests;

import styled from "styled-components";
import _ from "lodash";

const statsGrid = [
  ["attack", "hitpoints", "mining"],
  ["strength", "agility", "smithing"],
  ["defence", "herblore", "fishing"],
  ["ranged", "thieving", "cooking"],
  ["prayer", "crafting", "firemaking"],
  ["magic", "fletching", "woodcutting"],
  ["runecrafting", "slayer", "farming"],
  ["construction", "hunter"],
];

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 3em;
  grid-row-gap: 10px;
`;

const StyledStat = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${(props) => (props.filtered ? "#555" : "white")};
`;

const SkillName = styled.span`
  text-transform: capitalize;
  margin-right: 1em;
`;

const SkillLevel = styled.div``;

const Stat = ({ stat, experience, getLevel, filtered }) => {
  if (!experience) {
    return "Failure" + stat;
  }
  const statLevel = getLevel(experience);
  return (
    <StyledStat filtered={filtered}>
      <SkillName>{stat}</SkillName>
      <SkillLevel filtered={filtered}>{statLevel}</SkillLevel>
    </StyledStat>
  );
};

const Summary = ({ statsData, getLevel, skillsData, members }) => {
  const skills = _.fromPairs(
    skillsData.map(({ name, members }) => [name, members])
  );
  return (
    <>
      <h1>Overview</h1>
      <Container>
        {statsGrid.flatMap((statsList) =>
          statsList.map((stat) => (
            <Stat
              key={stat}
              stat={stat}
              experience={statsData[stat]}
              getLevel={getLevel}
              filtered={!members && skills[stat]}
            />
          ))
        )}
      </Container>
    </>
  );
};

export default Summary;

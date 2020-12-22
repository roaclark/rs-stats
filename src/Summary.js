import React from "react";
import styled from "styled-components";
import _ from "lodash";

const icons = {
  attack: "https://oldschool.runescape.wiki/images/f/fe/Attack_icon.png",
  hitpoints: "https://oldschool.runescape.wiki/images/9/96/Hitpoints_icon.png",
  mining: "https://oldschool.runescape.wiki/images/4/4a/Mining_icon.png",
  strength: "https://oldschool.runescape.wiki/images/1/1b/Strength_icon.png",
  agility: "https://oldschool.runescape.wiki/images/8/86/Agility_icon.png",
  smithing: "https://oldschool.runescape.wiki/images/d/dd/Smithing_icon.png",
  defence: "https://oldschool.runescape.wiki/images/b/b7/Defence_icon.png",
  herblore: "https://oldschool.runescape.wiki/images/0/03/Herblore_icon.png",
  fishing: "https://oldschool.runescape.wiki/images/3/3b/Fishing_icon.png",
  ranged: "https://oldschool.runescape.wiki/images/1/19/Ranged_icon.png",
  thieving: "https://oldschool.runescape.wiki/images/4/4a/Thieving_icon.png",
  cooking: "https://oldschool.runescape.wiki/images/d/dc/Cooking_icon.png",
  prayer: "https://oldschool.runescape.wiki/images/f/f2/Prayer_icon.png",
  crafting: "https://oldschool.runescape.wiki/images/c/cf/Crafting_icon.png",
  firemaking:
    "https://oldschool.runescape.wiki/images/9/9b/Firemaking_icon.png",
  magic: "https://oldschool.runescape.wiki/images/5/5c/Magic_icon.png",
  fletching: "https://oldschool.runescape.wiki/images/9/93/Fletching_icon.png",
  woodcutting:
    "https://oldschool.runescape.wiki/images/f/f4/Woodcutting_icon.png",
  runecrafting:
    "https://oldschool.runescape.wiki/images/6/63/Runecraft_icon.png",
  slayer: "https://oldschool.runescape.wiki/images/2/28/Slayer_icon.png",
  farming: "https://oldschool.runescape.wiki/images/f/fc/Farming_icon.png",
  construction:
    "https://oldschool.runescape.wiki/images/f/f6/Construction_icon.png",
  hunter: "https://oldschool.runescape.wiki/images/d/dd/Hunter_icon.png",
};

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
  grid-column-gap: 2em;
  grid-row-gap: 10px;
`;

const StyledStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${(props) => (props.filtered ? "#555" : "white")};
`;

const SkillName = styled.span`
  text-transform: capitalize;
  margin-right: 1em;
`;

const SkillImage = styled.img`
  margin-right: 0.75em;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid white;
  border-radius: 17px;
  padding: 3px;
`;

const SkillLevel = styled.div``;

const LevelInput = styled.input`
  width: 25px;
  text-align: center;
  font-size: calc(6px + 2vmin);
  padding: 5px;
  border-radius: 5px;
`;

const LevelForm = ({ oldLevel, updateLevel }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const newLevel = e.target.name.value;
    updateLevel(newLevel);
  };

  return (
    <form onSubmit={handleSubmit}>
      <LevelInput type="text" name="name" defaultValue={oldLevel} />
    </form>
  );
};

const Stat = ({ stat, experience, getLevel, filtered }) => {
  const [editting, setEditting] = React.useState(false);
  if (!experience) {
    return "Failure" + stat;
  }
  const icon = icons[stat];
  const statLevel = getLevel(experience);
  return (
    <StyledStat filtered={filtered}>
      {icon ? <SkillImage src={icon} /> : <SkillName>{stat}</SkillName>}
      {editting ? (
        <LevelForm
          oldLevel={statLevel}
          updateLevel={(level) => {
            setEditting(false);
            console.log(level);
          }}
        />
      ) : (
        <SkillLevel filtered={filtered} onClick={() => setEditting(true)}>
          {statLevel}
        </SkillLevel>
      )}
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

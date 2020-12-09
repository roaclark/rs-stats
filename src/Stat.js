import React from "react";
import styled from "styled-components";
import { useServer } from "./hooks.js";

const SkillName = styled.h1`
  text-transform: capitalize;
`;

const Table = ({ data, header }) => {
  return (
    <table>
      {header && (
        <tr>
          {header.map((d, i) => (
            <th key={i}>{d}</th>
          ))}
        </tr>
      )}
      {data.map((row, i) => (
        <tr>
          {row.map((val, i) => (
            <td key={i}>{val}</td>
          ))}
        </tr>
      ))}
    </table>
  );
};

const rewardRow = ({
  reward,
  currentExperience,
  label,
  action,
  experienceData,
}) => {
  if (!reward) {
    return [label(), "--", "--", "--"];
  }
  const expNeeded = experienceData[reward.level] - currentExperience;
  if (expNeeded <= 0) {
    return [label(), "--", "--", "--"];
  }
  const actionsNeeded = Math.ceil(expNeeded / action.exp);

  return [
    label(reward.name),
    reward.level,
    expNeeded.toLocaleString(),
    actionsNeeded.toLocaleString(),
  ];
};

const Stat = ({ name, experienceData }) => {
  const actions = useServer(`/actions/${name}`, [name]);
  const rewards = useServer(`/rewards/${name}`, [name]);

  if (actions.loading || rewards.loading) {
    return null;
  }

  const currentLevel = 12; // TODO
  const currentExperience = experienceData[currentLevel]; // TODO
  const action = actions.data[0]; // TODO

  const nextReward = rewards.data.find((re) => re.level > currentLevel);
  const maxReward = rewards.data[rewards.data.length - 1];

  const row = ({ reward, label }) =>
    rewardRow({
      currentExperience,
      action,
      experienceData,
      reward,
      label,
    });

  // Rewards (lvl, status)
  // Current stats (lvl, exp)
  // Action + action exp
  const header = ["", "Level", "Exp needed", "Actions"];
  const data = [
    row({
      reward: nextReward,
      label: (name) => `Next reward (${name || ""})`,
    }),
    row({
      reward: maxReward,
      label: (name) => `Max reward (${name || ""})`,
    }),
    row({
      reward: { level: 99 },
      label: () => "Max level",
    }),
  ];

  return (
    <>
      <SkillName>{name}</SkillName>
      <Table header={header} data={data} />
    </>
  );
};

export default Stat;

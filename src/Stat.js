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
        <thead>
          <tr>
            {header.map((d, i) => (
              <th key={i}>{d}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((val, i) => (
              <td key={i}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
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
  const actionsNeeded = action
    ? Math.ceil(expNeeded / action.exp).toLocaleString()
    : "--";

  return [
    label(reward.name),
    reward.level,
    expNeeded.toLocaleString(),
    actionsNeeded,
  ];
};

const TargetTable = ({
  name,
  experienceData,
  actionData,
  rewardData,
  action,
  currentExperience,
  currentLevel,
}) => {
  const nextReward = rewardData.find((re) => re.level > currentLevel);
  const maxReward = rewardData[rewardData.length - 1];

  const row = ({ reward, label }) =>
    rewardRow({
      currentExperience,
      action,
      experienceData,
      reward,
      label,
    });

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
  return <Table header={header} data={data} />;
};

const RewardTable = ({ rewardData, currentLevel }) => {
  const header = ["Reward", "Level"];
  const data = rewardData
    .filter((r) => r.level > currentLevel)
    .map((r) => [r.name, r.level]);
  return <Table header={header} data={data} />;
};

const StatInner = (props) => {
  const { name, experienceData, actionData, rewardData } = props;
  const [actionIndex, setActionIndex] = React.useState(0);

  const action = actionData[actionIndex];
  const currentLevel = 12; // TODO
  const currentExperience = experienceData[currentLevel]; // TODO

  return (
    <>
      <SkillName>{name}</SkillName>
      <div>
        <p>Current level: {currentLevel}</p>
        <p>Current exp: {currentExperience}</p>
      </div>
      <div>
        <select
          value={actionIndex}
          onChange={(e) => {
            setActionIndex(e.target.value);
          }}
        >
          {actionData.map((act, i) => (
            <option id={i} key={i} value={i}>
              {act.name}
            </option>
          ))}
        </select>
        <p>Exp: {action.exp}</p>
      </div>
      <TargetTable
        {...props}
        action={action}
        currentLevel={currentLevel}
        currentExperience={currentExperience}
      />
      <RewardTable rewardData={rewardData} currentLevel={currentLevel} />
    </>
  );
};

const Stat = ({ name, experienceData }) => {
  const actions = useServer(`/actions/${name}`, [name]);
  const rewards = useServer(`/rewards/${name}`, [name]);

  if (actions.loading || rewards.loading) {
    return null;
  }

  return (
    <StatInner
      actionData={actions.data}
      rewardData={rewards.data}
      name={name}
      experienceData={experienceData}
    />
  );
};

export default Stat;

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

const rewardRow = ({ reward, currentExperience, action, experienceData }) => {
  if (!reward) {
    return ["--", "--", "--", "--"];
  }
  const expNeeded = experienceData[reward.level] - currentExperience;
  if (expNeeded <= 0) {
    return ["--", "--", "--", "--"];
  }
  const actionsNeeded = action
    ? Math.ceil(expNeeded / action.exp).toLocaleString()
    : "--";

  return [reward.name, reward.level, expNeeded.toLocaleString(), actionsNeeded];
};

const RewardTable = ({
  rewardData,
  currentLevel,
  currentExperience,
  action,
  experienceData,
}) => {
  const header = ["Reward", "Level", "Exp needed", "Actions"];

  const row = ({ reward }) =>
    rewardRow({
      currentExperience,
      action,
      experienceData,
      reward,
    });
  const data = rewardData
    .filter((r) => r.level > currentLevel)
    .map((reward) => row({ reward }));
  return <Table header={header} data={data} />;
};

const StatInner = (props) => {
  const { name, actionData, statsData, getLevel } = props;
  const [action, setAction] = React.useState(actionData[0]);

  React.useEffect(() => {
    setAction(
      (action) =>
        actionData.find((act) => act.name === action.name) || actionData[0]
    );
  }, [actionData]);

  const currentExperience = statsData[name];
  const currentLevel = getLevel(currentExperience);

  return (
    <>
      <SkillName>{name}</SkillName>
      <div>
        <p>Current level: {currentLevel}</p>
        <p>Current exp: {currentExperience}</p>
      </div>
      {actionData.length > 0 && (
        <div>
          <select
            value={action.name}
            onChange={(e) => {
              setAction(actionData.find((act) => act.name === e.target.value));
            }}
          >
            {actionData.map((act, i) => (
              <option id={i} key={i} value={act.name}>
                {act.name}
              </option>
            ))}
          </select>
          {action && <p>Exp: {action.exp}</p>}
        </div>
      )}
      <RewardTable
        {...props}
        action={action}
        currentLevel={currentLevel}
        currentExperience={currentExperience}
      />
    </>
  );
};

const Stat = (props) => {
  const { name, members } = props;
  const actions = useServer(`/actions/${name}`, [name]);
  const rewards = useServer(`/rewards/${name}`, [name]);

  if (actions.loading || rewards.loading) {
    return null;
  }

  const actionData = members
    ? actions.data
    : actions.data.filter((a) => !a.members);
  const rewardData = members
    ? rewards.data
    : rewards.data.filter((r) => !r.members);

  return (
    <StatInner {...props} actionData={actionData} rewardData={rewardData} />
  );
};

export default Stat;

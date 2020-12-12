import React from "react";
import _ from "lodash";
import styled from "styled-components";
import Table from "./Table.js";
import { useServer } from "./hooks.js";

const SkillName = styled.h1`
  text-transform: capitalize;
  margin-bottom: 15px;
`;

const CurrentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px;

  & > p {
    margin: 0 10px;
  }
`;

const ActionContainer = styled.div`
  margin: 20px;

  & > p {
    margin: 5px;
  }
`;

const StyledSelect = styled.select`
  background: transparent;
  font-size: 20px;
  border-radius: 3px;
  padding: 3px;
  color: white;
`;

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
      <CurrentContainer>
        <p>Level: {currentLevel}</p>
        <p>Exp: {currentExperience.toLocaleString()}</p>
      </CurrentContainer>
      {actionData.length > 0 && (
        <ActionContainer>
          <label>
            Action:{" "}
            <StyledSelect
              value={action.name}
              onChange={(e) => {
                setAction(
                  actionData.find((act) => act.name === e.target.value)
                );
              }}
            >
              {actionData.map((act, i) => (
                <option id={i} key={i} value={act.name}>
                  {act.name}
                </option>
              ))}
            </StyledSelect>
          </label>
          {action && <p>Exp: {action.exp}</p>}
        </ActionContainer>
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

  const actionData = _.sortBy(
    members ? actions.data : actions.data.filter((a) => !a.members).sort,
    (a) => a.exp
  );
  const rewardData = _.sortBy(
    members ? rewards.data : rewards.data.filter((r) => !r.members),
    (r) => r.level
  );

  return (
    <StatInner {...props} actionData={actionData} rewardData={rewardData} />
  );
};

export default Stat;

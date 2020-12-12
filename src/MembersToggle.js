import React from "react";
import styled from "styled-components";

const HiddenCheckbox = styled.input`
  display: none;
`;

const ToggleBackground = styled.div`
  display: inline-block;
  border-radius: 13px;
  border: 3px solid #ccc;
  height: 20px;
  width: 32px;
  margin-right: 10px;
  transition: background 0.3s;
  background: ${(props) => (props.checked ? "#f80" : "#999")};

  ::after {
    content: "";
    position: absolute;
    height: 18px;
    width: 18px;
    border-radius: 9px;
    background: white;
    top: 20px;
    transition: left 0.2s;
    left: ${(props) => (props.checked ? "31" : "19")}px;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const MembersToggle = ({ members, setMembers }) => {
  return (
    <label>
      <ToggleContainer>
        <HiddenCheckbox
          type="checkbox"
          checked={members}
          onChange={(e) => setMembers(e.target.checked)}
        />
        <ToggleBackground checked={members} />
        <span>Members</span>
      </ToggleContainer>
    </label>
  );
};

export default MembersToggle;

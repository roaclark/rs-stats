import React from "react";
import styled from "styled-components";

const HiddenCheckbox = styled.input`
  display: none;
`;

const ToggleBackground = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 13px;
  border: 3px solid #ccc;
  height: 20px;
  width: 32px;
  margin-left: 10px;
  transition: background 0.3s;
  background: ${(props) => (props.checked ? "#f80" : "#999")};

  ::after {
    content: "";
    position: absolute;
    height: 18px;
    width: 18px;
    border-radius: 9px;
    background: white;
    top: 1px;
    transition: left 0.2s;
    left: ${(props) => (props.checked ? "13" : "1")}px;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SummaryToggle = ({ showDifference, setShowDifference }) => {
  return (
    <label>
      <ToggleContainer>
        <span>Show difference</span>
        <HiddenCheckbox
          type="checkbox"
          checked={showDifference}
          onChange={(e) => setShowDifference(e.target.checked)}
        />
        <ToggleBackground checked={showDifference} />
      </ToggleContainer>
    </label>
  );
};

export default SummaryToggle;

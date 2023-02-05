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
  margin-left: ${(props) => (props.labelSide === "left" ? "10px" : "0px")};
  margin-right: ${(props) => (props.labelSide === "right" ? "10px" : "0px")};
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

const Toggle = ({ checked, setChecked, labelSide = "left", label }) => {
  return (
    <label>
      <ToggleContainer>
        {labelSide === "left" && <span>{label}</span>}
        <HiddenCheckbox
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <ToggleBackground checked={checked} labelSide={labelSide} />
        {labelSide === "right" && <span>{label}</span>}
      </ToggleContainer>
    </label>
  );
};

export default Toggle;

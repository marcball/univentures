import React from "react";
import "./StaticPlusButton.css"; // from .css file

const StaticPlusButton = ({ onClick }) => (
  <button className="static-plus-button" onClick={onClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="icon-plus"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  </button>
);

export default StaticPlusButton;
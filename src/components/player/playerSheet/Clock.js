import React, { useState } from "react";
import { useTheme } from "@mui/material";

function calculateCoordinates(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

const Clock = ({ numSections, size, state, setState }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleClick = (index) => {
    const updatedSections = [...state];
    updatedSections[index] = !updatedSections[index];
    setState(updatedSections);
  };

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const sections = [];
  for (let i = 0; i < numSections; i++) {
    const startAngle = (360 / numSections) * i;
    const endAngle = (360 / numSections) * (i + 1);

    const startPoint = calculateCoordinates(size / 2, size / 2, size / 2, startAngle);
    const endPoint = calculateCoordinates(size / 2, size / 2, size / 2, endAngle);

    const pathData = `
      M ${size / 2},${size / 2}
      L ${startPoint.x},${startPoint.y}
      A ${size / 2},${size / 2} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${endPoint.x},${endPoint.y}
      Z
    `;

    const isHovered = hoveredIndex === i;
    const sectionColor = state[i] ? primary : "transparent";
    const fill = isHovered ? secondary : sectionColor;

    sections.push(
      <path
        key={i}
        d={pathData}
        fill={fill}
        stroke="black"
        strokeWidth="1"
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "pointer" }}
      />
    );
  }

  return (
    <svg width={size} height={size}>
      {sections}
    </svg>
  );
};

export default Clock;

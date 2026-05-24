import React, { useState } from "react";
import { useTheme } from "@mui/material";

function calculateCoordinates(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

const Clock = ({
  numSections,
  size,
  state = [],
  setState,
  isCharacterSheet,
  onReset = () => {},
}) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const hoveredActiveColor = theme.palette.info.main;

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleClick = (index) => {
    const updatedSections = new Array(numSections).fill(false);
    for (let i = 0; i <= index; i++) {
      updatedSections[i] = true;
    }
    setState(updatedSections);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (!isCharacterSheet) {
      onReset();
    }
  };

  const handleMouseEnter = (index) => setHoveredIndex(index);
  const handleMouseLeave = () => setHoveredIndex(null);

  const sections = [];
  for (let i = 0; i < numSections; i++) {
    const startAngle = (360 / numSections) * i;
    const endAngle = (360 / numSections) * (i + 1);

    const startPoint = calculateCoordinates(
      size / 2,
      size / 2,
      size / 2,
      startAngle,
    );
    const endPoint = calculateCoordinates(
      size / 2,
      size / 2,
      size / 2,
      endAngle,
    );

    const pathData = `
      M ${size / 2},${size / 2}
      L ${startPoint.x},${startPoint.y}
      A ${size / 2},${size / 2} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${endPoint.x},${endPoint.y}
      Z
    `;

    const isHovered = hoveredIndex !== null && i <= hoveredIndex;
    const isActive = state[i];

    let fill = "transparent";
    if (isHovered && isActive) {
      fill = hoveredActiveColor;
    } else if (isHovered) {
      fill = secondary;
    } else if (isActive) {
      fill = primary;
    }

    sections.push(
      <path
        key={i}
        d={pathData}
        fill={fill}
        stroke={
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.4)"
            : "rgba(0, 0, 0, 0.4)"
        }
        strokeWidth="1"
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "pointer" }}
      />,
    );
  }

  return (
    <svg
      width={size}
      height={size}
      onContextMenu={handleRightClick}
      style={{ cursor: isCharacterSheet ? "default" : "pointer" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2}
        fill={
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.03)"
        }
      />
      {sections}
    </svg>
  );
};

export default Clock;

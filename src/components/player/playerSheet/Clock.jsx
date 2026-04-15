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
  onReset,
}) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const hoveredActiveColor = theme.palette.info.main; // Define a new color in the theme

  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // const [_isMouseDown, setIsMouseDown] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleClick = (index) => {
    const updatedSections = new Array(numSections).fill(false);
    // Fill from 0 to index (inclusive)
    for (let i = 0; i <= index; i++) {
      updatedSections[i] = true;
    }
    setState(updatedSections);
  };

  // const handleIncrement = () => {
  //   const currentFilled = state.filter(Boolean).length;
  //   if (currentFilled < numSections) {
  //     handleClick(currentFilled);
  //   }
  // };

  // const handleDecrement = () => {
  //   const currentFilled = state.filter(Boolean).length;
  //   if (currentFilled > 0) {
  //     const updatedSections = [...state];
  //     updatedSections[currentFilled - 1] = false;
  //     setState(updatedSections);
  //   }
  // };

  const handleRightClick = (e) => {
    e.preventDefault(); // Prevent context menu
    if (onReset && !isCharacterSheet) {
      onReset();
    }
  };

  // const handleMouseDown = (index) => {
  //   if (!isCharacterSheet && !isMobile) {
  //     setIsMouseDown(true);
  //     handleClick(index);
  //   }
  // };

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

    const isHovered = hoveredIndex === i;
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
        stroke="black"
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
      {sections}
    </svg>
  );
};

export default Clock;

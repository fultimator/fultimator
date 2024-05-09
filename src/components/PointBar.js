import React from "react";
import { LinearProgress, Box } from '@mui/material';

function PointBar({ pt, maxPt, color1, color2 }) {
    const normalise = value => {
        if (value > maxPt) {
            return 100;
        }
        return (value - 0) * 100 / (maxPt - 0);
    };

    const color1a = `linear-gradient(90deg, ${color1}, rgba(255, 255, 255, 0.5))`;
    const color2a = `linear-gradient(90deg, ${color2}, rgba(255, 255, 255, 0.5))`;

    const crisis = pt > (maxPt / 2);
    const barStyle = {
        height: '20px',
        borderRadius: '4px',
        backgroundColor: '#656565',
        boxShadow: '0.125em 0.125em 0em 0.0625em rgba(0, 0, 0, 0.5) inset',
        '& .MuiLinearProgress-bar': {
            backgroundImage: pt > maxPt / 2 ? color1a : color2a,
            borderRadius: '4px',
            backgroundColor: crisis ? color1 : color2
        },
    };
    const boxStyle = {
        border: '0.025em solid #c7c7c7',
        borderRadius: '4px',
    };

    return (
        <Box width="100%" sx={boxStyle}>
                <LinearProgress
                    variant="determinate"
                    value={normalise(pt)}
                    sx={barStyle}
                />
        </Box>
    );
}

export default PointBar;
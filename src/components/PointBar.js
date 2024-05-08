import React from "react";
import { LinearProgress, Box } from '@mui/material';

function PointBar({ pt, maxPt, color1, color2 }) {
    const normalise = value => {
        if (value > maxPt) {
            return 100;
        }
        return (value - 0) * 100 / (maxPt - 0);
    };
    
    const barStyle = {
        height: '20px',
        '& .MuiLinearProgress-bar': {
            backgroundColor: pt > maxPt / 2 ? color1 : color2,
        },
    };

    return (
        <Box width="100%">
            <LinearProgress 
                variant="determinate" 
                value={normalise(pt)} 
                sx={barStyle}
            />
        </Box>
    );
}

export default PointBar;
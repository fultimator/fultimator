import React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/system';
import { Grid } from "@mui/material";

interface CustomHeaderAltProps {
    headerText: string;
    icon: React.ReactElement;
}

const CustomHeaderAlt: React.FC<CustomHeaderAltProps> = ({ headerText, icon }) => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const white = theme.palette.white.main;

    return (
        <>
            <Grid item xs={12} sx={{width:'100%', margin:'15px'}}>
                <Typography
                    variant="h1"
                    component="legend"
                    sx={{
                        color: '#ffffff',
                        background: `linear-gradient(to right, ${primary}, ${primary}, ${secondary})`,
                        textTransform: 'uppercase',
                        padding: '2px',
                        borderRadius: '6px 6px 0 0',
                        margin: '-29px 0 0 -29px',
                        display: 'flex',
                        alignItems: 'center',
                        
                    }}
                >
                    <IconButton sx={{ px: 1, color: white }}>
                        {icon}
                    </IconButton>
                    {headerText}
                </Typography>
                <Divider
                    orientation="horizontal"
                    sx={{
                        color: secondary,
                        borderBottom: '2px solid',
                        borderColor: secondary,
                        margin: '0 0 0 -30px',
                    }}
                />
            </Grid>
        </>
    );
};

export default CustomHeaderAlt;

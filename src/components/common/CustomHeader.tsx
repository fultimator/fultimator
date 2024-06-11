import React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useTheme } from '@mui/system';
import { Grid, Tooltip } from "@mui/material";
import { SvgIconComponent } from '@mui/icons-material';

interface CustomHeaderProps {
    addItem: () => void;
    headerText: string;
    type: 'top' | 'middle';
    icon?: SvgIconComponent; // Optional icon prop
    showIconButton?: boolean; // Optional prop to control icon button visibility
    disableIconButton?: boolean; // Optional prop to control icon button clickability
    customTooltip?: string; // Optional prop to add custom tooltip
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    addItem,
    headerText,
    type,
    icon: Icon = HistoryEduIcon,
    showIconButton = true,
    disableIconButton = false,
    customTooltip = '',
}) => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    const ternary = theme.palette.ternary.main;

    const isTop = type === 'top';
    const isMiddle = type === 'middle';

    return (
        <>
            {isTop && (
                <Grid item xs={12} sx={{ width: '100%', margin: '15px' }}>
                    <Typography
                        variant="h2"
                        component="legend"
                        sx={{
                            color: primary,
                            background: `linear-gradient(to right, ${ternary}, transparent, ${ternary})`,
                            textTransform: 'uppercase',
                            padding: '0 5px',
                            borderRadius: '8px 8px 0 0',
                            margin: '-30px 0 0 -30px',
                            fontSize: '1.5em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: '56px'
                        }}
                    >
                        <div style={{ marginLeft: '15px' }}>{headerText}</div>
                        {showIconButton ? (
                            disableIconButton ? (
                                <Icon fontSize="large" sx={{ px: 1, fontSize: '2.45em' }} />
                            ) : (
                                <Tooltip title={customTooltip || ("Add " + headerText)}>
                                    <IconButton
                                        sx={{ px: 1, '&:hover': { color: primary } }}
                                        onClick={addItem}
                                    >
                                        <Icon fontSize="large" />
                                    </IconButton>
                                </Tooltip>
                            )
                        ) : (
                            <span style={{ minWidth: '15px', display: 'inline-block' }}></span>
                        )}
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
            )}

            {isMiddle && (
                <Grid item xs={12} sx={{ width: '100%', margin: '15px' }}>
                    <Divider
                        orientation="horizontal"
                        sx={{
                            color: secondary,
                            borderBottom: '2px solid',
                            borderColor: secondary,
                            margin: '0 0 0 -30px',
                        }}
                    />
                    <Typography
                        variant="h2"
                        component="legend"
                        sx={{
                            color: primary,
                            background: `linear-gradient(to right, ${ternary}, transparent, ${ternary})`,
                            textTransform: 'uppercase',
                            padding: '0 5px',
                            borderRadius: 0,
                            margin: '0 0 0 -30px',
                            fontSize: '1.5em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: '56px'
                        }}
                    >
                        <div style={{ marginLeft: '15px' }}>{headerText}</div>
                        {showIconButton ? (
                            disableIconButton ? (
                                <Icon fontSize="large" sx={{ px: 1, fontSize: '2.45em' }} />
                            ) : (
                                <Tooltip title={"Add " + headerText}>
                                    <IconButton
                                        sx={{ px: 1, '&:hover': { color: primary } }}
                                        onClick={addItem}
                                    >
                                        <Icon fontSize="large" />
                                    </IconButton>
                                </Tooltip>
                            )
                        ) : (
                            <span style={{ minWidth: '15px', display: 'inline-block' }}></span>
                        )}
                    </Typography>
                    <Divider
                        orientation="horizontal"
                        sx={{
                            color: secondary,
                            borderBottom: '2px solid',
                            borderColor: 'secondary',
                            margin: '0 0 0 -30px',
                        }}
                    />
                </Grid>
            )}
        </>
    );
};

export default CustomHeader;

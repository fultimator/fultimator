import React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useMediaQuery } from "@mui/material";
import { Grid, Tooltip, Box } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { useCustomTheme } from '../../hooks/useCustomTheme';

interface CustomHeaderProps {
    addItem: () => void;
    openCompendium: () => void;
    headerText: string;
    type: "top" | "middle";
    icon?: SvgIconComponent;
    showIconButton?: boolean;
    disableIconButton?: boolean;
    customTooltip?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    addItem,
    openCompendium,
    headerText,
    type,
    icon: Icon = HistoryEduIcon,
    showIconButton = true,
    disableIconButton = false,
    customTooltip = '',
}) => {
    const theme = useCustomTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTop = type === 'top';
    const isMiddle = type === 'middle';

    return (
        <Grid item xs={12} sx={{ width: '100%', margin: '15px' }}>
            {isTop && (
                <>
                    <Typography
                        variant="h2"
                        component="legend"
                        sx={{
                            color: theme.white,
                            background: theme.primary,
                            textTransform: 'uppercase',
                            padding: '0 5px',
                            borderRadius: type === "top" ? "6px 6px 0 0" : 0,
                            margin: type === "top" ? "-30px 0 0 -30px" : "0 0 0 -30px",
                            fontSize: isMobile ? "1em" : "1.5em",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: '56px'
                        }}
                    >
                        <div style={{ marginLeft: '15px' }}>{headerText}</div>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {openCompendium && (
                                <Tooltip title="Open Compendium">
                                    <IconButton
                                        sx={{
                                            px: 1,
                                            color: theme.white,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                transition: 'background-color 0.3s ease',
                                            },
                                        }}
                                        onClick={openCompendium}
                                        aria-label="Open Compendium"
                                    >
                                        <SearchIcon fontSize="large" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {showIconButton ? (
                                disableIconButton ? (
                                    <Icon fontSize="large" sx={{ px: 1, fontSize: '2.45em' }} />
                                ) : (
                                    <Tooltip title={customTooltip || `Add ${headerText}`}>
                                        <IconButton
                                            sx={{
                                                px: 1,
                                                color: theme.white,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                    transition: 'background-color 0.3s ease',
                                                },
                                            }}
                                            onClick={addItem}
                                            aria-label={`Add ${headerText}`}
                                        >
                                            <Icon fontSize="large" />
                                        </IconButton>
                                    </Tooltip>
                                )
                            ) : (
                                <span style={{ minWidth: '15px', display: 'inline-block' }}></span>
                            )}
                        </Box>
                    </Typography>
                    <Divider
                        orientation="horizontal"
                        sx={{
                            color: theme.secondary,
                            outlineBottom: '2px solid',
                            outlineColor: theme.secondary,
                            margin: '0 0 0 -30px',
                        }}
                    />
                </>
            )}

            {isMiddle && (
                <>
                    <Divider
                        orientation="horizontal"
                        sx={{
                            color: theme.secondary,
                            outlineBottom: '2px solid',
                            outlineColor: theme.secondary,
                            margin: '0 0 0 -30px',
                        }}
                    />
                    <Typography
                        variant="h2"
                        component="legend"
                        sx={{
                            color: theme.white,
                            background: theme.primary,
                            textTransform: 'uppercase',
                            padding: '0 5px',
                            borderRadius: 0,
                            margin: '0 0 0 -30px',
                            fontSize: isMobile ? "1em" : "1.5em",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: '56px'
                        }}
                    >
                        <div style={{ marginLeft: '15px' }}>{headerText}</div>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {openCompendium && (
                                <Tooltip title={customTooltip || 'Open Compendium'}>
                                    <IconButton
                                        sx={{
                                            px: 1,
                                            color: theme.white,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                transition: 'background-color 0.3s ease',
                                            },
                                        }}
                                        onClick={openCompendium}
                                        aria-label="Open Compendium"
                                    >
                                        <SearchIcon fontSize="large" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {showIconButton ? (
                                disableIconButton ? (
                                    <Icon fontSize="large" sx={{ px: 1, fontSize: '2.45em' }} />
                                ) : (
                                    <Tooltip title={customTooltip || `Add ${headerText}`}>
                                        <IconButton
                                            sx={{
                                                px: 1,
                                                color: theme.white,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                    transition: 'background-color 0.3s ease',
                                                },
                                            }}
                                            onClick={addItem}
                                            aria-label={`Add ${headerText}`}
                                        >
                                            <Icon fontSize="large" />
                                        </IconButton>
                                    </Tooltip>
                                )
                            ) : (
                                <span style={{ minWidth: '15px', display: 'inline-block' }}></span>
                            )}
                        </Box>
                    </Typography>
                    <Divider
                        orientation="horizontal"
                        sx={{
                            color: theme.secondary,
                            outlineBottom: '2px solid',
                            outlineColor: theme.secondary,
                            margin: '0 0 0 -30px',
                        }}
                    />
                </>
            )}
        </Grid>
    );
};

export default CustomHeader;

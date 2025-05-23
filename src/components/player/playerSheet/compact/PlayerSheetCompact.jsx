import React, { Fragment, useState } from "react";
import { Paper, Grid, Typography, Divider, Card, Box, Dialog, ButtonGroup, Button, Tabs, Tab, TextField, TableHead, TableRow, InputBase, IconButton, TableCell } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../../translation/translate";
import avatar_image from "../../../avatar.jpg";
import Diamond from "../../../Diamond";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { ArrowDropDown, Search, Clear } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { fontSize, styled, width } from "@mui/system";
import { TypeAffinity } from "../../../types";
import PlayerEquipment from "./PlayerEquipment";
import PlayerClasses from "./PlayerClasses";
import PlayerSpells from "./PlayerSpells";
import PlayerRituals from "./PlayerRituals";
import PlayerNotes from "./PlayerNotes";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

const AffinityGrid = styled(Grid)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderImage: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.background.paper}) 1`,
    marginLeft: theme.spacing(0.25),

}));

export default function PlayerCardSheet({
    player,
    isMainTab,
    isEditMode,
    isCharacterSheet,
    characterImage,
}) {
    const { t } = useTranslate();
    const theme = useCustomTheme();
    const [value, setValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

  // Handle tab change
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Reusable button/tab styling
    const tabStyle = {
        borderRadius: 0,
        flex: 1,
        padding: 0,
        mt: 0.5,
        minHeight: '24px',
        height: '24px',
        color: "#ffffff",
        bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
        border: `2px solid ${theme.mode === 'dark' ? theme.ternary : theme.primary}`,
        '&:hover': {
            bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
            color: theme.mode === 'dark' ? theme.white : theme.white,
        },
        '&.Mui-selected': {
            bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
            color: theme.mode === 'dark' ? theme.white : theme.white,
        },
    };

    const homeTabStyle = {
        ...tabStyle,
        flex: 0.5,
    };

    // Tab content panel
    const CustomTabPanel = ({ value, index, children }) => (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box sx={{ p: 0 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );

    // const buttonStyle = {
    //     borderRadius: 0,
    //     flex: 1,
    //     padding: 0,
    //     mt: 0.5,
    //     bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
    //     border: `2px solid ${theme.mode === 'dark' ? theme.ternary : theme.primary}`,
    //     '&:hover': {
    //         bgcolor: theme.mode === 'dark' ? theme.ternary : theme.primary,
    //     },
    // };

    // const homeButtonStyle = {
    //     ...buttonStyle,
    //     flex: 0.5,  // Smaller flex value to take less space
    // };

    const isMobile = window.innerWidth < 900;

    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    /* player.armor.isEquipped (should be only one) */
    const equippedArmor = player.armor?.find((armor) => armor.isEquipped) || null;

    /* player.shields.isEquipped (should be only one) */
    const equippedShield =
        player.shields?.find((shield) => shield.isEquipped) || null;

    /* player.weapons.isEquipped (can be more than one) */
    const equippedWeapons =
        player.weapons?.filter((weapon) => weapon.isEquipped) || [];

    /* player.accessories.isEquipped (should be only one) */
    const equippedAccessory =
        player.accessories?.find((accessory) => accessory.isEquipped) || null;

    // Function to format item names
    const formatItemName = (item) =>
        item.name !== item.base.name
            ? `${item.name} (${t(item.base.name)})`
            : t(item.name);

    // Gather all equipped items
    const equippedItems = [
        ...equippedWeapons.map(formatItemName),
        equippedArmor ? formatItemName(equippedArmor) : null,
        equippedShield ? formatItemName(equippedShield) : null,
        equippedAccessory ? equippedAccessory.name : null,
    ].filter((item) => item !== null); // Filter out null values

    // Join all equipped items into a single line
    const equipmentText = equippedItems.join(", ");

    const calculateAttribute = (
        base,
        decreaseStatuses,
        increaseStatuses,
        min,
        max
    ) => {
        let adjustedValue = base;

        decreaseStatuses.forEach((status) => {
            if (player.statuses[status]) adjustedValue -= 2;
        });

        increaseStatuses.forEach((status) => {
            if (player.statuses[status]) adjustedValue += 2;
        });

        return clamp(adjustedValue, min, max);
    };

    const currDex = calculateAttribute(
        player.attributes.dexterity,
        ["slow", "enraged"],
        ["dexUp"],
        6,
        12
    );
    const currInsight = calculateAttribute(
        player.attributes.insight,
        ["dazed", "enraged"],
        ["insUp"],
        6,
        12
    );
    const currMight = calculateAttribute(
        player.attributes.might,
        ["weak", "poisoned"],
        ["migUp"],
        6,
        12
    );
    const currWillpower = calculateAttribute(
        player.attributes.willpower,
        ["shaken", "poisoned"],
        ["wlpUp"],
        6,
        12
    );

    // Rogue - Dodge Skill Bonus
    const dodgeBonus =
        equippedShield === null &&
            (equippedArmor === null || equippedArmor.martial === false)
            ? player.classes
                .map((cls) => cls.skills)
                .flat()
                .filter((skill) => skill.specialSkill === "Dodge")
                .map((skill) => skill.currentLvl)
                .reduce((a, b) => a + b, 0)
            : 0;

    // Calculate DEF and MDEF
    const currDef =
        (equippedArmor !== null
            ? equippedArmor.martial
                ? equippedArmor.def
                : player.attributes.dexterity + equippedArmor.def
            : player.attributes.dexterity) +
        (equippedShield !== null ? equippedShield.def : 0) +
        (player.modifiers?.def || 0) +
        (equippedArmor !== null ? equippedArmor.defModifier || 0 : 0) +
        (equippedShield !== null ? equippedShield.defModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.defModifier || 0 : 0) +
        equippedWeapons.reduce(
            (total, weapon) => total + (weapon.defModifier || 0),
            0
        ) +
        dodgeBonus;

    const currMDef =
        (equippedArmor !== null
            ? player.attributes.insight + equippedArmor.mdef
            : player.attributes.insight) +
        (equippedShield !== null ? equippedShield.mdef : 0) +
        (player.modifiers?.mdef || 0) +
        (equippedArmor !== null ? equippedArmor.mDefModifier || 0 : 0) +
        (equippedShield !== null ? equippedShield.mDefModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.mDefModifier || 0 : 0) +
        equippedWeapons.reduce(
            (total, weapon) => total + (weapon.mDefModifier || 0),
            0
        );

    // Initialize INIT to 0
    const currInit =
        (equippedArmor !== null ? equippedArmor.init : 0) +
        (player.modifiers?.init || 0) +
        (equippedArmor !== null ? equippedArmor.initModifier || 0 : 0) +
        (equippedShield !== null ? equippedShield.initModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.initModifier || 0 : 0);

    let crisis =
        player.stats.hp.current <= player.stats.hp.max / 2 ? true : false;

    const collapse = true;
    return (
        <>
            <Card>
                <div style={{ cursor: "pointer", maxWidth: "566px" }}>
                    {(
                        <>
                            <div
                                style={{
                                    boxShadow: collapse ? "none" : "1px 1px 5px",
                                }}
                            >
                                <Header player={player} characterImage={characterImage} />
                            </div>
                            <Stats player={player} currDex={currDex} currInsight={currInsight} currMight={currMight} currWillpower={currWillpower} currDef={currDef} currMDef={currMDef} currInit={currInit} />

                            <Box sx={{ p: 0, borderBottom: 1, borderColor: 'divider' }}>
                                {/* Tabs */}
                                <Tabs
                                    value={value}
                                    onChange={handleChange}
                                    aria-label="category filter tab"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{
                                        minHeight: '30px',
                                        height: '30px',
                                        '& .MuiTabs-indicator': {
                                            bgcolor: theme.secondary,
                                            height: 3,
                                        },
                                        '@media (max-width:600px)': {
                                            minHeight: '30px',
                                            height: '30px',
                                        },
                                    }}
                                >
                                    <Tab icon={<HomeOutlinedIcon sx={{ fontSize: '1rem' }} />} sx={homeTabStyle} />
                                    <Tab label="Classes" sx={tabStyle} />
                                    <Tab label="Features" sx={tabStyle} />
                                    <Tab label="Backpack" sx={tabStyle} />
                                    <Tab label="Notes" sx={tabStyle} />
                                </Tabs>

                              <Box sx={{ px: 0.5, display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 0 }}>
                                <InputBase
                                  sx={{ ml: 1, flex: 1 }}
                                  placeholder="Search..."
                                  inputProps={{ 'aria-label': 'Search' }}
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <IconButton
                                  type="button"
                                  sx={{ p: '0' }}
                                  aria-label={searchQuery ? 'clear' : 'search'}
                                  onClick={() => {
                                    if (searchQuery) {
                                      setSearchQuery('');
                                    }
                                  }}
                                >
                                  {searchQuery ? (
                                    <Clear />
                                  ) : (
                                    <Search />
                                  )}
                                </IconButton>
                              </Box>

                              {/* Tab Panels */}
                                <CustomTabPanel value={value} index={0}>
                                    <PlayerEquipment player={player} isCharacterSheet={true} isMainTab={true} searchQuery={searchQuery}/>
                                    <PlayerClasses player={player} isCharacterSheet={true} isMainTab={true} searchQuery={searchQuery} />
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={1}>
                                    <PlayerClasses player={player} isCharacterSheet={true} isMainTab={false} searchQuery={searchQuery} />
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={2}>
                                    <PlayerRituals player={player} isCharacterSheet={true} />
                                    <PlayerSpells player={player} isCharacterSheet={true} searchQuery={searchQuery} />
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={3}>
                                    <PlayerEquipment player={player} isCharacterSheet={true} isMainTab={false} searchQuery={searchQuery} />
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={4}>
                                    <PlayerNotes player={player} isCharacterSheet={true} searchQuery={searchQuery} />
                                </CustomTabPanel>
                            </Box>
                        </>
                    )}
                </div>
            </Card>
        </>
    );
}

function Header({ player, characterImage }) {
    const { t } = useTranslate();
    const theme = useCustomTheme();

    const background = theme.mode === 'dark'
        ? `linear-gradient(90deg, ${theme.primary} 0%, ${theme.ternary} 100%);`
        : `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%);`;

    const borderImage = theme.mode === 'dark'
        ? `linear-gralinear-gradient(45deg, ${theme.primary}, ${theme.ternary}) 1`
        : `linear-gradient(45deg, ${theme.primary}, #ffffff) 1`;
    const borderImageBody = theme.mode === 'dark'
        ? `linear-gradient(45deg, ${theme.primary}, ${theme.ternary}) 1;`
        : `linear-gradient(45deg, ${theme.primary}, #ffffff) 1;`;
    const borderRight = theme.mode === 'dark'
        ? `4px solid #1f1f1f`
        : `4px solid white`;

    const borderLeft = theme.mode === 'dark'
        ? `2px solid ${theme.ternary}`
        : `2px solid ${theme.primary}`;

    const borderBottom = theme.mode === 'dark'
        ? `2px solid ${theme.ternary}`
        : `2px solid ${theme.primary}`;

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const StyledMarkdown = ({ children, ...props }) => {
        return (
            <div
                style={{
                    whiteSpace: "pre-line",
                    display: "inline",
                    margin: 0,
                    padding: 1,
                }}
            >
                <ReactMarkdown
                    {...props}
                    components={{
                        p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
                        ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
                        li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
                        strong: (props) => (
                            <strong style={{ fontWeight: "bold" }} {...props} />
                        ),
                        em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
                    }}
                >
                    {children}
                </ReactMarkdown>
            </div>
        );
    };
    return (
        <Grid container alignItems="stretch">
            <Grid container>
                <Grid
                    item
                    xs
                    sx={{
                        background,
                        borderRight,
                        px: 2,
                    }}
                >
                    <Typography
                        color="white.main"
                        fontFamily="Antonio"
                        fontSize="1.5rem"
                        fontWeight="medium"
                        sx={{ textTransform: "uppercase" }}
                    >
                        {player.name}
                    </Typography>
                </Grid>
                <Grid
                    item
                    sx={{
                        px: 1,
                        py: 0.5,
                        borderLeft: borderLeft,
                        borderBottom: borderBottom,
                        borderImage: borderImage,
                    }}
                >
                    <Typography
                        fontFamily="Antonio"
                        fontSize="1.25rem"
                        fontWeight="medium"
                        sx={{ textTransform: "uppercase" }}
                    >
                        {player.info.pronouns} <Diamond /> {t("Lvl")} {player.lvl}
                    </Typography>
                </Grid>
            </Grid>
            <Box sx={{ display: "flex", width: 1 }}>
                {/* EditableImage */}
                {characterImage ? (
                    <Box
                        sx={{
                            minWidth: "128px",
                            width: "128px",
                            height: "auto",
                            background: "white",
                            border: "1px solid #684268",
                            borderTop: "none",
                            overflow: "hidden",
                            cursor: "pointer"
                        }}
                        onClick={handleClickOpen}
                    >
                        <img
                            src={characterImage}
                            alt="Player Avatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                objectPosition: "center center",
                                display: "block",
                            }}
                        />
                    </Box>
                ) : null}
                {/* Dialog for expanded image */}
                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="md"
                    fullWidth
                >
                    <img
                        src={player.info.imgurl}
                        alt="Expanded Player Avatar"
                        style={{
                            width: "100%",
                            height: "auto",
                        }}
                        onClick={handleClose}
                    />
                </Dialog>

                {/* Rows */}
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    {/* Row 1 */}
                    <Box
                        sx={{
                            px: 2,
                            py: 0.5,
                            borderBottom: borderBottom,
                            borderImage: borderImageBody,
                            flex: 1,
                            display: "flex",
                            justifyContent: "left",
                            alignItems: "center",
                        }}
                    >


                        <StyledMarkdown
                            allowedElements={["strong"]}
                            unwrapDisallowed={true}
                        >
                            {player.info.description}
                        </StyledMarkdown>
                    </Box>
                    {/* Row 2 */}
                    {(player.info.identity || player.info.theme || player.info.origin) && (
                        <Box
                            sx={{
                                px: 2,
                                py: 0.5,
                                borderBottom: borderBottom,
                                borderImage: borderImageBody,
                                flex: 1,
                            }}
                        >
                            <Typography
                                fontFamily="body1"
                                fontSize="0.80rem"
                            >
                                <RenderTraits player={player} />
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Grid>
    );
}

function RenderTraits({ player }) {
    const { identity, theme, origin } = player.info;

    const traits = [
        { label: "Identity", value: identity },
        { label: "Theme", value: theme },
        { label: "Origin", value: origin }
    ];

    return (
        <Grid container>
            {/* Iterate over traits */}
            {traits.map(({ label, value }) => value && (
                <Grid item xs={12} key={label} sx={{ marginTop: 0.5 }}>
                    <Grid container alignItems="center" spacing={1}>
                        {/* Label */}
                        <Grid item xs={3}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {label}:
                            </Typography>
                        </Grid>
                        {/* Value */}
                        <Grid item xs={9}>
                            <Typography align="left">
                                {value}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
}

function Stats({ player, currDex, currInsight, currMight, currWillpower, currDef, currMDef, currInit }) {
    const { t } = useTranslate();
    const theme = useTheme();
    const custom = useCustomTheme();
    const isMobile = window.innerWidth < 900;
    const borderImage = `linear-gradient(45deg, #b9a9be, ${theme.transparent}) 1`;
    const getAttributeColor = (base, current) => {
        if (current < base) return theme.palette.error.main;
        if (current > base) return theme.palette.success.main;
        return theme.palette.text.primary;
    };

    return (
        <Typography
            component="div"
            fontFamily="Antonio"
            fontWeight="bold"
            textAlign="center"
            fontSize={isMobile ? "0.74rem" : "0.9rem"}
        >
            <Grid container>
                <Grid
                    item
                    sx={{
                        borderBottom: "1px solid #281127",
                        borderTop: "1px solid #281127",
                        borderRight: "1px solid #281127",
                        borderImage: "linear-gradient(90deg, #341b35, #6d5072) 1;",
                        mr: isMobile ? "1px" : "2px",
                        my: "2px",
                        flexBasis: "calc(50% - 2px)",
                    }}
                >
                    <Grid container alignItems="stretch" justifyContent="space-between">
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1E2122' : '#efecf5',
                                borderRight: custom.mode === 'dark' ? '1px solid #42484B' : '1px solid #ffffff',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.875rem",
                                    color: getAttributeColor(
                                        player.attributes.dexterity,
                                        currDex
                                    ),
                                }}
                            >
                                {t("DEX")}{" "}d{currDex}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1E2122' : '#f3f0f7',
                                borderRight: custom.mode === 'dark' ? '1px solid #42484B' : '1px solid #ffffff',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.875rem",
                                    color: getAttributeColor(
                                        player.attributes.insight,
                                        currInsight
                                    ),
                                }}
                            >
                                {t("INS")}{" "}d{currInsight}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1D1F20' : '#f6f4f9',
                                borderRight: custom.mode === 'dark' ? '1px solid #42484B' : '1px solid #ffffff',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.875rem",
                                    color: getAttributeColor(
                                        player.attributes.willpower,
                                        currWillpower
                                    ),
                                }}
                            >
                                {t("MIG")}{" "}d{currMight}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1B1D1E' : '#f9f8fb',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.9rem",
                                    color: getAttributeColor(
                                        player.attributes.willpower,
                                        currWillpower
                                    ),
                                }}
                            >
                                {t("WLP")}{" "}d{currWillpower}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    item
                    sx={{
                        borderBottom: "1px solid #281127",
                        borderTop: "1px solid #281127",
                        borderLeft: "1px solid #281127",
                        borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
                        ml: isMobile ? "1px" : "2px",
                        my: "2px",
                        flexBasis: "calc(50% - 2px)",
                    }}
                >
                    <Grid container alignItems="stretch" justifyContent="space-between">
                        <Grid item sx={{ px: isMobile ? 0.5 : 1, py: 0.4 }}>
                            {t("HP")}
                        </Grid>
                        <Grid
                            item
                            sx={{
                                py: 0.4,
                                px: isMobile ? 0.75 : 1.5,
                                color: "white.main",
                                bgcolor: "red.main",
                            }}
                        >
                            {player.stats?.hp.max} <Diamond color="white.main" />{" "}
                            {Math.floor(player.stats?.hp.max / 2)}
                        </Grid>
                        <Grid item sx={{ px: isMobile ? 0.5 : 1, py: 0.4 }}>
                            {t("MP")}
                        </Grid>
                        <Grid
                            item
                            sx={{
                                px: isMobile ? 0.75 : 1.5,
                                py: 0.4,
                                color: "white.main",
                                bgcolor: "cyan.main",
                            }}
                        >
                            {player.stats?.mp.max}
                        </Grid>
                        <Grid item xs sx={{ py: 0.4 }}>
                            {t("Init.")} {currInit}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    item
                    sx={{
                        borderBottom: "1px solid #281127",
                        borderTop: "1px solid #281127",
                        borderRight: "1px solid #281127",
                        borderImage,
                        mr: isMobile ? "1px" : "2px",
                        flexBasis: "calc(25% - 2px)",
                    }}
                >
                    <Grid container justifyItems="space-between">
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1B1D1E' : '#efecf5',
                                borderRight: custom.mode === 'dark' ? '1px solid #42484B' : '1px solid #ffffff',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {t("DEF")} +{currDef}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs
                            sx={{
                                bgcolor: custom.mode === 'dark' ? '#1B1D1E' : '#efecf5',
                                py: 0.4,
                            }}
                        >
                            <Typography
                                component="span"
                                variant="body2"
                                style={{
                                    fontFamily: "'Antonio', fantasy, sans-serif",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {t("M.DEF")} +{currMDef}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs>
                    <AffinityGrid container>
                        {[
                            "physical",
                            "wind",
                            "bolt",
                            "dark",
                            "earth",
                            "fire",
                            "ice",
                            "light",
                            "poison",
                        ].map((type) => (
                            <Grid
                                item
                                xs
                                key={type}
                                sx={{
                                    py: 0.4,
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <TypeAffinity
                                    type={type}
                                    affinity={player.affinities?.[type] || ""}
                                />
                            </Grid>
                        ))}
                    </AffinityGrid>
                </Grid>
            </Grid>
        </Typography>
    );
}
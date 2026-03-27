import React, { Fragment, useState } from "react";
import { Paper, Grid, Typography, Divider, Card, Box, Dialog, ButtonGroup, Button, Tabs, Tab, TextField, TableHead, TableRow, InputBase, IconButton, TableCell } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
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
import PlayerBonds from "../PlayerBonds";
import PlayerVehicle from "./PlayerVehicle";
import PlayerCompanion from "./PlayerCompanion";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { calculateAttribute } from "../../common/playerCalculations";

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
    setPlayer,
    isMainTab,
    isEditMode,
    isCharacterSheet,
    characterImage,
    id,
}) {
    const { t } = useTranslate();
    const theme = useCustomTheme();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
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
                    {children}
                </Box>
            )}
        </div>
    );

    /* player.armor.isEquipped (should be only one) */
    const equippedArmor = player.armor?.find((armor) => armor.isEquipped) || null;

    /* player.shields.isEquipped (should be only one) */
    const equippedShield =
        player.shields?.find((shield) => shield.isEquipped) || null;

    /* player.weapons.isEquipped (can be more than one) */
    const equippedWeapons =
        player.weapons?.filter((weapon) => weapon.isEquipped) || [];

    /* player.customWeapons.isEquipped (can be more than one) */
    const equippedCustomWeapons =
        player.customWeapons?.filter((weapon) => weapon.isEquipped) || [];

    /* player.accessories.isEquipped (should be only one) */
    const equippedAccessory =
        player.accessories?.find((accessory) => accessory.isEquipped) || null;

    const currDex = calculateAttribute(
        player,
        player.attributes.dexterity,
        ["slow", "enraged"],
        ["dexUp"],
        6,
        12
    );
    const currInsight = calculateAttribute(
        player,
        player.attributes.insight,
        ["dazed", "enraged"],
        ["insUp"],
        6,
        12
    );
    const currMight = calculateAttribute(
        player,
        player.attributes.might,
        ["weak", "poisoned"],
        ["migUp"],
        6,
        12
    );
    const currWillpower = calculateAttribute(
        player,
        player.attributes.willpower,
        ["shaken", "poisoned"],
        ["wlpUp"],
        6,
        12
    );

    // Find all pilot-vehicle spells
    const pilotSpells = (player.classes || [])
        .flatMap((c) => c.spells || [])
        .filter(
            (spell) =>
                spell &&
                spell.spellType === "pilot-vehicle" &&
                (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
        );

    // Find the enabled vehicle
    const activeVehicle = pilotSpells
        .flatMap((s) => s.vehicles || [])
        .find((v) => v.enabled);

    const equippedModules = activeVehicle?.modules
        ? activeVehicle.modules.filter((m) => m.equipped)
        : [];

    const armorModule = equippedModules.find(
        (m) => m.type === "pilot_module_armor"
    );

    const isMartialArmor = armorModule
        ? armorModule.martial
        : equippedArmor?.martial || false;

    // Rogue - Dodge Skill Bonus
    const dodgeBonus =
        equippedShield === null &&
            !isMartialArmor
            ? player.classes
                .map((cls) => cls.skills)
                .flat()
                .filter((skill) => skill.specialSkill === "Dodge")
                .map((skill) => skill.currentLvl)
                .reduce((a, b) => a + b, 0)
            : 0;

    // Calculate DEF and MDEF
    const baseDef = armorModule
        ? armorModule.martial
            ? armorModule.def || 0
            : currDex + (armorModule.def || 0)
        : equippedArmor !== null
            ? equippedArmor.martial
                ? equippedArmor.def
                : currDex + equippedArmor.def
            : currDex;

    const armorDefModifier = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.defModifier || 0
            : 0;

    const currDef =
        baseDef +
        (equippedShield !== null ? equippedShield.def : 0) +
        (player.modifiers?.def || 0) +
        armorDefModifier +
        (equippedShield !== null ? equippedShield.defModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.defModifier || 0 : 0) +
        equippedWeapons.reduce(
            (total, weapon) => total + (weapon.defModifier || 0),
            0
        ) +
        equippedCustomWeapons.reduce(
            (total, weapon) => total + (parseInt(weapon.defModifier || 0, 10) || 0),
            0
        ) +
        dodgeBonus;

    const baseMDef = armorModule
        ? armorModule.martial
            ? armorModule.mdef || 0
            : currInsight + (armorModule.mdef || 0)
        : equippedArmor !== null
            ? currInsight + equippedArmor.mdef
            : currInsight;

    const armorMDefModifier = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.mDefModifier || 0
            : 0;

    const currMDef =
        baseMDef +
        (equippedShield !== null ? equippedShield.mdef : 0) +
        (player.modifiers?.mdef || 0) +
        armorMDefModifier +
        (equippedShield !== null ? equippedShield.mDefModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.mDefModifier || 0 : 0) +
        equippedWeapons.reduce(
            (total, weapon) => total + (weapon.mDefModifier || 0),
            0
        ) +
        equippedCustomWeapons.reduce(
            (total, weapon) => total + (parseInt(weapon.mDefModifier || 0, 10) || 0),
            0
        );

    // Initialize INIT to 0
    const baseInit = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.init
            : 0;

    const armorInitModifier = armorModule
        ? 0
        : equippedArmor !== null
            ? equippedArmor.initModifier || 0
            : 0;

    const currInit =
        baseInit +
        (player.modifiers?.init || 0) +
        armorInitModifier +
        (equippedShield !== null ? equippedShield.initModifier || 0 : 0) +
        (equippedAccessory !== null ? equippedAccessory.initModifier || 0 : 0);

    const collapse = true;
    return (
        <Card id={id} sx={{ maxWidth: "566px", width: "100%", mx: "auto" }}>
            <Box
                style={{
                    boxShadow: collapse ? "none" : "1px 1px 5px",
                }}
            >
                <Header player={player} characterImage={characterImage} />
            </Box>
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
                    <PlayerBonds player={player} isCharacterSheet={true} />
                    <PlayerEquipment player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet={true} isMainTab={true} searchQuery={searchQuery} />
                    <PlayerClasses player={player} isCharacterSheet={true} isMainTab={true} searchQuery={searchQuery} />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <PlayerClasses player={player} isCharacterSheet={true} isMainTab={false} searchQuery={searchQuery} />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <PlayerRituals player={player} isCharacterSheet={true} />
                    <PlayerSpells player={player} setPlayer={setPlayer} isCharacterSheet={true} searchQuery={searchQuery} />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    <PlayerEquipment player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet={true} isMainTab={false} searchQuery={searchQuery} />
                    <PlayerVehicle player={player} setPlayer={setPlayer} isEditMode={isEditMode} isCharacterSheet={true} />
                    <PlayerCompanion player={player} isCharacterSheet={true} />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>
                    <PlayerNotes player={player} isCharacterSheet={true} searchQuery={searchQuery} />
                    <PlayerBonds player={player} isCharacterSheet={true} />
                </CustomTabPanel>
            </Box>
        </Card>
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
                        <div
                            style={{
                                whiteSpace: "pre-line",
                                display: "inline",
                                margin: 0,
                                padding: 1,
                            }}
                        >
                            <ReactMarkdown
                                components={{
                                    p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
                                    ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
                                    li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
                                    strong: (props) => (
                                        <strong style={{ fontWeight: "bold" }} {...props} />
                                    ),
                                    em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
                                }}
                                allowedElements={["strong"]}
                                unwrapDisallowed={true}
                            >
                                {player.info.description}
                            </ReactMarkdown>
                        </div>
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
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
                                        player.attributes.might,
                                        currMight
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
import { Grid, Paper, useTheme, FormControlLabel, Checkbox } from "@mui/material";
import { FormControl, TextField } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState } from "react";
import Pretty from "./Pretty";
import ChangeName from "../common/ChangeName";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../../components/common/CustomTextarea"
import CustomHeaderAlt from '../../../components/common/CustomHeaderAlt';

function Arcana() {
    const { t } = useTranslate();
    const theme = useTheme();
    const secondary = theme.palette.secondary.main;

    const [reworkEnabled, setReworkEnabled] = useState(false);
    const [name, setName] = useState("Arcanum");
    const [description, setDescription] = useState("");
    const [domain, setDomain] = useState("");
    const [mergeName, setMergeName] = useState("");
    const [mergeBenefit, setMergeBenefit] = useState("");
    const [pulseName, setPulseName] = useState("");
    const [pulseBenefit, setPulseBenefit] = useState("");
    const [dismissName, setDismissName] = useState("");
    const [dismissBenefit, setDismissBenefit] = useState("");
    return (
        <Grid container spacing={2}>
            {/* Form */}
            <Grid item xs={12} sm={6}>
                <Paper
                    elevation={3}
                    sx={{
                        p: "14px",
                        borderRadius: "8px",
                        border: "2px solid",
                        borderColor: secondary,
                    }}
                >
                    {/* Header */}
                    <CustomHeaderAlt headerText={t("Arcana")} icon={<AutoAwesome fontSize="large" />} />
                    <Grid container sx={{ mt: 0 }} spacing={1} alignItems="center">
                        <Grid item xs={6}>
                            <ChangeName
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl variant="standard" fullWidth>
                                <TextField
                                    id="effect"
                                    label={t("Domain")}
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                ></TextField>
                            </FormControl>
                        </Grid>
                        <Grid item xs={9}>
                            <FormControl variant="standard" fullWidth>
                                <TextField
                                    id="description"
                                    label={t("Description")}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    size="small"
                                ></TextField>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControlLabel
                                control={<Checkbox checked={reworkEnabled} onChange={(e) => setReworkEnabled(e.target.checked)} />}
                                label={t("Rework Enabled?")}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl variant="standard" fullWidth>
                                <TextField
                                    id="mergeName"
                                    label={t("Merge Name")}
                                    value={mergeName}
                                    onChange={(e) => setMergeName(e.target.value)}
                                    size="small"
                                ></TextField>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl variant="standard" fullWidth>
                                <CustomTextarea
                                    id="mergeBenefit"
                                    label={t("Merge Benefit")}
                                    value={mergeBenefit}
                                    onChange={(e) => setMergeBenefit(e.target.value)}
                                />
                            </FormControl>
                        </Grid>

                        {/* Pulse fields */}
                        {reworkEnabled && (
                            <>
                                <Grid item xs={12}>
                                    <FormControl variant="standard" fullWidth>
                                        <TextField
                                            id="pulseName"
                                            label={t("Pulse Name")}
                                            value={pulseName}
                                            onChange={(e) => setPulseName(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl variant="standard" fullWidth>
                                        <CustomTextarea
                                            id="pulseBenefit"
                                            label={t("Pulse Benefit")}
                                            value={pulseBenefit}
                                            onChange={(e) => setPulseBenefit(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <FormControl variant="standard" fullWidth>
                                <TextField
                                    id="dismissName"
                                    label={t("Dismiss Name")}
                                    value={dismissName}
                                    onChange={(e) => setDismissName(e.target.value)}
                                    size="small"
                                ></TextField>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl variant="standard" fullWidth>
                                <CustomTextarea
                                    id="dismissBenefit"
                                    label={t("Dismiss Benefit")}
                                    value={dismissBenefit}
                                    onChange={(e) => setDismissBenefit(e.target.value)}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Pretty */}
            <Grid item xs={12} sm={6}>
                <Pretty
                    custom={{
                        name: name,
                        description: description,
                        domain: domain,
                        mergeName: mergeName,
                        mergeBenefit: mergeBenefit,
                        pulseName: pulseName,
                        pulseBenefit: pulseBenefit,
                        dismissName: dismissName,
                        dismissBenefit: dismissBenefit,
                    }}
                    reworkEnabled={reworkEnabled}
                />
            </Grid>
        </Grid>
    );
}
export default Arcana;
import { Grid, Paper, useTheme, Button, FormControl, TextField, Divider } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState, useRef } from "react";
import Pretty from "./Pretty";
import ChangeName from "../common/ChangeName";
import ApplyRework from '../common/ApplyRework';
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../../components/common/CustomTextarea"
import CustomHeaderAlt from '../../../components/common/CustomHeaderAlt';

function Arcana() {
    const { t } = useTranslate();
    const theme = useTheme();
    const secondary = theme.palette.secondary.main;

    const [name, setName] = useState("Arcanum");
    const [description, setDescription] = useState("");
    const [domain, setDomain] = useState("");
    const [mergeName, setMergeName] = useState("");
    const [mergeBenefit, setMergeBenefit] = useState("");
    const [pulseName, setPulseName] = useState("");
    const [pulseBenefit, setPulseBenefit] = useState("");
    const [dismissName, setDismissName] = useState("");
    const [dismissBenefit, setDismissBenefit] = useState("");
    const [rework, setRework] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileUpload = (data) => {
        if (data) {
            const {
                name: uploadedName,
                description: uploadedDescription,
                domain: uploadedDomain,
                mergeName: uploadedMergeName,
                mergeBenefit: uploadedMergeBenefit,
                pulseName: uploadedPulseName,
                pulseBenefit: uploadedPulseBenefit,
                dismissName: uploadedDismissName,
                dismissBenefit: uploadedDismissBenefit,
                rework: uploadedRework,
            } = data;

            if (uploadedName) {
                setName(uploadedName);
            }
            if (uploadedDescription) {
                setDescription(uploadedDescription);
            }
            if (uploadedDomain) {
                setDomain(uploadedDomain);
            }
            if (uploadedMergeName) {
                setMergeName(uploadedMergeName);
            }
            if (uploadedMergeBenefit) {
                setMergeBenefit(uploadedMergeBenefit);
            }
            if (uploadedPulseName) {
                setPulseName(uploadedPulseName);
            }
            if (uploadedPulseBenefit) {
                setPulseBenefit(uploadedPulseBenefit);
            }
            if (uploadedDismissName) {
                setDismissName(uploadedDismissName);
            }
            if (uploadedDismissBenefit) {
                setDismissBenefit(uploadedDismissBenefit);
            }
            if (uploadedRework) {
                setRework(uploadedRework);
            }
        }
    };

    const handleClearFields = () => {
        setName("Arcanum");
        setDescription("");
        setDomain("");
        setMergeName("");
        setMergeBenefit("");
        setPulseName("");
        setPulseBenefit("");
        setDismissName("");
        setDismissBenefit("");
    };

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
                    <Grid container spacing={1} alignItems="center">
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
                        <Grid item xs={12}>
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
                        {rework && (
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
                        <Grid item xs={12}>
                        <Divider />
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        Upload JSON
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="outlined" onClick={handleClearFields}>
                                        Clear All Fields
                                    </Button>
                                </Grid>
                                <Grid item xs>
                                    <ApplyRework rework={rework} setRework={setRework} />
                                </Grid>
                            </Grid>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const result = JSON.parse(reader.result);
                                            handleFileUpload(result);
                                        };
                                        reader.readAsText(file);
                                    }
                                }}
                                style={{ display: "none" }}
                            />
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
                        rework: rework,
                    }}
                    rework={rework}
                />
            </Grid>
        </Grid>
    );
}
export default Arcana;
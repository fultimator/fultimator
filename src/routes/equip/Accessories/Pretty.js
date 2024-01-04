import React, { useRef, useState } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  Box,
  Avatar,
  useTheme,
} from "@mui/material";

function Pretty({ custom }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <PrettySingle armor={custom} />
    </div>
  );
}

function PrettySingle({ armor }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleGridItemClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const imageDataURL = reader.result;
      setSelectedImage(imageDataURL);
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <Card>
      <Stack>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 1,
            background: "#2a4a41",
            color: "#ffffff",
            "& .MuiTypography-root": {
              fontSize: "1.2rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={1}></Grid>
          <Grid item xs={6}>
            <Typography variant="h4" textAlign="left">
              Accessory
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="h4" textAlign="center">
              Cost
            </Typography>
          </Grid>
        </Grid>
        <Grid container>
          {/* Image */}
          <Grid
            item
            xs={2}
            sx={{
              flex: "0 0 70px",
              minWidth: "70px",
              minHeight: "70px",
              overflow: "hidden",
              border: "1px solid #587169",
              background: "#e1efe2",
            }}
            onClick={handleGridItemClick}
          >
            <Box
              sx={{
                width: "70px",
                height: "70px",
                background: "white",
                border: `1px solid ${primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Avatar
                alt="Image"
                src={selectedImage || ""}
                sx={{ objectFit: "cover", borderRadius: "0" }}
              />
            </Box>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
          </Grid>

          <Grid container direction="column" item xs>
            {/* First Row */}
            <Grid
              container
              justifyContent="space-between"
              item
              sx={{
                background: `linear-gradient(to right, ${ternary}, transparent)`,
                borderBottom: `1px solid ${secondary}`,
                padding: "5px",
              }}
            >
              <Grid item xs={6}>
                <Typography fontWeight="bold">{armor.name}</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography textAlign="center">{`${armor.cost}z`}</Typography>
              </Grid>
            </Grid>

            {/* Second Row */}
            <Grid
              container
              justifyContent="flex-start"
              sx={{
                background: "transparent",
                borderBottom: `1px solid ${secondary}`,
                padding: "5px",
              }}
            >
              {!armor.quality && "No Qualities"} {armor.quality}
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
}

export default Pretty;

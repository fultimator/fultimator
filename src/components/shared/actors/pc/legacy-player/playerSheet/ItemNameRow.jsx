import { Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function ItemNameRow({ name, children, size }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const ternary = theme.palette.ternary.main;

  const HEIGHT = 40;

  return (
    <Grid
      container
      spacing={0}
      sx={{
        display: "flex",
        alignItems: "stretch",
        height: `${HEIGHT}px`,
      }}
      size={size ?? { xs: 12, md: 6 }}
    >
      <Grid sx={{ display: "flex" }} size={10}>
        <Typography
          id="spell-left-name"
          variant="h2"
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
            backgroundColor: primary,
            px: "10px",
            color: "#fff",
            borderRadius: "8px 0 0 8px",
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: `${HEIGHT}px`,
            overflow: "hidden",
          }}
        >
          {name}
        </Typography>
      </Grid>
      <Grid
        sx={{
          display: "flex",
          alignItems: "stretch",
          height: `${HEIGHT}px`,
        }}
        size={2}
      >
        <div
          id="spell-right-controls"
          style={{
            padding: "0 8px",
            backgroundColor: ternary,
            borderRadius: "0 8px 8px 0",
            marginRight: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            height: `${HEIGHT}px`,
            width: "100%",
          }}
          className="spell-right-controls"
        >
          {children}
        </div>
      </Grid>
    </Grid>
  );
}

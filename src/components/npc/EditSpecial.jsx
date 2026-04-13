import { RemoveCircleOutlined } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  useMediaQuery
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from '../common/CustomTextarea';
import CustomHeader from '../common/CustomHeader';
import { Add } from "@mui/icons-material";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";

export default function EditSpecial({ npc, setNpc }) {
  const { t } = useTranslate();
  const isSmallScreen = useMediaQuery('(max-width: 899px)');
  const [modalOpen, setModalOpen] = useState(false);
  const onChangeSpecial = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.special[i][key] = value;
      return newState;
    });
  };

  const addSpecial = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.special) {
        newState.special = [];
      }
      newState.special.push({
        name: "",
        effect: "",
      });
      return newState;
    });
  };

  const removeSpecial = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.special.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <CustomHeader type={isSmallScreen ? 'middle' : 'top'} addItem={addSpecial} headerText={t("Special Rules")} icon={Add} openCompendium={() => setModalOpen(true)} />
      {npc.special?.map((special, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid  sx={{ p: 0, m: 0 }}>
              <IconButton onClick={removeSpecial(i)}>
                <RemoveCircleOutlined />
              </IconButton>
            </Grid>
            <Grid  size="grow">
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={special.name}
                  onChange={(e) => {
                    return onChangeSpecial(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid  size={3}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="spCost"
                  label={t("SP Cost:")}
                  type="number"
                  value={special?.spCost ?? 1}
                  onChange={(e) => onChangeSpecial(i, "spCost", e.target.value)}
                  size="small"
                  slotProps={{
                    htmlInput: { inputMode: "numeric", pattern: "[0-9]*" }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid  size={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField id="effect" label={t("Effect:")} value={special.effect}
                  onChange={(e) => {
                    return onChangeSpecial(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={special.effect}
                  onChange={(e) => {
                    return onChangeSpecial(i, "effect", e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        );
      })}
      <CompendiumViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context="npc"
        initialType="special"
        onAddItem={(item) => {
          setNpc((prev) => {
            const newState = { ...prev };
            if (!newState.special) newState.special = [];
            newState.special.push({ name: item.name, effect: item.effect || "", spCost: item.spCost ?? 1 });
            return newState;
          });
        }}
      />
    </>
  );
}

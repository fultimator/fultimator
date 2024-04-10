import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useTranslate } from "../../../translation/translate";

function ApplyRework({ rework, setRework }) {
  const { t } = useTranslate();
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={rework}
          onChange={(event) => setRework(event.target.checked)}
          color="primary"
        />
      }
      label={t("Rework Enabled?")}
    />
  );
}

export default ApplyRework;

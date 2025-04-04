import { Button, Snackbar } from '@mui/material';
import { useState } from 'react';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useTranslate } from "../../translation/translate";

interface CopyToClipboardProps {
  textToCopy: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ textToCopy }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslate();

  const handleClick = () => {
    setOpen(true);
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClick}>
        <ContentCopyOutlinedIcon />
      </Button>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message={t("Copied to Clipboard!")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default CopyToClipboard;

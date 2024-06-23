import React from "react";
import { Typography, Button } from "@mui/material";
import { useTheme } from '@mui/system';

interface CustomHeaderProps {
  headerText: string;
  buttonText?: string; // Optional button text
  onButtonClick?: () => void; // Optional button click handler
  isEditMode?: boolean;
}

const CustomHeader2: React.FC<CustomHeaderProps> = ({ headerText, buttonText, onButtonClick, isEditMode }) => {
  const theme = useTheme();
  const ternary = theme.palette.ternary.main;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'Antonio',
      fontWeight: 'normal',
      fontSize: '1em',
      paddingLeft: '17px',
      paddingTop: '5px',
      paddingBottom: '7px',
      color: 'black',
      textAlign: 'left',
      marginBottom: '10px',
      textTransform: 'uppercase',
      backgroundColor: ternary,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
    }}>
      <Typography variant="h2" sx={{fontSize: '1.3em'}}>
        {headerText}
      </Typography>
      {isEditMode && (buttonText && onButtonClick) && (
        <Button variant="outlined" onClick={onButtonClick} sx={{height: "30px", fontSize: '0.9em'}}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default CustomHeader2;

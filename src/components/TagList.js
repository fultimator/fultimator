import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/system';
import { useTranslate } from "../translation/translate";

const TagList = ({ npc, setNpc }) => {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [inputValue, setInputValue] = useState('');
  const maxTags = 5; // Maximum tag count
  const maxTagLength = 50; // Maximum tag length

  console.log(npc.tags);

  // Function to handle deletion of a tag
  const handleDelete = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = {
          ...prevState,
          tags: [...prevState.tags.slice(0, i), ...prevState.tags.slice(i + 1)]
        };
        return newState;
      });
    };
  };


  // Function to handle input change in the text field
  const handleInputChange = (e) => {
    // Limit input value to maxTagLength characters
    if (e.target.value.length <= maxTagLength) {
      setInputValue(e.target.value);
    }
  };

  // Function to handle key down events in the text field
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };


  // Function to handle adding a tag
  const handleAddTag = () => {
    const trimmedValue = inputValue.trim().toUpperCase();
    if (trimmedValue && (npc.tags?.length < maxTags || !npc.tags) && !npc.tags?.some(tag => tag.name.toUpperCase() === trimmedValue.toUpperCase())) {
      setNpc(prevState => {
        const newState = {
          ...prevState,
          tags: prevState.tags ? [...prevState.tags, { name: trimmedValue }] : [{ name: trimmedValue }]
        };
        return newState;
      });
      setInputValue('');
    }
  };

  // Check if the input field is disabled
  const isInputDisabled = npc.tags?.length >= maxTags;

  return (
    <Paper elevation={3} sx={{ p: "10px", borderRadius: "8px", border: "2px solid", borderColor: secondary }}>
      {/* Label for the tag list */}
      <Typography
        mb={1}
        sx={{
          fontFamily: "Antonio",
          textTransform: "uppercase",
          fontSize: "1.3rem",
        }}
      >{t("Personal Tags")}</Typography>
      {/* Stack for input field and add button */}
      <Stack direction="row" spacing={1} alignItems="flex-start">
        {/* Text field for adding tags */}
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} // Check if handleKeyDown is properly attached
          placeholder={isInputDisabled ? t("Reached tag limit") : t("Add Tag")}
          variant="outlined"
          size="small"
          fullWidth
          disabled={isInputDisabled}
          inputProps={{ maxLength: maxTagLength }} // Limit input to maxTagLength characters
          sx={{ height: '40px' }} // Set fixed height for the TextField
        />
        {/* Button to add tags */}
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleAddTag}
          disabled={isInputDisabled}
          sx={{
            height: '40px', // Match the height of the TextField
            display: isInputDisabled ? 'none' : 'block',
            padding: '0 16px' // Adjust padding for the button
          }}
        >
          {t("Add")}
        </Button>
      </Stack>
      {/* Container for displaying added tags */}
      <div style={{ marginTop: '8px' }}>
        {npc.tags?.map((tag, i) => (
          <Chip
            key={i}
            label={tag.name.toUpperCase()}
            onDelete={handleDelete(i)}
            color="primary"
            variant="outlined"
            style={{ marginRight: '5px', marginBottom: '5px' }}
          />
        ))}
      </div>
    </Paper>
  );
};

export default TagList;

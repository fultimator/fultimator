import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/system';
import { useTranslate } from "../translation/translate";

const TagList = ({ tags, onAddTag }) => {
  const { t } = useTranslate();

  const [inputValue, setInputValue] = useState('');
  const maxTags = 5;
  const maxTagLength = 50; // Maximum tag length

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  // Function to handle deletion of a tag
  const handleDelete = (tagToDelete) => {
    onAddTag(tags.filter(tag => tag !== tagToDelete));
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
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onAddTag([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  // Check if the input field is disabled
  const isInputDisabled = tags.length >= maxTags;

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
          onKeyDown={handleKeyDown}
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
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => handleDelete(tag)}
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

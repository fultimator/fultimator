import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {useTheme} from "@mui/material";

const TagList = ({ tags, onAddTag }) => {
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [inputValue, setInputValue] = useState('');

  const handleDelete = (tagToDelete) => {
    onAddTag(tags.filter(tag => tag !== tagToDelete));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onAddTag([...tags, trimmedValue]);
      setInputValue(''); // Reset input value after adding tag
    }
  };

  return (
    <Paper elevation={3} sx={{ p: "10px", borderRadius: "8px", border: "2px solid", borderColor: secondary }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Add Tag"
          variant="outlined"
          size="small"
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleAddTag}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add
        </Button>
      </Stack>
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

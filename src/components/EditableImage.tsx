import React, {useRef, useState} from "react";
import {Box} from "@mui/material";
import {AddPhotoAlternate} from "@mui/icons-material";

type EditableAvatarProps = {
  size: number
}

// EditableAvatar displays an image that can be replaced by the user with a click and a select on a file in their hard drive
// You can set the width and height of the image component with the property `size` (default 40)
function EditableImage({size}: EditableAvatarProps) {
  if (size === 0) {
    size = 40;
  }
  // the image displayed by the avatar, encoded in base64
  const [image, setImage] = useState("");

  // references a file selection input which is hidden
  const ref = useRef<HTMLInputElement>(null);

  // makes sure that when clicking on the component we trigger the file selection
  const handleClick = () => {
    if (!ref.current) { return }
    ref.current.click();
  };

  // reads the uploaded image and updates the image state
  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const imageDataURL = reader.result;
      if (typeof imageDataURL !== 'string') {return}
      setImage(imageDataURL);
    };
    reader.readAsDataURL(selectedFile);
  };

  return <>
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={handleClick}
    >
      {image ?
        <img alt="" src={image} width={`${size}px`} height={`${size}px`} style={{objectFit: "cover"}}
      /> :
        <AddPhotoAlternate sx={{opacity: 0.5, width: `${size/2}px`, height: `${size/2}px`}} />
      }
    </Box>
    <input
      type="file"
      ref={ref}
      style={{ display: "none" }}
      onChange={handleFileInputChange}
    />
  </>
}

export default EditableImage
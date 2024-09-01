import { useCallback } from "react";
import html2canvas from "html2canvas";
import { useCustomTheme } from "./useCustomTheme";

const useDownloadImage = (name, ref) => {
  const theme = useCustomTheme();
  const downloadImage = useCallback(async () => {
    const background = theme.mode === 'dark'
      ? `#1f1f1f`
      : `#ffffff`;

    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, {
          logging: true,
          useCORS: true,
          scale: 2,
          backgroundColor: `${background}`,
        });
        const dataURL = canvas.toDataURL('image/png', 1.0);
        const formattedName = name.replace(/\s+/g, '_').toLowerCase();
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${formattedName}.png`;
        link.click();
      } catch (error) {
        console.error('Failed to capture screenshot:', error);
      }
    }
  }, [name, ref, theme.mode]);

  return [downloadImage];
};

export default useDownloadImage;

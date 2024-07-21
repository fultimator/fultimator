import { useCallback } from "react";
import html2canvas from "html2canvas";

const useDownloadImage = (name, ref) => {
  const downloadImage = useCallback(async () => {
    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, {
          logging: true,
          useCORS: true,
          scale: 2
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
  }, [name, ref]);

  return [downloadImage];
};

export default useDownloadImage;

import { useCallback } from "react";
import html2canvas from "html2canvas";
import { useCustomTheme } from "./useCustomTheme";

const useDownloadImage = (name, ref) => {
  const theme = useCustomTheme();
  const downloadImage = useCallback(async () => {
    const background = theme.mode === "dark" ? `#1f1f1f` : `#ffffff`;
    const formattedName = (name || "image").replace(/\s+/g, "_").toLowerCase();
    const filename = `${formattedName}.png`;

    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, {
          logging: false,
          useCORS: true,
          allowTaint: true,
          scale: 2,
          backgroundColor: `${background}`,
        });
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS && navigator.share && canvas.toBlob) {
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png", 1.0),
          );

          if (blob) {
            const file = new File([blob], filename, { type: "image/png" });
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: formattedName });
              return;
            }
          }
        }

        const dataURL = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = filename;
        link.rel = "noopener";
        link.click();

        if (isIOS) {
          const preview = window.open();
          if (preview) {
            preview.opener = null;
            const img = preview.document.createElement("img");
            img.src = dataURL;
            img.alt = formattedName;
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            img.style.display = "block";
            img.style.margin = "0 auto";
            preview.document.body.style.margin = "0";
            preview.document.body.appendChild(img);
          }
        }
      } catch (error) {
        console.error("Failed to capture screenshot:", error);
      }
    }
  }, [name, ref, theme.mode]);

  return [downloadImage];
};

export default useDownloadImage;

import { useState } from "react";

function useUploadJSON(onUpload: (data: any) => void) {
  const [error, setError] = useState<string | null>(null);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) {
        setError("Unable to read file");
        return;
      }
      try {
        const data = JSON.parse(e.target.result as string);
        onUpload(data);
      } catch (err) {
        setError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  return { handleFileUpload, error };
}

export default useUploadJSON;

import useDownload from "./useDownload";

// useDownloadJSON exposes a function that converts the given data to json and downloads it
function useDownloadJSON(name: string, data:any) {
  const [download] = useDownload();

  function downloadJSON() {
    const jsonData = JSON.stringify(data);
    const file = new Blob([jsonData], { type: "text/json" });
    download(URL.createObjectURL(file), name + '.json', "text/json");
  }

  return [downloadJSON]
}

export default useDownloadJSON;
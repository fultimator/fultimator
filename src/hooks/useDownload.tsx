// useDownload exposes a function that makes the browser download a file
function useDownload() {
  function download(content: string, fileName: string, contentType: string) {
    fileName = fileName.replace(/\s/g, "_").toLowerCase();
    const a = document.createElement("a");
    a.href = content;
    a.download = fileName;
    a.click();
  }

  return [download]
}

export default useDownload
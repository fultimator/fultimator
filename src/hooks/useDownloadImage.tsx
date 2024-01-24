import {MutableRefObject, useEffect, useState} from "react";
import {useScreenshot} from "use-react-screenshot";

import useDownload from "./useDownload";

// useDownloadImage exposes a function that takes a screenshot of the given ref and downloads it
function useDownloadImage(name: string, ref: MutableRefObject<any>) {
  const [download] = useDownload();
  const [image, takeScreenShot] = useScreenshot();

  // To avoid triggering a download every time the name change (see the useEffect method below), we explicitly trigger with this state
  const [initiateDownload, setInitiateDownload] = useState(false);

  useEffect(() => {
    if (initiateDownload) {
      download(image, name + ".png", "png");
      setInitiateDownload(false);
    }
  }, [initiateDownload, setInitiateDownload, download, name, image]);

  useEffect(() => {
    if (image) {
      setInitiateDownload(true);
    }
  }, [image, setInitiateDownload]);

  function downloadImage() {
    takeScreenShot(ref.current);
  }

  return [downloadImage]
}

export default useDownloadImage
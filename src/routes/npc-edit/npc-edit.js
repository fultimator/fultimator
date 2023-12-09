import { useParams } from "react-router-dom";
import { firestore } from "../../firebase";

import { Grid, Divider, Fab, Fade, Tooltip } from "@mui/material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "@firebase/firestore";
import EditBasics from "../../components/npc/EditBasics";
import { Download, Save, Code, Publish, ArrowUpward, Menu, Close } from "@mui/icons-material";
import { createRef, useCallback, useEffect, useState, useRef } from "react";
// import NpcUgly from "../../components/npc/Ugly";
import ExplainSkills from "../../components/npc/ExplainSkills";
import EditAttacks from "../../components/npc/EditAttacks";
import EditWeaponAttacks from "../../components/npc/EditWeaponAttacks";
import EditAffinities from "../../components/npc/EditAffinities";
import EditSpecial from "../../components/npc/EditSpecial";
import ExplainAffinities from "../../components/npc/ExplainAffinities";
import EditExtra from "../../components/npc/EditExtra";
import EditSpells from "../../components/npc/EditSpells";
import EditActions from "../../components/npc/EditActions";
import EditRareGear from "../../components/npc/EditRareGear";
import { createFileName, useScreenshot } from "use-react-screenshot";

export default function NpcEdit() {
  let params = useParams();
  const ref = doc(firestore, "npc-personal", params.npcId);
  const [showScrollTop, setShowScrollTop] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const handleMoveToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [npc] = useDocumentData(ref, {
    idField: "id",
  });

  const [npcTemp, setNpcTemp] = useState(npc);

  useEffect(() => {
    setNpcTemp(npc);
  }, [npc]);

  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        setDoc(ref, npcTemp);
      }
    },
    [ref, npcTemp]
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    const handleFocus = () => {
      setShowScrollTop(false);
    };

    const handleBlur = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    document.body.addEventListener("focus", handleFocus, true);
    document.body.addEventListener("blur", handleBlur, true);
    document.addEventListener("keydown", handleCtrlS);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("focus", handleFocus, true);
      document.body.removeEventListener("blur", handleBlur, true);
      document.removeEventListener("keydown", handleCtrlS);
    };
  }, [handleCtrlS]);

  // Download
  const prettyRef = createRef(null);

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  const downloadJSON = () => {
    const jsonData = JSON.stringify(npcTemp);
    downloadFile(jsonData, "npc-export.json", "text/plain");
  };

  const [image, takeScreenShot] = useScreenshot();

  const download = (image, { name = "img", extension = "png" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const readFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = () => {
        try {
          const { result } = reader;
          if (!result) reject();
          resolve(JSON.parse(result));
        } catch (error) {
          reject();
        }
      };
    });

  const uploaderRef = useRef(null);

  const getImage = () => takeScreenShot(prettyRef.current);

  useEffect(() => {
    if (image) {
      download(image, { name: npc.name, extension: "png" });
    }
  }, [image, npc?.name]);

  if (!npcTemp) {
    return null;
  }

  return (
    <Layout>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <NpcPretty npc={npcTemp} ref={prettyRef} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ExplainSkills npc={npcTemp} />
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />

      <EditBasics npc={npcTemp} setNpc={setNpcTemp}/>

      <Divider sx={{ my: 2 }} />

      <Grid container>
        <Grid item xs={12} md={6}>
          <EditAffinities npc={npcTemp} setNpc={setNpcTemp}/>
        </Grid>
        <Grid item xs={12} md={6}>
          <ExplainAffinities npc={npcTemp} />
          <EditExtra npc={npcTemp} setNpc={setNpcTemp}/>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <EditAttacks npc={npcTemp} setNpc={setNpcTemp} />
      <EditWeaponAttacks npc={npcTemp} setNpc={setNpcTemp} />

      <Divider sx={{ my: 2 }} />

      <EditSpells npc={npcTemp} setNpc={setNpcTemp} />

      <Divider sx={{ my: 2 }} />

      <Grid container>
        <Grid item xs={12} md={6}>
          <EditActions npc={npcTemp} setNpc={setNpcTemp} />
        </Grid>
        <Grid item xs={12} md={6}>
          <EditSpecial npc={npcTemp} setNpc={setNpcTemp} />
        </Grid>
        <Grid item xs={12} md={6}>
          <EditRareGear npc={npcTemp} setNpc={setNpcTemp} />
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* <NpcUgly npc={npcTemp} /> */}

      <Grid sx={{
          position: "fixed",
          top: 10,
          right: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        }}>
        {/* Collapse for the Buttons */}
        {!isCollapsed && (
            <div sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', zIndex: 1000 }}>
            {/* Export Button */}
            <Tooltip title="Export JSON File" placement="bottom" sx={{ marginLeft: "5px" }}>
              <Fab
                color="primary"
                aria-label="export"
                onClick={downloadJSON}
                size="medium"
              >
                <Code />
              </Fab>
            </Tooltip>
            {/* Upload Button */}
            <Tooltip title="Upload JSON File" placement="bottom">
              <Fab
                color="primary"
                aria-label="upload"
                onClick={() => {
                  if (!uploaderRef.current) return;
                  uploaderRef.current.click();
                }}
                size="medium"
                style={{ marginLeft: "5px"}}
              >
                <Publish />
              </Fab>
            </Tooltip>
            {/* Input for File Upload */}
            <input
              type="file"
              ref={uploaderRef}
              multiple={false}
              accept=".json"
              style={{ display: "none"}}
              onChange={async ({ target }) => {
                const file = target.files?.[0];
                if (!file) return;
                setNpcTemp(await readFile(file));
              }}
            />
            {/* Download Button */}
            <Tooltip title="Download Sheet" placement="bottom">
              <Fab
                color="primary"
                aria-label="download"
                onClick={getImage}
                size="medium"
                style={{ marginLeft: "5px", zIndex: 1000 }}

              >
                <Download />
            </Fab>
            </Tooltip>
          </div>
        )}
        {/* Collapse Toggle Button */}
        <Fab
          color="primary"
          aria-label="toggle-collapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          size="medium"
          style={{ marginLeft: "5px" }}
        >
          {isCollapsed ? <Menu /> : <Close  />}
        </Fab>
    </Grid>
    
    {JSON.stringify(npc) !== JSON.stringify(npcTemp) && (
      <Grid style={{ position: "fixed", top: 80, right: 10, zIndex: 100}}>
        <Fade in={showScrollTop} timeout={300}>
          <Tooltip title="Save" placement="bottom">
            <Fab
              color="primary"
              aria-label="save"
              onClick={() => setDoc(ref, npcTemp)}
              disabled={JSON.stringify(npc) === JSON.stringify(npcTemp)}
              size="medium"
              style={{ marginLeft: "5px"}}
            >
              <Save />
            </Fab>
          </Tooltip>
        </Fade>
      </Grid>
    )}
    
    <Grid style={{ position: "fixed", bottom: 10, right: 10 }}>
      {/* Move to Top Button */}
      <Fade in={showScrollTop} timeout={300}>
        <div style={{ marginBottom: "5px", zIndex: 100 }}>
          <Fab
            color="primary"
            aria-label="move-to-top"
            onClick={handleMoveToTop}
            size="medium"
          >
            <ArrowUpward />
          </Fab>
        </div>
      </Fade>
    </Grid>
    </Layout>
  );
}

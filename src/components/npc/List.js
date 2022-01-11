import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Grid, IconButton } from "@mui/material";

import { useCollectionData } from "react-firebase-hooks/firestore";

import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react/swiper-react.js";
import "swiper/swiper.scss"; // core Swiper

import NpcPretty from "./Pretty";
import NpcText from "./Text";
import NpcUgly from "./Ugly";

export default function NpcList({ listQuery }) {
  const [list] = useCollectionData(listQuery, {
    idField: "id",
  });

  return (
    <Grid container alignItems="center" sx={{ mt: 2 }}>
      <Grid item xs={1} sx={{ textAlign: "center" }}>
        <IconButton className="swiper-button-prev">
          <ChevronLeft />
        </IconButton>
      </Grid>
      <Grid item xs={10}>
        <Swiper
          allowTouchMove={false}
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          spaceBetween={10}
          slidesPerView={2}
          slidesPerGroup={2}
        >
          {list?.length &&
            list.map((npc, i, list) => {
              return (
                <SwiperSlide key={i}>
                  <NpcPretty npc={npc} />
                  <NpcText npc={npc} />
                  <NpcUgly npc={npc} />
                </SwiperSlide>
              );
            })}
        </Swiper>

        {/* <Grid container spacing={2}>
          {list?.length &&
            list.map((npc, i, list) => {
              if (i < offset) {
                return null;
              }
              if (i >= offset + limit) {
                return null;
              }
              return (
                <Grid key={npc.id} item xs={6}>
                  <NpcPretty npc={npc} />
                  <NpcUgly npc={npc} />
                </Grid>
              );
            })}
        </Grid> */}
      </Grid>
      <Grid item xs={1} sx={{ textAlign: "center" }}>
        <IconButton className="swiper-button-next">
          <ChevronRight />
        </IconButton>
      </Grid>
    </Grid>
  );
}

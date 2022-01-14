import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Grid, IconButton } from "@mui/material";

import { useCollectionData } from "react-firebase-hooks/firestore";

import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react/swiper-react.js";
import "swiper/swiper.scss"; // core Swiper

export default function NpcList({ listQuery, component }) {
  const [list] = useCollectionData(listQuery, {
    idField: "id",
  });

  return (
    <Grid container alignItems="flex-start" sx={{ mt: 2 }}>
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
          {list?.length > 0 &&
            list.map((npc, i) => {
              return <SwiperSlide key={i}>{component(npc)}</SwiperSlide>;
            })}
        </Swiper>
      </Grid>
      <Grid item xs={1} sx={{ textAlign: "center" }}>
        <IconButton className="swiper-button-next">
          <ChevronRight />
        </IconButton>
      </Grid>
    </Grid>
  );
}

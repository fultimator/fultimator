import { affinityIconSrc } from "/src/libs/player/wellsprings";

export default function WellspringIcon({ wellspring, size = 20 }) {
  return (
    <img
      src={affinityIconSrc(wellspring?.icon)}
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
      alt={wellspring?.key || ""}
    />
  );
}

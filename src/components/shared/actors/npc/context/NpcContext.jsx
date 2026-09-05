import { useState, useEffect } from "react";
import { NpcContext } from "./NpcContextValue";

export const NpcProvider = ({ children, npcData }) => {
  const [npcTemp, setNpcTemp] = useState(npcData);

  useEffect(() => {
    setNpcTemp(npcData);
  }, [npcData]);

  return (
    <NpcContext.Provider value={{ npcTemp, setNpcTemp }}>
      {children}
    </NpcContext.Provider>
  );
};

export { NpcContext };

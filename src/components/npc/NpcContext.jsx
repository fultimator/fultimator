import React, { createContext, useContext, useState, useEffect } from "react";

const NpcContext = createContext();

export const useNpc = () => useContext(NpcContext);

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

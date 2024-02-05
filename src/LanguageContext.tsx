import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageProviderProps {
  children: ReactNode;
}

interface LanguageContextProps {
  selectedLanguage: string;
  setLanguage: (languageCode: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'en');

  const setLanguage = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('Oops! It seems like useLanguageContext is not wrapped in a LanguageProvider.');
  }
  return context;
};

export { LanguageProvider, useLanguageContext };
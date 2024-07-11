import {
    FC, createContext, useContext, useMemo, useState,
  } from "react";
 
  
  
  const FolderListProviderContext = createContext<FolderListProviderContextType | null>(null);
  
  export const useFolderListProvider = () => {
    const context = useContext(FolderListProviderContext);
    if (!context) {
      throw new Error("useFolderListProvider must be used within a FolderListProviderProvider");
    }
    return context;
  };
  
  export const FolderListProviderProvider: FC<FolderListProviderProviderProps> = ({ children }) => {
    const [basicState, setBasicState] = useState<boolean>(false);

    const value = useMemo<FolderListProviderContextType>(
      () => ({
        basicState,

      }),
      [basicState],
    );
  
    return (
      <FolderListProviderContext.Provider value={value}>
        {children}
      </FolderListProviderContext.Provider>
    );
  };
import {
    FC, createContext, useContext, useMemo, useState,
  } from "react";
 
  
  
  const BoardListProviderContext = createContext<BoardListProviderContextType | null>(null);
  
  export const useBoardListProvider = () => {
    const context = useContext(BoardListProviderContext);
    if (!context) {
      throw new Error("useBoardListProvider must be used within a BoardListProviderProvider");
    }
    return context;
  };
  
  export const BoardListProviderProvider: FC<BoardListProviderProviderProps> = ({ children }) => {
    const [basicState, setBasicState] = useState<boolean>(false);

    const value = useMemo<BoardListProviderContextType>(
      () => ({
        basicState,

      }),
      [basicState],
    );
  
    return (
      <BoardListProviderContext.Provider value={value}>
        {children}
      </BoardListProviderContext.Provider>
    );
  };
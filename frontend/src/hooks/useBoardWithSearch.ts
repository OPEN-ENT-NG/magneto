import { useState, useEffect } from "react";

import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import { useGetBoardByIdQuery } from "~/services/api/boards.service";

export const useBoardWithSearch = (boardId: string) => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { registerActiveSearch } = useWebSocketMagneto();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const {
    data: board,
    refetch,
    isFetching,
  } = useGetBoardByIdQuery(
    {
      boardId,
      searchText: debouncedSearch,
    },
    {
      skip: !boardId,
    },
  );

  useEffect(() => {
    if (debouncedSearch && boardId) {
      console.log("🔍 Registering active search:", debouncedSearch);
      const unregister = registerActiveSearch(
        boardId,
        debouncedSearch,
        refetch,
      );
      return unregister;
    }
  }, [boardId, debouncedSearch, refetch, registerActiveSearch]);

  return {
    board,
    searchText,
    setSearchText,
    isFetching,
    hasActiveSearch: !!debouncedSearch,
  };
};

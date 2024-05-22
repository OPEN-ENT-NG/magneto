import React from "react";

import { SearchBar } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { BoardList } from "../board-list/BoardList";
import { FolderList } from "../folder-list/FolderList";
import ToasterContainer from "../toaster-container/ToasterContainer";

export const ContentPage = () => {

  // const [isToasterOpen, toggleIsToasterOpen] = useToaster();

  return (
    <>
      <SearchBar
        isVariant
        onChange={function Ga() {}}
        onClick={function Ga() {}}
        placeholder="Search something...."
        size="md"
      />
      <FolderList />
      <ToasterContainer />
      <BoardList />
    </>
  );
};

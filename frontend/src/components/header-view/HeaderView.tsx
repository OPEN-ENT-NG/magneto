import React from "react";

import { AppHeader, Breadcrumb, useOdeClient } from "@edifice-ui/react";

import { useBoard } from "~/providers/BoardProvider";

export const HeaderView: React.FunctionComponent = () => {
  const { board } = useBoard();

  const { currentApp } = useOdeClient();

  return (
    <AppHeader>
      {currentApp && <Breadcrumb app={currentApp} name={board?.title} />}
    </AppHeader>
  );
};

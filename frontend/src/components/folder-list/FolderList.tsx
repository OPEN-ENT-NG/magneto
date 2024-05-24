import React from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";
import { animated, useSpring } from "@react-spring/web";

import "./FolderList.scss";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";

export const FolderList = () => {
  const { currentApp } = useOdeClient();
  // const [isToasterOpen, setIsToasterOpen] = useToaster();

  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(false);

  let folderData;
  if (getFoldersError) {
    console.log("error");
  } else if (getFoldersLoading) {
    console.log("loading");
  } else {
    console.log("myFoldersResult", myFoldersResult);
    folderData = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); //convert folders to Folder[]
  }

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  return (
    <>
      {folderData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {folderData.map((folder: Folder) => {
            const { id, title } = folder;
            return (
              <animated.li
                className="g-col-4 z-1 folderSizing"
                key={id}
                style={{
                  position: "relative",
                  ...springs,
                }}
              >
                <Card
                  app={currentApp!}
                  options={{
                    type: "folder",
                    title,
                  }}
                  // onClick={() => {setIsToasterOpen()}}
                  isLoading={getFoldersLoading}
                  isSelectable={false}
                >
                  <Card.Body>
                    <Icon path={mdiFolderPlus} size={1}></Icon>
                    <Card.Title>{title}</Card.Title>
                  </Card.Body>
                </Card>
              </animated.li>
            );
          })}
        </animated.ul>
      ) : null}
    </>
  );
};

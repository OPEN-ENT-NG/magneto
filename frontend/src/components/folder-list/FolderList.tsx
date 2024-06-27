import React, { useEffect, useState } from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";
import { animated, useSpring } from "@react-spring/web";

import "./FolderList.scss";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";

type FolderListProps = {
  currentFolder: Folder;
  onSelect: (folder: Folder) => void;
  folderIds: String[];
  selectedFolders: Folder[];
  setFolderIds: React.Dispatch<React.SetStateAction<String[]>>;
  setSelectedFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  searchText: string;
};

export const FolderList: React.FunctionComponent<FolderListProps> = ({
  currentFolder,
  onSelect,
  folderIds,
  selectedFolders,
  setFolderIds,
  setSelectedFolders,
  searchText,
}) => {
  const { currentApp } = useOdeClient();
  const [foldersQuery, setFoldersQuery] = useState<boolean>(false);

  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(foldersQuery);

  let folderData: Folder[] = [];

  const filterFolderData = (): void => {
    if (
      !currentFolder.id ||
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
      currentFolder.id == ""
    ) {
      folderData = folderData.filter((folder: Folder) => !folder.parentId);
    } else if (currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS) {
      folderData = [];
    } else if (!!currentFolder && !!currentFolder.id) {
      folderData = folderData.filter(
        (folder: Folder) => folder.parentId == currentFolder.id,
      );
    } else {
      console.log("currentFolder undefined, try later or again");
    }
  };

  if (getFoldersError) {
    console.log("error");
  } else if (getFoldersLoading) {
    console.log("loading");
  } else if (myFoldersResult) {
    folderData = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); // convert folders to Folder[]
    filterFolderData();
  }

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  async function toggleSelect(resource: Folder) {
    if (folderIds.includes(resource.id)) {
      setFolderIds(
        folderIds.filter(
          (selectedResource: String) => selectedResource !== resource.id,
        ),
      );
      setSelectedFolders(
        selectedFolders.filter(
          (selectedResource) => selectedResource.id !== resource.id,
        ),
      );
      return;
    }
    setFolderIds([...folderIds, resource.id]);
    setSelectedFolders([...selectedFolders, resource]);
  }

  useEffect(() => {
    setFoldersQuery(
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS || !!currentFolder.deleted,
    );
  }, [currentFolder]);

  return (
    <>
      {folderData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {folderData
            .filter((folder: Folder) => {
              if (searchText === "") {
                return folder;
              } else if (
                folder.title.toLowerCase().includes(searchText.toLowerCase())
              ) {
                return folder;
              }
            })
            .map((folder: Folder) => {
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
                    isLoading={getFoldersLoading}
                    isSelectable={true}
                    isSelected={folderIds.includes(id)}
                    onSelect={() => toggleSelect(folder)}
                    onClick={() => {
                      onSelect(folder);
                    }}
                  >
                    <Card.Body>
                      <Icon path={mdiFolderPlus} size={1}></Icon>
                      <Card.Title className="title">{title}</Card.Title>
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

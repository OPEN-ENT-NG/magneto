import React from "react";
import "./TreeViewContent.scss";

import {  Button, TreeView } from "@edifice-ui/react";
import { useSelector } from "react-redux";
import { useSpring, animated } from "@react-spring/web";

// import * as MaterialDesign from "react-icons/md";

interface FolderTreeNavItem {
  id: string;
  name: string;
  iconClass: string;
  children: Array<FolderTreeNavItem>;
  parentId: string;
  isOpened: boolean;
  ownerId: string;
  shared: any[];
}

export const FolderList = ({folderData:folderData}) => {
    

  return (
    <>
        folders.length ? (
            <animated.ul className="grid ps-0 list-unstyled mb-24">
            {data?.pages[0]?.folders.map((folder: IFolder) => {
                const { id, name } = folder;
                return (
                <animated.li
                    className="g-col-4 z-1"
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
                        name,
                    }}
                    isLoading={isFetching}
                    isSelected={folderIds.includes(folder.id)}
                    onOpen={() => {
                        scrollToTop();
                        openFolder({ folder, folderId: folder.id });
                    }}
                    onSelect={() => toggleSelect(folder)}
                    />
                </animated.li>
                );
            })}
            </animated.ul>
        ) : null;
    </>
  );
};

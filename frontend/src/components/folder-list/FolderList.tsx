import React from "react";

import { Card } from "@edifice-ui/react";
import {  animated } from "@react-spring/web";
import { Folder } from "~/models/folder.model";


export const FolderList = ({folderData}: any) => {
    console.log(folderData);
    

  return (
    <>
        {!!folderData ?? (
            folderData.map((folder: Folder) => {
                return(
                    <Card>
                        <Card.Body>
                            <Card.Title>
                            {folder.name}
                            </Card.Title>
                        </Card.Body>
                    </Card>
                )
            })

        )}

        
        {false  ? (
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
        ) 
        : 
        <div>coucou</div>}
    </>
  );
};

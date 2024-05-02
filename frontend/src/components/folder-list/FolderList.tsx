import React from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import {  animated, useSpring } from "@react-spring/web";

import "./FolderList.scss";
import { Folder } from "~/models/folder.model";




export const FolderList = ({folderData}: any, isLoading: boolean) => {
    console.log(folderData);
    const { currentApp } = useOdeClient();

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
                return(
                    <animated.li
                        className="g-col-4 z-1 folderSizing"
                        key={id}
                        style={{
                        position: "relative",
                        ...springs
                        }}
                    >
                        <Card
                            app={currentApp!}
                            options={{
                                type: "folder",
                                title,
                            }}
                            isLoading={isLoading}
                            isSelectable={false}
                        >
                            <Card.Body>
                                <Card.Title>
                                {title}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </animated.li>
                    
                )
            })}
        </animated.ul> 
        ) : null
        }

                    {/* <Card>
                        <Card.Body>
                            <Card.Title>
                            {folderData[0].title}
                            </Card.Title>
                        </Card.Body>
                    </Card> */}
        
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

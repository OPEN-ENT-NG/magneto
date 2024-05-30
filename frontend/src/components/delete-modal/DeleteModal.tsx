import React, { FunctionComponent, useState } from "react";

// eslint-disable-next-line
import {
    Button,
    Modal,
    useOdeClient,
} from "@edifice-ui/react";


import { Board } from "~/models/board.model";
import { usePreDeleteBoardsMutation, useDeleteBoardsMutation } from "~/services/api/boards.service";
import { usePreDeleteFoldersMutation, useDeleteFoldersMutation } from "~/services/api/folders.service";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { t } from "i18next";

type props = {
    isOpen: boolean;
    toggle: () => void;
    boardIds: String[];
    folderIds: String[];
    isPredelete: boolean;
};

export const DeleteModal: FunctionComponent<props> = ({
    isOpen,
    toggle,
    boardIds,
    folderIds,
    isPredelete,
}: props) => {
    const [preDeleteBoards] = usePreDeleteBoardsMutation();
    const [preDeleteFolders] = usePreDeleteFoldersMutation();
    const [deleteBoards] = useDeleteBoardsMutation();
    const [deleteFolders] = useDeleteFoldersMutation();

    const [currentFolder, setCurrentFolder] = useState<Folder>(new Folder());

    const { user, currentApp } = useOdeClient();

    const userId = user ? user?.userId : "";

    const isSameAsUser = (id: string) => {
        return id == userId;
    };

    const onSubmit = (): void => {
        if (isPredelete)
            onSubmitPredelete();
        else
            onSubmitDelete();
        toggle();
    };

    const onSubmitPredelete = (): void => {
        if (boardIds.length > 0)
            preDeleteBoards(boardIds);
        if (folderIds.length > 0)
            preDeleteFolders(folderIds);

        //TODO send toast of success/failure
        return;
    }

    const onSubmitDelete = (): void => {
        if (boardIds.length > 0)
            deleteBoards(boardIds);
        if (folderIds.length > 0)
            deleteFolders(folderIds);

        //TODO send toast of success/failure
        return;
    }

    return (
        <>
            {isOpen && (
                <Modal
                    id={"create"}
                    isOpen={isOpen}
                    onModalClose={toggle}
                    size="lg"
                    viewport={false}
                >
                    <Modal.Header onModalClose={toggle}>
                        <h2>Supprimer les tableaux/dossiers</h2>
                    </Modal.Header>
                    <Modal.Body>
                        {isPredelete ? (
                            <div>
                                Êtes-vous sûr(e) de vouloir mettre les tableaux/dossiers sélectionnés à la corbeille ?
                            </div>
                        ) :
                            (
                                <div>
                                    Êtes-vous sûr(e) de vouloir supprimer définitivement les tableaux/dossiers sélectionnés ?
                                </div>
                            )}
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="right">
                            <Button
                                color="primary"
                                type="button"
                                variant="outline"
                                className="footer-button"
                                onClick={toggle}
                            >
                                Annuler
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                variant="filled"
                                className="footer-button"
                                onClick={onSubmit}
                            >
                                Enregistrer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};
import React, { FunctionComponent, useEffect, useState } from "react";

import { Button, FormControl, Input, Label, Modal, ShareModal } from "@edifice-ui/react";
import { t } from "i18next";

import { Folder } from "../../models/folder.model";
import {
    useCreateFolderMutation,
    useUpdateFolderMutation,
} from "~/services/api/folders.service";

type props = {
    isOpen: boolean;
    toggle: () => void;
    shareOptions: any;
};

export const ShareModalMagneto: FunctionComponent<props> = ({
    isOpen,
    toggle,
    shareOptions
}: props) => {
    const [title, setTitle] = useState("");

    const resetFields = (): void => {
        setTitle("");
        toggle();
    };

    const handleShareClose = (): void => {
        console.log("aww");
        toggle();
    };

    const handleShareSuccess = (): void => {
        console.log("yeyy");
        toggle();
    };

    /*useEffect(() => {
        if (folderToUpdate != null) {
            setTitle(folderToUpdate.title);
        }
    }, [folderToUpdate]);*/

    return (
        <>
            {isOpen && (
                <ShareModal
                    isOpen={isOpen}
                    shareOptions={shareOptions}
                    onCancel={handleShareClose}
                    onSuccess={handleShareSuccess}
                />
            )}
        </>
    );
};

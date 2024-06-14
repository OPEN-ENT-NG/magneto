import { useOdeClient } from "@edifice-ui/react";
import { rights } from "~/core/constants/rights.const";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { SHARE_RIGHTS } from "~/core/enums/rights.enum";
import { Folder } from "~/models/folder.model";


export const getRight = (right: string) : string => {
    let shareRight: string;

    switch (right) {
        case "read" :
            shareRight = rights.resources.read.right;
            break;
        case "publish" :
            shareRight = rights.resources.publish.right;
            break;
        case "contrib" :
            shareRight = rights.resources.contrib.right;
            break;
        case "manager" :
            shareRight = rights.resources.manager.right;
            break;
        default :
            shareRight = "";
            break;
    }

    return shareRight;
}

export const folderHasShareRights = (folder: Folder, right: string) : boolean => {
    const { user } = useOdeClient();

    let shareRight: string = getRight(right);
    if (!folder || !folder.shared) return false;

    let hasShareRight: boolean = false;
    folder.shared.forEach((shareItem: any) => {
        let hasIndividualShareRight: boolean = !!shareItem.userId && (shareItem.userId == user.userId) && (shareItem[shareRight] == true);

        let hasGroupShareRight: boolean = !!shareItem.groupId
            && !!user.groupsIds.find((groupId: string) => {
                shareItem.groupId == groupId && shareItem[shareRight] == true});

        if (hasIndividualShareRight || hasGroupShareRight) hasShareRight = true ;
    })

    return hasShareRight;
}

export const hasFolderCreationRight = (openedFolder: Folder): boolean => { // main page || folder owner || has folder share rights
    const { user } = useOdeClient();
    let currentFolder = !!openedFolder ? openedFolder : null;

    return currentFolder == null
        || currentFolder.id == FOLDER_TYPE.MY_BOARDS
        || currentFolder.ownerId == user.userId
        || folderHasShareRights(currentFolder, SHARE_RIGHTS.PUBLISH);
}

export const folderOwnerOrMainPage = (folder: Folder): boolean => {
    const { user } = useOdeClient();
    let isFolderOwner: boolean = !!folder && folder.ownerId == user.userId;
    let isMainPage: boolean = folder == null || folder.id == undefined || folder.id == FOLDER_TYPE.MY_BOARDS;

    return isFolderOwner || isMainPage;
}

export const folderOwnerNotShared = (folder: Folder): boolean => {
    return folderOwnerOrMainPage(folder) && (!folder.shared || folder.shared.length == 0);
}

export const folderOwnerAndSharedOrShareRights = (folder: Folder): boolean => {
    return (folderOwnerOrMainPage(folder) && !!folder.shared && folder.shared.length > 0) || folderHasShareRights(folder, SHARE_RIGHTS.PUBLISH);
}

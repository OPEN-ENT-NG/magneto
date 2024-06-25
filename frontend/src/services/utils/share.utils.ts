import { IUserInfo } from "edifice-ts-client";
import { rights } from "~/core/constants/rights.const";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { SHARE_RIGHTS } from "~/core/enums/rights.enum";
import { Folder } from "~/models/folder.model";

export class UserRights {
    private user: IUserInfo|any;

    constructor(user: IUserInfo|any) {
        this.user = user;
    }

    public getRight = (right: string) : string => {
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

public folderHasShareRights = (folder: Folder, right: string) : boolean => {
    
    let shareRight: string = this.getRight(right);
    if (!folder || !folder.shared) return false;

    let hasShareRight: boolean = false;
    folder.shared.forEach((shareItem: any) => {
        let hasIndividualShareRight: boolean = !!shareItem.userId && (shareItem.userId == this.user.userId) && (shareItem[shareRight] == true);

        let hasGroupShareRight: boolean = !!shareItem.groupId
            && !!this.user.groupsIds.find((groupId: string) => {
                shareItem.groupId == groupId && shareItem[shareRight] == true});

        if (hasIndividualShareRight || hasGroupShareRight) hasShareRight = true ;
    })

    return hasShareRight;
}

public hasFolderCreationRight = (openedFolder: Folder): boolean => { // main page || folder owner || has folder share rights
    let currentFolder = !!openedFolder ? openedFolder : null;

    return currentFolder == null
        || currentFolder.id == FOLDER_TYPE.MY_BOARDS
        || currentFolder.ownerId == this.user.userId
        || this.folderHasShareRights(currentFolder, SHARE_RIGHTS.PUBLISH);
}

public folderOwnerOrMainPage = (folder: Folder): boolean => {
    let isFolderOwner: boolean = !!folder && folder.ownerId == this.user.userId;
    let isMainPage: boolean = folder == null || folder.id == undefined || folder.id == FOLDER_TYPE.MY_BOARDS;

    return isFolderOwner || isMainPage;
}

public folderOwnerNotShared = (folder: Folder): boolean => {
    return this.folderOwnerOrMainPage(folder) && (!folder.shared || folder.shared.length == 0);
}

public folderOwnerAndSharedOrShareRights = (folder: Folder): boolean => {
    return (this.folderOwnerOrMainPage(folder) && !!folder.shared && folder.shared.length > 0) || this.folderHasShareRights(folder, SHARE_RIGHTS.PUBLISH);
}




}

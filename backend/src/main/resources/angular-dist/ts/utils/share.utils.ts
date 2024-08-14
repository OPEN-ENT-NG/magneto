import {model} from "entcore";
import {Folder} from "../models";
import {rights} from "../magnetoBehaviours";
import {FOLDER_TYPE} from "../core/enums/folder-type.enum";
import {SHARE_RIGHTS} from "../core/enums/rights.enum";

export class ShareUtils {

    static getRight = (right: string) : string => {
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
                break;
        }

        return shareRight;
    }

    static folderHasShareRights = (folder: Folder, right: string) : boolean => {
        let shareRight: string = this.getRight(right);
        if (!folder || !folder.shared) return false;

        let hasShareRight: boolean = false;
        folder.shared.forEach((shareItem: any) => {
            let hasIndividualShareRight: boolean = !!shareItem.userId && (shareItem.userId == model.me.userId) && (shareItem[shareRight] == true);

            let hasGroupShareRight: boolean = !!shareItem.groupId
                && !!model.me.groupsIds.find((groupId: string) => {
                    shareItem.groupId == groupId && shareItem[shareRight] == true});

            if (hasIndividualShareRight || hasGroupShareRight) hasShareRight = true ;
        })

        return hasShareRight;
    }

    static hasFolderCreationRight = (openedFolder: Folder): boolean => { // main page || folder owner || has folder share rights
        let currentFolder = !!openedFolder ? openedFolder : null;

        return currentFolder == null
            || currentFolder.id == FOLDER_TYPE.MY_BOARDS
            || currentFolder.ownerId == model.me.userId
            || this.folderHasShareRights(currentFolder, SHARE_RIGHTS.PUBLISH);
    }

    static folderOwnerOrMainPage = (folder: Folder): boolean => {
        let isFolderOwner: boolean = !!folder && folder.ownerId == model.me.userId;
        let isMainPage: boolean = folder == null || folder.id == undefined || folder.id == FOLDER_TYPE.MY_BOARDS;

        return isFolderOwner || isMainPage;
    }

    static folderOwnerNotShared = (folder: Folder): boolean => {
        return this.folderOwnerOrMainPage(folder) && (!folder.shared || folder.shared.length == 0);
    }

    static folderOwnerAndSharedOrShareRights = (folder: Folder): boolean => {
        return (this.folderOwnerOrMainPage(folder) && !!folder.shared && folder.shared.length > 0) || this.folderHasShareRights(folder, SHARE_RIGHTS.PUBLISH);
    }
}
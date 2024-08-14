import { useOdeClient } from "@edifice-ui/react";
import { IUserInfo } from "edifice-ts-client";
import { rights } from "~/core/constants/magnetoBehaviours";
import { Folder } from "~/models/folder.model";

const getRight = (right: string) : string => {
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

export const folderHasShareRights = (
    folder: Folder,
    right: string,
    user: any
) => {
    let shareRight: string = getRight(right);
    if (!folder || !folder.shared) return false;

    let hasShareRight: boolean = false;
    folder.shared.forEach((shareItem: any) => {
        let hasIndividualShareRight: boolean = !!shareItem.userId && (shareItem.userId == user?.userId) && (shareItem[shareRight] == true);

        let hasGroupShareRight: boolean = !!shareItem.groupId
            && !!user?.groupsIds.find((groupId: string) => {
                shareItem.groupId == groupId && shareItem[shareRight] == true});

        if (hasIndividualShareRight || hasGroupShareRight) hasShareRight = true ;
    })

    return hasShareRight;
}

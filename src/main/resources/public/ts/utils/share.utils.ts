import {model} from "entcore";
import {Folder} from "../models";
import {rights} from "../magnetoBehaviours";

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

        folder.shared.forEach((shareItem: any) => {
            let hasIndividualShareRight: boolean = !!shareItem.userId && (shareItem.userId == model.me.userId) && (shareItem[shareRight] == true);

            let hasGroupShareRight: boolean = !!shareItem.groupId
                && !!model.me.groupsIds.map((groupId: string) => {
                    shareItem.groupId == groupId && shareItem[shareRight] == true});

            return hasIndividualShareRight || hasGroupShareRight;
        })

        return false;
    }
}
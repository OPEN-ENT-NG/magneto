import {Behaviours, model} from 'entcore';
import {rights} from "./magnetoBehaviours";
import {boardsService} from "./services";

export const MAGNETO_APP = "magneto";

Behaviours.register(MAGNETO_APP, {
    rights,
    dependencies: {},
    loadResources: async function(): Promise<any> {
        const data = await boardsService.getAllBoardsEditable();
        this.resources = data.all.map(board => {
            return {
                id: board.id,
                icon: board.imageUrl,
                title: board.title,
                ownerName: board.owner.displayName,
                path: `${window.location.origin}/magneto#/board/view/${board.id}`
            }
        });
    },
    resource: function (resource: any) {
        let rightsContainer = resource;
        if (resource && !resource.myRights) {
            resource.myRights = {};
        }
        for (const behaviour in  rights.resources) {
            if (model.me.hasRight(rightsContainer, rights.resources[behaviour]) ||
                model.me.userId === resource.owner.userId || model.me.userId === rightsContainer.owner.userId) {
                if (resource.myRights[behaviour] !== undefined) {
                    resource.myRights[behaviour] = resource.myRights[behaviour] &&
                        rights.resources[behaviour];
                } else {
                    resource.myRights[behaviour] = rights.resources[behaviour];
                }
            }
        }
        return resource;
    },
    resourceRights: function () {
        return ['read', 'publish', 'contrib', 'manager'];
    }
});

import {ng} from "entcore";
import http, {AxiosResponse} from "axios";
export interface IWorkspaceService {
    canEditDocument(documentId: string): Promise<boolean>;
}


export const workspaceService: IWorkspaceService = {
    canEditDocument: async (documentId: string): Promise<boolean> => {
        return http.get(`/magneto/workspace/${documentId}/canedit`)
            .then((res: AxiosResponse) => {
                return res.data['canEdit'] as boolean;
            });
    }
};

export const WorkspaceService = ng.service('WorkspaceService', (): IWorkspaceService => workspaceService);

import {ng, model} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {BoardForm, Boards, IBoardsParamsRequest} from "../models";

export interface IBoardsService {
    getAllBoards(params: IBoardsParamsRequest): Promise<Boards>;

    getAllBoardsEditable(): Promise<Boards>;

    getBoardsByIds(boardIds: Array<string>): Promise<Boards>;

    createBoard(params: BoardForm): Promise<AxiosResponse>;

    updateBoard(boardId: string, params: BoardForm): Promise<AxiosResponse>;

    preDeleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    restorePreDeleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    deleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    duplicateBoard(boardId: string): Promise<AxiosResponse>;

    moveBoardsToFolder(boardIds: Array<string>, folderId: string): Promise<AxiosResponse>;

    getAllDocumentIds(boardId: string): Promise<any>;

    syncDocumentSharing(documentIds: string[], shared: {users: {[userId: string]: string[]},
        groups: {[groupId: string]: string[]},
        bookmarks: {[bookmarkId: string]: string[]}}): Promise<any>;
}

export const boardsService: IBoardsService = {
    getAllBoards: async (params: IBoardsParamsRequest): Promise<Boards> => {
        let urlParams: string = `?isPublic=${params.isPublic}&isShared=${params.isShared}` +
            `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}`;

        if (params.folderId) {
            urlParams += `&folderId=${params.folderId}`;
        }

        if (params.page != null) {
            urlParams += `&page=${params.page}`;
        }

        if (params.searchText !== undefined && params.searchText !== null && params.searchText !== '') {
            urlParams += `&searchText=${params.searchText}`;
        }
        return http.get(`/magneto/boards${urlParams}`)
            .then((res: AxiosResponse) => new Boards(res.data));
    },

    getBoardsByIds: async (boardIds: Array<string>): Promise<Boards> => {
        return http.post(`/magneto/boards`, {boardIds: boardIds})
            .then((res: AxiosResponse) => new Boards(res.data));
    },

    getAllBoardsEditable: async (): Promise<Boards> => {
        return http.get(`/magneto/boards/editable`)
            .then((res: AxiosResponse) => new Boards(res.data));
    },

    createBoard: async (params: BoardForm): Promise<AxiosResponse> => {
        return http.post(`/magneto/board`, params.toJSON());
    },

    updateBoard: async (boardId: string, params: BoardForm): Promise<AxiosResponse> => {
        return http.put(`/magneto/board/${boardId}`, params.toJSON());
    },

    preDeleteBoards: async (boardIds: Array<string>): Promise<AxiosResponse> => {
        return http.put(`/magneto/boards/predelete`, {boardIds: boardIds});
    },

    restorePreDeleteBoards: async (boardIds: Array<string>): Promise<AxiosResponse> => {
        return http.put(`/magneto/boards/restore`, {boardIds: boardIds});
    },

    deleteBoards: async (boardIds: Array<string>): Promise<AxiosResponse> => {
        return http.delete(`/magneto/boards`, {data: {boardIds: boardIds}});
    },

    duplicateBoard: async (boardId: string): Promise<AxiosResponse> => {
        return http.put(`/magneto/board/duplicate/${boardId}`);
    },

    moveBoardsToFolder: async (boardIds: Array<string>, folderId: string): Promise<AxiosResponse> => {
        return http.put(`/magneto/boards/folder/${folderId}`, {boardIds: boardIds});
    },
    getAllDocumentIds: async (boardId: string): Promise<any> => {
         return http.get(`/magneto/boards/${boardId}/resources`)
            .then((res: AxiosResponse) => res.data);
    },
    syncDocumentSharing: async (documentIds: string[],
                                shared: {users: {[userId: string]: string[]},
                                    groups: {[groupId: string]: string[]},
                                    bookmarks: {[bookmarkId: string]: string[]}}): Promise<any> => {


        let shareBody = {users: {}, groups: {}, bookmarks: {}};
        let defaultWorkspaceRights: string[] = [
            "org-entcore-workspace-controllers-WorkspaceController|getDocument",
            "org-entcore-workspace-controllers-WorkspaceController|copyDocuments",
            "org-entcore-workspace-controllers-WorkspaceController|getDocumentProperties",
            "org-entcore-workspace-controllers-WorkspaceController|getRevision",
            "org-entcore-workspace-controllers-WorkspaceController|copyFolder",
            "org-entcore-workspace-controllers-WorkspaceController|getPreview",
            "org-entcore-workspace-controllers-WorkspaceController|copyDocument",
            "org-entcore-workspace-controllers-WorkspaceController|getDocumentBase64",
            "org-entcore-workspace-controllers-WorkspaceController|listRevisions"
        ];

        for (let userId in shared.users) {
            shareBody.users[userId] = defaultWorkspaceRights;
            if (shared.users[userId].includes("fr-cgi-magneto-controller-ShareBoardController|initPublishRight")) {
                shareBody.users[userId].push("org-entcore-workspace-controllers-WorkspaceController|updateDocument");
            }
        }

        for (let userId in shared.groups) {
            shareBody.groups[userId] = defaultWorkspaceRights;
            if (shared.groups[userId].includes("fr-cgi-magneto-controller-ShareBoardController|initPublishRight")) {
                shareBody.groups[userId].push("org-entcore-workspace-controllers-WorkspaceController|updateDocument");
            }
        }

        let sharePromises = [];
        let uniqueDocumentIds = new Set(documentIds);

        for (let docId of Array.from(uniqueDocumentIds)) {
            if (docId !== '') {
                sharePromises.push(http.put('/workspace/share/resource/' + docId, shareBody)
                    .catch(err => console.error('Erreur lors du partage du document ' + docId, err)));
            }
            await Promise.all(sharePromises);
        }
    }
};

export const BoardsService = ng.service('BoardsService', (): IBoardsService => boardsService);

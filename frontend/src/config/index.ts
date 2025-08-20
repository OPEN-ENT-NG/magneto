export const workflows = {
  view: "fr.cgi.magneto.controller.MagnetoController|view",
  manage: "fr.cgi.magneto.controller.FakeRight|boardManage",
  publish: "fr.cgi.magneto.controller.FakeRight|boardPublish",
  comment: "fr.cgi.magneto.controller.FakeRight|boardComment",
  favorites: "fr.cgi.magneto.controller.FakeRight|boardFavorites",
  publicBoard: "fr.cgi.magneto.controller.FakeRight|boardPublic",
  synchronous: "fr.cgi.magneto.controller.FakeRight|boardSynchronous",
};

export const workflowName = {
  view: "view",
  manage: "manage",
  publish: "publish",
  comment: "comment",
  favorites: "favorites",
  public: "public",
  synchronous: "synchronous",
};

export const rights = {
  read: {
    right: "fr-cgi-magneto-controller-ShareBoardController|initReadRight",
  },
  publish: {
    right: "fr-cgi-magneto-controller-ShareBoardController|initPublishRight",
  },
  contrib: {
    right: "fr-cgi-magneto-controller-ShareBoardController|initContribRight",
  },
  manager: {
    right: "fr-cgi-magneto-controller-ShareBoardController|initManagerRight",
  },
};

export const workflows = {
  view: "fr.cgi.magneto.controller.MagnetoController|view",
  manage: "fr.cgi.magneto.controller.FakeRight|boardManage",
  publish: "fr.cgi.magneto.controller.FakeRight|boardPublish",
  comment: "fr.cgi.magneto.controller.FakeRight|boardComment",
  favorites: "fr.cgi.magneto.controller.FakeRight|boardFavorites",
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

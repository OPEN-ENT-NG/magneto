export const workflows = {
  view: "fr.cgi.todoapp.controllers.TodoappController|view",
  list: "fr.cgi.todoapp.controllers.TodoappController|list",
  create: "fr.cgi.todoapp.controllers.TodoappController|create",
  publish: "fr.cgi.todoapp.controllers.TodoappController|publish",
};

export const rights = {
  read: {
    right: "fr-cgi-todoapp-controllers-TodoappController|retrieve",
  },
  contrib: {
    right: "fr-cgi-todoapp-controllers-TodoappController|update",
  },
  manage: {
    right: "fr-cgi-todoapp-controllers-TodoappController|delete",
  },
};

package fr.cgi.magneto.core.constants;

public class Rights {
    public static final String VIEW = "magneto.view";

    /**
     * Right :
     *  - create boards
     *  - share boards
     */
    public static final String MANAGE_BOARD = "magneto.board.manage";

    /**
     * Right :
     * - publish boards
     */
    public static final String PUBLISH_BOARD = "magneto.board.publish";

    /**
     * Right :
     * - add/remove ability to comment a board
     */
    public static final String COMMENT_BOARD = "magneto.board.comment";

    /**
     * Right :
     * - add/remove ability to display number of favorites from cards of a board
     */

    public static final String DISPLAY_NB_FAVORITES = "magneto.board.favorites";

    /** === SHARING RIGHTS === */

    public static final String MANAGER = "magneto.manager";
    public static final String READ = "magneto.read";

    // Reutilization right
    public static final String CONTRIB = "magneto.contrib";

    // Write
    public static final String PUBLISH = "magneto.publish";


    public static final String SHAREBOARDCONTROLLER_INITREADRIGHT = "fr-cgi-magneto-controller-ShareBoardController|initReadRight";
    // Reutilization right
    public static final String SHAREBOARDCONTROLLER_INITCONTRIBRIGHT = "fr-cgi-magneto-controller-ShareBoardController|initContribRight";
    public static final String SHAREBOARDCONTROLLER_INITMANAGERRIGHT = "fr-cgi-magneto-controller-ShareBoardController|initManagerRight";
    // Write
    public static final String SHAREBOARDCONTROLLER_INITPUBLISHRIGHT = "fr-cgi-magneto-controller-ShareBoardController|initPublishRight";


    //WORKSPACE SHARING RIGHTS
    public static final String WORKSPACECONTROLLER_GETDOCUMENT = "org-entcore-workspace-controllers-WorkspaceController|getDocument";
    public static final String WORKSPACECONTROLLER_COPYDOCUMENTS = "org-entcore-workspace-controllers-WorkspaceController|copyDocuments";
    public static final String WORKSPACECONTROLLER_GETDOCUMENTPROPERTIES = "org-entcore-workspace-controllers-WorkspaceController|getDocumentProperties";
    public static final String WORKSPACECONTROLLER_GETREVISION = "org-entcore-workspace-controllers-WorkspaceController|getRevision";
    public static final String WORKSPACECONTROLLER_COPYFOLDER = "org-entcore-workspace-controllers-WorkspaceController|copyFolder";
    public static final String WORKSPACECONTROLLER_GETPREVIEW = "org-entcore-workspace-controllers-WorkspaceController|getPreview";
    public static final String WORKSPACECONTROLLER_COPYDOCUMENT = "org-entcore-workspace-controllers-WorkspaceController|copyDocument";
    public static final String WORKSPACECONTROLLER_GETDOCUMENTBASE64 = "org-entcore-workspace-controllers-WorkspaceController|getDocumentBase64";
    public static final String WORKSPACECONTROLLER_LISTREVISIONS = "org-entcore-workspace-controllers-WorkspaceController|listRevisions";
    public static final String WORKSPACECONTROLLER_UPDATEDOCUMENT = "org-entcore-workspace-controllers-WorkspaceController|updateDocument";

}

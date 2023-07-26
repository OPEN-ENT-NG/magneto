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

    // Write right
    public static final String CONTRIB = "magneto.contrib";

    // Reutilization right
    public static final String PUBLISH = "magneto.publish";


    public static final String SHAREBOARDCONTROLLER_INITREADRIGHT = "fr-cgi-magneto-controller-ShareBoardController|initReadRight";
}

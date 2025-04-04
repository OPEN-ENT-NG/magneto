package fr.cgi.magneto.core.enums;
public enum EventBusActions {

    GETDOCUMENT("getDocument"),
    CHANGEVISIBILITY("changeVisibility");

    private final String action;

    EventBusActions(String action) {
        this.action = action;
    }

    public String action() {
        return this.action;
    }

    public static enum EventBusAddresses {

        WORKSPACE_BUS_ADDRESS("org.entcore.workspace");

        private final String address;

        EventBusAddresses(String address) {
            this.address = address;
        }

        public String address() {
            return this.address;
        }
    }

}
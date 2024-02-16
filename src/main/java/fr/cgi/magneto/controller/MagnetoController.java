package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;


import static fr.cgi.magneto.core.enums.Events.ACCESS;

public class MagnetoController extends ControllerHelper {

    private final EventStore eventStore;
    private final MagnetoConfig magnetoConfig;

    public MagnetoController(ServiceFactory serviceFactory) {
        this.magnetoConfig = serviceFactory.magnetoConfig();
        this.eventStore = EventStoreFactory.getFactory().getEventStore(Magneto.class.getSimpleName());
    }

    @Get("/config")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SuperAdminFilter.class)
    public void getConfig(final HttpServerRequest request) {
        renderJson(request, config);
    }

    @Get("")
    @ApiDoc("Render view")
    @SecuredAction(Rights.VIEW)
    public void view(HttpServerRequest request) {
        String websocketEndpoint = Field.DEV.equals(this.magnetoConfig.mode()) ?
                String.format(":%s%s", this.magnetoConfig.websocketConfig().port(), this.magnetoConfig.websocketConfig().endpointProxy()) :
                this.magnetoConfig.websocketConfig().endpointProxy();

        Integer updateFrequency = this.magnetoConfig.magnetoUpdateFrequency();
        Boolean isStandalone = this.magnetoConfig.getMagnetoStandalone();
        JsonObject param = new JsonObject()
                .put(Field.WEBSOCKETENDPOINT, websocketEndpoint)
                .put(Field.MAGNETO_UPDATE_FREQUENCY, updateFrequency)
                .put(Field.MAGNETO_STANDALONE, isStandalone);
        renderView(request, param);
        eventStore.createAndStoreEvent(ACCESS.name(), request);
    }
}

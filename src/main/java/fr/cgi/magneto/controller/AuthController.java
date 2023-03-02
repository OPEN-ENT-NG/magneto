package fr.cgi.magneto.controller;

import fr.cgi.magneto.config.*;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.*;
import io.vertx.core.*;
import io.vertx.core.buffer.*;
import io.vertx.core.http.*;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.*;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;

import java.net.*;
import java.nio.charset.*;
import java.util.*;

public class AuthController extends ControllerHelper {

    private final WebClient client;
    private final MagnetoConfig magnetoConfig;

    public AuthController(ServiceFactory serviceFactory) {
        this.client = serviceFactory.webClient();
        this.magnetoConfig = serviceFactory.magnetoConfig();
    }

    @Get("/clipper/redirect")
    @ApiDoc("Fetch auth tokens for the clipper extension and do redirect")
    public void authAndRedirect(HttpServerRequest request) {
//        try {
//            String extensionUrl = request.getParam(Field.EXTENSION_URL);
//            String code = request.getParam(Field.CODE);
//            String basicToken = request.getParam(Field.BASIC_TOKEN);
//
//            MultiMap body = MultiMap.caseInsensitiveMultiMap();
//            body.set(Field.CODE, code);
//            body.set(Field.GRANT_TYPE, Field.AUTHORIZATION_CODE);
//            body.set(Field.REDIRECT_URI, this.magnetoConfig.host() + "/magneto/clipper/redirect?basic_token=" + basicToken + "&extension_url="
//                    + URLEncoder.encode(extensionUrl, StandardCharsets.UTF_8.toString()));
//
//            this.client.postAbs(this.magnetoConfig.host() + "/auth/oauth2/token?grant_type=authorization_code&code="
//                            + code + "&redirect_uri=" + this.magnetoConfig.host() + "/magneto/clipper/redirect")
//                    .putHeader(Field.AUTHORIZATION, Field.BASIC + " " + basicToken)
//                    .putHeader(Field.CONTENT_TYPE, Field.APPLICATION_FORM)
//                    .putHeader(Field.ACCEPT, String.format("%s; %s", Field.APPLICATION_JSON, Field.CHARSET_UTF8))
//                    .sendForm(body, res -> {
//                        if (res.succeeded()) {
//                            HttpResponse<Buffer> response = res.result();
//                            String accessToken = response.bodyAsJsonObject().getString(Field.ACCESS_TOKEN);
//                            String refreshToken = response.bodyAsJsonObject().getString(Field.REFRESH_TOKEN);
//                            String redirectExtension = extensionUrl + "&access_token=" + accessToken
//                                    + "&refresh_token=" + refreshToken;
//                            request.response().setStatusCode(302);
//                            request.response().putHeader(Field.LOCATION, redirectExtension);
//                            request.response().end();
//                        } else {
//                            log.error(String.format("[Magneto@%s::authAndRedirect] Failed to get access token : %s",
//                                    this.getClass().getSimpleName(), res.cause().getMessage()));
//                            renderError(request);
//                        }
//                    });
//        } catch (Exception e) {
//            log.error(String.format("[Magneto@%s::authAndRedirect] Failed to get access token : %s",
//                    this.getClass().getSimpleName(), e.getMessage()));
//            renderError(request);
//        }
        MultiMap body = MultiMap.caseInsensitiveMultiMap();
        body.set("code", "a6b2197b-d85f-43d9-81e8-cfcebe3cb852");
        body.set("grant_type", "authorization_code");
        body.set("redirect_uri", "https://ng2.support-ent.fr/magneto/clipper/redirect?basic_token=bWFnbmV0by1jbGlwcGVyOm1hZ25ldG8tY2xpcHBlci1zZWNyZXQ=&extension_url=moz-extension%3A%2F%2F3f4790b8-f6cd-4bc7-8548-830ca3144a40%2Ftool.html%23%2Fauth%3Ftype%3Dopen_ent");
        this.client.postAbs("http://localhost:8009/auth/oauth2/token")
                .putHeader("Authorization", "Basic bWFnbmV0by1jbGlwcGVyOm1hZ25ldG8tY2xpcHBlci1zZWNyZXQ=")
                .sendForm(body, res -> {
                    if (res.succeeded()) {
                        renderJson(request, new JsonObject().put("res", new JsonObject(res.result().body().toString())));
                    } else {
                        log.error(String.format("[Magneto@%s::authAndRedirect] Failed to get access token : %s",
                                this.getClass().getSimpleName(), res.cause().getMessage()));
                        renderError(request);
                    }
                });
    }

}

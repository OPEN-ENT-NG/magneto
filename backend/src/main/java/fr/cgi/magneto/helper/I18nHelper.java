package fr.cgi.magneto.helper;

import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.http.HttpServerRequest;

public class I18nHelper {
    private String host;
    private String lang;

    public I18nHelper(String host, String lang) {
        this.host = host;
        this.lang = lang;
    }

    public String translate(String i18nKey) {
        return I18n.getInstance().translate(i18nKey, host, lang);
    }
}
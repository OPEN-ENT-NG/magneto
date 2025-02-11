package fr.cgi.magneto.service;

import fr.cgi.magneto.model.slide.SlideResource;
import io.vertx.core.Future;
import java.util.List;

public interface SlideMappingService {
    Future<List<SlideResource>> generateSlideMapping(String boardId);
}
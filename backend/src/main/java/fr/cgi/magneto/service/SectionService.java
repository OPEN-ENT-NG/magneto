package fr.cgi.magneto.service;

import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface SectionService {

    /**
     * Get all sections from board id
     *
     * @param sectionId Identifiers of the section
     * @return Future {@link Future <JsonObject>} containing list of sections
     */
    Future<List<Section>> get(List<String> sectionId);

    /**
     * Get all sections from board id
     *
     * @param boardId Identifier of the board
     * @return Future {@link Future <JsonObject>} containing list of sections
     */
    Future<List<Section>> getSectionsByBoardId(String boardId);

    Future<List<Section>> createSectionWithCards(Board board, UserInfos user);

    /**
     * @param board      board of the sections
     * @param isReadOnly
     * @return
     */
    Future<List<Section>> getSectionsByBoard(Board board, boolean isReadOnly);

    /**
     * Create a section
     *
     * @param section Section to create
     * @param newId   Identifier of the new section
     * @return Future {@link Future <JsonObject>} containing newly created section
     */
    Future<JsonObject> create(SectionPayload section, String newId);

    /**
     * Update a section
     *
     * @param section Section to update
     * @return Future {@link Future <JsonObject>} containing updated section
     */
    Future<JsonObject> update(SectionPayload section);

    /**
     * Delete section
     *
     * @param sectionIds Section identifiers
     * @return Future {@link Future <JsonObject>} containing deleted sections
     */
    Future<JsonObject> delete(List<String> sectionIds);

    /**
     * Delete section
     *
     * @param sectionIds Section identifiers
     * @param boardId Board Identifier
     * @param deleteCards Boolean Is card need to be deleted or no
     * @return Future {@link Future <JsonObject>} containing deleted sections
     */

    Future<JsonObject> deleteSections(List<String> sectionIds, String boardId, Boolean deleteCards);

    /**
     * Duplicate cards
     *
     * @param boardId  Board identifier
     * @param sections List of section to duplicate
     * @param cards List of cards to duplicate
     * @param isDuplicateBoard Boolean to know if we duplicate board or no
     * @param user     {@link UserInfos} User info
     * @return Future {@link Future <JsonObject>} containing status of duplicate
     */
    Future<JsonObject> duplicateSections(String boardId, List<Section> sections, List<Card> cards, boolean isDuplicateBoard, UserInfos user);

    /**
     * Delete all section by board
     *
     * @param boardIds Board identifiers
     * @return Future {@link Future <JsonObject>} containing deleted sections
     */
    Future<JsonObject> deleteByBoards(List<String> boardIds);
}

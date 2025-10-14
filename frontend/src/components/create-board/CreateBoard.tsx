import React, { FC, useEffect, useState } from "react";

import {
  Radio,
  RadioGroup,
  FormControl as FormControlMUI,
  Box,
  Typography,
  FormLabel,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  TextField,
} from "@cgi-learning-hub/ui";
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  Input,
  Label,
  Modal,
  TextArea,
  useEdificeClient,
} from "@edifice.io/react";
import { MediaLibrary } from "@edifice.io/react/multimedia";
import {
  ViewModule,
  ViewColumn,
  ViewStream,
  MoveUpOutlined,
  MoveDownOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import {
  iconButtonEndStyle,
  iconButtonStyle,
  optionsBoxStyle,
  organisationBoxStyle,
  paddingBottomTwoRemStyle,
  radioIconStyle,
  radioLabelStyle,
  selectFieldStyle,
  styles,
  subsubtitleStyle,
  subtitleStyle,
  paddingLeftHalfRemStyle,
  paddingBottomOneRemStyle,
  radioGroupStyle,
  radioStyle,
  positionModeContainerStyle,
  positionModeBoxStyle,
  positionOptionsContainerStyle,
  positionOptionBoxStyle,
  newCardLabelStyle,
  toggleButtonGroupStyle,
  toggleButtonStyle,
  selectLabelStyle,
  selectMenuItemStyle,
  subtitleWithSpaceStyle,
} from "./style";
import { CreateBoardProps } from "./types";
import { MediaProps } from "../board-view/types";
import { UniqueImagePicker } from "../unique-image-picker/UniqueImagePicker";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import {
  NEW_CARD_POSITION,
  POSITION_MODE,
  SORT_ORDER,
  SORT_ORDER_OPTIONS,
} from "~/core/enums/sort-order";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { useImageHandler } from "~/hooks/useImageHandler";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { BoardForm } from "~/models/board.model";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import {
  useCreateBoardMutation,
  useUpdateBoardMutation,
} from "~/services/api/boards.service";

export const CreateBoard: FC<CreateBoardProps> = ({
  isOpen,
  toggle,
  boardToUpdate,
  reset,
  parentFolderId,
}) => {
  const { t } = useTranslation("magneto");
  const { appCode } = useEdificeClient();

  const [media, setMedia] = useState<MediaProps | null>(null);
  const [activePickerId, setActivePickerId] = useState<string>("");
  const [isCommentChecked, setIsCommentChecked] = useState(false);
  const [isFavoriteChecked, setIsFavoriteChecked] = useState(false);
  const [isLockedChecked, setIsLockedChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [disposition, setDisposition] = useState("free");
  const [tagsTextInput, setTagsTextInput] = useState("");
  const [tags, setTags] = useState([""]);
  const [createBoard] = useCreateBoardMutation();
  const [updateBoard] = useUpdateBoardMutation();
  const { sendMessage, readyState } = useWebSocketMagneto();
  const [positionMode, setPositionMode] = useState<POSITION_MODE>(
    POSITION_MODE.FREE,
  );
  const [newCardPosition, setNewCardPosition] = useState<NEW_CARD_POSITION>(
    NEW_CARD_POSITION.START,
  );
  const [sortOrder, setSortOrder] = useState(SORT_ORDER.ALPHABETICAL);
  const { width } = useWindowDimensions();
  const {
    thumbnail,
    background,
    handleUploadImage,
    handleDeleteThumbnail,
    handleDeleteBackground,
    mediaLibraryRef,
    mediaLibraryHandlers,
    setThumbnail,
    setBackground,
    libraryMedia,
  } = useImageHandler(
    boardToUpdate?.imageUrl ?? "",
    boardToUpdate?.backgroundUrl ?? "",
    activePickerId,
    media,
    setMedia,
  );

  const setBoardFromForm = async (board: BoardForm) => {
    board.title = title;
    board.description = description;
    board.folderId = parentFolderId ?? "";
    board.imageUrl = thumbnail?.url ?? "";
    board.backgroundUrl = background?.url ?? "";
    board.public = boardToUpdate?.isPublished ?? false;
    board.isExternal = boardToUpdate?.isExternal ?? false;

    if (disposition == "vertical") board.layoutType = LAYOUT_TYPE.VERTICAL;
    else if (disposition == "horizontal")
      board.layoutType = LAYOUT_TYPE.HORIZONTAL;
    else board.layoutType = LAYOUT_TYPE.FREE;
    board.canComment = isCommentChecked;
    board.isLocked = isLockedChecked;
    board.displayNbFavorites = isFavoriteChecked;
    board.tags = tags;
  };

  const resetFields = (): void => {
    if (boardToUpdate === null) {
      setActivePickerId("");
      setIsCommentChecked(false);
      setIsFavoriteChecked(false);
      setIsLockedChecked(false);
      setTitle("");
      setDescription("");
      setDisposition("free");
      setTagsTextInput("");
      setMedia(null);
    }
    handleDeleteThumbnail();
    handleDeleteBackground();
    toggle();
  };

  const onSubmit = async (): Promise<void> => {
    const board = new BoardForm();
    await setBoardFromForm(board);

    if (boardToUpdate) {
      board.id = boardToUpdate.id;
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.BOARD_UPDATED,
            board: board.toJSON(),
          }),
        );
      } else {
        updateBoard(board.toJSON());
      }
      if (reset != null) reset();
      return resetFields();
    }
    if (parentFolderId) {
      createBoard(board.toJSON());
      return resetFields();
    }
  };

  const updateKeywords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue: string = event.target.value;

    if (inputValue.length > 0 && inputValue[inputValue.length - 1] === ",") {
      setTagsTextInput(inputValue.replace(",", ""));
      return;
    }

    if (inputValue.length > 0 && inputValue[inputValue.length - 1] === " ") {
      let inputArray: string[] = inputValue.split(" ");

      inputArray = inputArray.map((keyword) => {
        if (keyword === "") {
          return "";
        } else if (keyword[0] === "#") {
          return keyword;
        } else {
          return "#" + keyword;
        }
      });

      setTagsTextInput(inputArray.join(" "));
    }

    const updatedTags: string[] = inputValue
      .split(" ")
      .filter((keyword) => keyword !== "")
      .map((keyword) =>
        keyword[0] === "#"
          ? keyword.substring(1).toLowerCase()
          : keyword.toLowerCase(),
      );

    setTags(updatedTags);
  };

  useEffect(() => {
    if (boardToUpdate != null) {
      setIsCommentChecked(boardToUpdate.canComment);
      setIsFavoriteChecked(boardToUpdate.displayNbFavorites);
      setTitle(boardToUpdate.title);
      setDescription(boardToUpdate.description);
      setDisposition(boardToUpdate.layoutType);
      setTagsTextInput(boardToUpdate.tagsTextInput);
      setIsLockedChecked(boardToUpdate.isLocked);
      setTags(boardToUpdate.tags);
      if (boardToUpdate.imageUrl) {
        setThumbnail({
          type: MEDIA_LIBRARY_TYPE.IMAGE,
          id: boardToUpdate.imageUrl.split("/").pop() || "",
          name: "",
          application: "",
          url: boardToUpdate.imageUrl,
        });
      }
      if (boardToUpdate.backgroundUrl) {
        setBackground({
          type: MEDIA_LIBRARY_TYPE.IMAGE,
          id: boardToUpdate.backgroundUrl.split("/").pop() || "",
          name: "",
          application: "",
          url: boardToUpdate.backgroundUrl,
        });
      }
    }
  }, [boardToUpdate, isOpen]);

  return (
    <>
      {isOpen && (
        <Modal
          id={"create"}
          isOpen={isOpen}
          onModalClose={resetFields}
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={resetFields}>
            {boardToUpdate != null ? (
              <h4>{t("magneto.board.properties")}</h4>
            ) : (
              <h4>{t("magneto.create.board")}</h4>
            )}
          </Modal.Header>
          <Modal.Body>
            <Grid>
              <Grid.Col
                lg={width < 1280 ? "2" : "3"}
                md="2"
                sm="4"
                style={styles.gridCol}
              >
                <UniqueImagePicker
                  addButtonLabel="Add image"
                  deleteButtonLabel="Delete image"
                  id="thumbnail"
                  onUploadImage={(id: string) => {
                    setMedia(null);
                    setActivePickerId(id);
                    handleUploadImage();
                  }}
                  onDeleteImage={() => {
                    handleDeleteThumbnail();
                  }}
                  src={thumbnail?.url}
                  libraryMedia={libraryMedia}
                  mediaLibraryRef={mediaLibraryRef}
                />
                {thumbnail === null && (
                  <div style={styles.errorText}>
                    {t("magneto.board.manage.ask.image")}
                  </div>
                )}
              </Grid.Col>
              <Grid.Col
                lg={width < 1280 ? "6" : "9"}
                md="6"
                sm="4"
                style={styles.gridCol}
              >
                <div>
                  <div>
                    <FormControl
                      id="title"
                      style={styles.formControlSpacingSmall}
                    >
                      <Label>{t("magneto.create.board.title")} * :</Label>
                      <Input
                        value={title}
                        placeholder=""
                        size="md"
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </FormControl>
                    <FormControl
                      id="description"
                      style={styles.formControlSpacingLarge}
                    >
                      <Label>{t("magneto.create.board.description")} :</Label>
                      <TextArea
                        style={styles.textArea}
                        size="md"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormControl>
                  </div>
                  <Box sx={organisationBoxStyle}>
                    <Typography sx={subtitleStyle}>
                      {t("magneto.create.board.organisation")}
                    </Typography>
                  </Box>
                  <Box sx={paddingLeftHalfRemStyle}>
                    <FormControlMUI fullWidth sx={paddingBottomOneRemStyle}>
                      <FormLabel
                        id="row-radio-buttons-group"
                        sx={subsubtitleStyle}
                      >
                        {t("magneto.board.layout.choose")}
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="row-radio-buttons-group"
                        defaultValue={"free"}
                        value={disposition}
                        onChange={(e) => setDisposition(e.target.value)}
                        sx={radioGroupStyle}
                      >
                        <FormControlLabel
                          value="free"
                          control={<Radio sx={radioStyle} />}
                          label={
                            <Box sx={radioLabelStyle}>
                              {t("magneto.board.layout.grid")}
                              <ViewModule sx={radioIconStyle} />
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="vertical"
                          control={<Radio sx={radioStyle} />}
                          label={
                            <Box sx={radioLabelStyle}>
                              {t("magneto.board.layout.vertical")}
                              <ViewColumn sx={radioIconStyle} />
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="horizontal"
                          control={<Radio sx={radioStyle} />}
                          label={
                            <Box sx={radioLabelStyle}>
                              {t("magneto.board.layout.horizontal")}
                              <ViewStream sx={radioIconStyle} />
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControlMUI>

                    <FormControlMUI fullWidth sx={paddingBottomOneRemStyle}>
                      <FormLabel
                        id="position-mode-radio-buttons-group"
                        sx={subsubtitleStyle}
                      >
                        {t("magneto.board.positionning.choose")}
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="position-mode-radio-buttons-group"
                        value={positionMode}
                        onChange={(e) => {
                          setPositionMode(e.target.value as POSITION_MODE);
                        }}
                        sx={positionModeContainerStyle}
                      >
                        <Box sx={positionModeBoxStyle}>
                          <FormControlLabel
                            value={POSITION_MODE.FREE}
                            control={<Radio sx={radioStyle} />}
                            label={
                              <Box sx={radioLabelStyle}>
                                {t("magneto.board.positionning.free")}
                              </Box>
                            }
                          />
                        </Box>
                        <Box sx={positionModeBoxStyle}>
                          <FormControlLabel
                            value={POSITION_MODE.ORDERED}
                            control={<Radio sx={radioStyle} />}
                            label={
                              <Box sx={radioLabelStyle}>
                                {t("magneto.board.positionning.ordered")}
                              </Box>
                            }
                          />
                        </Box>
                      </RadioGroup>

                      <Box sx={positionOptionsContainerStyle}>
                        {/* Position libre - ToggleButtonGroup */}
                        <Box sx={positionOptionBoxStyle}>
                          <Typography variant="body2" sx={newCardLabelStyle}>
                            {t("magneto.board.new.cards.appear")}
                          </Typography>
                          <ToggleButtonGroup
                            value={newCardPosition}
                            exclusive
                            onChange={(_e, value) => {
                              if (value !== null) setNewCardPosition(value);
                            }}
                            disabled={positionMode === POSITION_MODE.ORDERED}
                            size="medium"
                            sx={toggleButtonGroupStyle}
                          >
                            <ToggleButton
                              value={NEW_CARD_POSITION.START}
                              sx={toggleButtonStyle}
                            >
                              <MoveUpOutlined sx={iconButtonStyle} />
                              {t("magneto.board.new.cards.start")}
                            </ToggleButton>
                            <ToggleButton
                              value={NEW_CARD_POSITION.END}
                              sx={toggleButtonStyle}
                            >
                              <MoveDownOutlined sx={iconButtonEndStyle} />
                              {t("magneto.board.new.cards.end")}
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>

                        {/* Ordre imposé - Select */}
                        <Box sx={positionOptionBoxStyle}>
                          <TextField
                            select
                            label={t("magneto.board.sort.by")}
                            value={sortOrder}
                            onChange={(e) =>
                              setSortOrder(e.target.value as SORT_ORDER)
                            }
                            disabled={positionMode === POSITION_MODE.FREE}
                            size="medium"
                            sx={selectFieldStyle}
                            InputLabelProps={{
                              sx: selectLabelStyle,
                            }}
                            SelectProps={{
                              MenuProps: {
                                container: document.getElementById("create"),
                                disablePortal: true,
                                PaperProps: {
                                  sx: selectMenuItemStyle,
                                },
                              },
                            }}
                          >
                            {SORT_ORDER_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Box>
                    </FormControlMUI>
                  </Box>
                  <Box sx={paddingBottomTwoRemStyle}>
                    <Checkbox
                      checked={isLockedChecked}
                      label={t("magneto.board.lock.position")}
                      onChange={() => setIsLockedChecked((prev) => !prev)}
                    />
                  </Box>
                  <Box sx={optionsBoxStyle}>
                    <Typography sx={subtitleWithSpaceStyle}>
                      {t("magneto.create.board.options")}
                    </Typography>
                    <Checkbox
                      checked={isFavoriteChecked}
                      label={t("magneto.board.show.favorites")}
                      onChange={() =>
                        setIsFavoriteChecked(
                          (isFavoriteChecked) => !isFavoriteChecked,
                        )
                      }
                    />
                    <Checkbox
                      checked={isLockedChecked}
                      label={t("magneto.board.lock.position")}
                      onChange={() => setIsLockedChecked((prev) => !prev)}
                    />
                  </Box>
                  <Box style={styles.formControlSpacingMedium}>
                    <FormControl id="keywords">
                      <Label>{t("magneto.board.keywords")} :</Label>
                      <Input
                        placeholder=""
                        size="md"
                        type="text"
                        value={tagsTextInput}
                        onChange={(e) => {
                          setTagsTextInput(e.target.value);
                          updateKeywords(e);
                        }}
                      />
                    </FormControl>
                  </Box>
                  <div>
                    <div style={styles.formControlSpacingSmall}>
                      {t("magneto.board.background.title")}
                    </div>
                    <UniqueImagePicker
                      id="background"
                      addButtonLabel="Add image"
                      deleteButtonLabel="Delete image"
                      onUploadImage={(id: string) => {
                        setMedia(null);
                        setActivePickerId(id);
                        handleUploadImage();
                      }}
                      onDeleteImage={() => {
                        handleDeleteBackground();
                      }}
                      src={background?.url}
                      libraryMedia={libraryMedia}
                      mediaLibraryRef={mediaLibraryRef}
                    />
                    <i style={styles.infoText}>
                      {t("magneto.board.background.warning")}
                    </i>
                  </div>
                </div>
              </Grid.Col>
            </Grid>
          </Modal.Body>
          <Modal.Footer>
            <div style={styles.footerButtonContainer}>
              <Button
                color="tertiary"
                type="button"
                variant="ghost"
                style={styles.footerButton}
                onClick={resetFields}
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="filled"
                style={styles.footerButton}
                onClick={onSubmit}
                disabled={!thumbnail || title === ""}
              >
                {boardToUpdate ? t("magneto.save") : t("magneto.create")}
              </Button>
            </div>
          </Modal.Footer>

          <Box id="media-library-magneto">
            <MediaLibrary
              appCode={appCode}
              ref={mediaLibraryRef}
              multiple={false}
              visibility={boardToUpdate?.isExternal ? "public" : "protected"}
              {...mediaLibraryHandlers}
            />
          </Box>
        </Modal>
      )}
    </>
  );
};

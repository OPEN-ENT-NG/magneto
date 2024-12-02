import React, { FC, useEffect, useState } from "react";

// eslint-disable-next-line import/order
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  Input,
  Label,
  MediaLibrary,
  Modal,
  Radio,
  TextArea,
  useOdeClient,
} from "@edifice-ui/react";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import ViewQuiltOutlinedIcon from "@mui/icons-material/ViewQuiltOutlined";
import ViewStreamOutlinedIcon from "@mui/icons-material/ViewStreamOutlined";
import { useTranslation } from "react-i18next";

import { styles } from "./style";
import { CreateBoardProps } from "./types";
import { MediaProps } from "../board-view/types";
import { UniqueImagePicker } from "../unique-image-picker/UniqueImagePicker";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { useImageHandler } from "~/hooks/useImageHandler";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { BoardForm } from "~/models/board.model";
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
  const { appCode } = useOdeClient();

  const [media, setMedia] = useState<MediaProps | null>(null);
  const [activePickerId, setActivePickerId] = useState<string>("");
  const [isCommentChecked, setIsCommentChecked] = useState(false);
  const [isFavoriteChecked, setIsFavoriteChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [disposition, setDisposition] = useState("free");
  const [tagsTextInput, setTagsTextInput] = useState("");
  const [tags, setTags] = useState([""]);
  const [createBoard] = useCreateBoardMutation();
  const [updateBoard] = useUpdateBoardMutation();
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

    if (disposition == "vertical") board.layoutType = LAYOUT_TYPE.VERTICAL;
    else if (disposition == "horizontal")
      board.layoutType = LAYOUT_TYPE.HORIZONTAL;
    else board.layoutType = LAYOUT_TYPE.FREE;
    board.canComment = isCommentChecked;
    board.displayNbFavorites = isFavoriteChecked;
    board.tags = tags;
  };

  const resetFields = (): void => {
    if (boardToUpdate === null) {
      setActivePickerId("");
      setIsCommentChecked(false);
      setIsFavoriteChecked(false);
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
      updateBoard(board.toJSON());
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
                  <div style={styles.formControlSpacingLarge}>
                    <h5 style={styles.formControlSpacingMedium}>
                      {t("magneto.create.board.options")}
                    </h5>
                    <Checkbox
                      checked={isCommentChecked}
                      label="Permettre aux utilisateurs de commenter les aimants"
                      onChange={() =>
                        setIsCommentChecked(
                          (IsCommentChecked) => !IsCommentChecked,
                        )
                      }
                    />
                    <Checkbox
                      checked={isFavoriteChecked}
                      label="Afficher le nombre de favoris sur les aimants"
                      onChange={() =>
                        setIsFavoriteChecked(
                          (isFavoriteChecked) => !isFavoriteChecked,
                        )
                      }
                    />
                  </div>
                  <div>
                    <h5>Quelle disposition des aimants souhaitez-vous?</h5>
                    <div style={styles.layoutOptionsContainer}>
                      <div style={styles.layoutOption}>
                        <Radio
                          model={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          value="free"
                          checked={disposition == "free"}
                        />
                        <span style={styles.layoutText}>
                          {t("magneto.create.board.display.free")}
                        </span>
                        <ViewQuiltOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                      <div style={styles.layoutOption}>
                        <Radio
                          model={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          value="vertical"
                          checked={disposition == "vertical"}
                        />
                        <span style={styles.layoutText}>
                          {t("magneto.create.board.display.vertical")}
                        </span>
                        <ViewColumnOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                      <div style={styles.layoutOption}>
                        <Radio
                          model={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          value="horizontal"
                          checked={disposition == "horizontal"}
                        />
                        <span style={styles.layoutText}>
                          {t("magneto.create.board.display.horizontal")}
                        </span>
                        <ViewStreamOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                    </div>
                  </div>
                  <div style={styles.formControlSpacingMedium}>
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
                  </div>
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
          <MediaLibrary
            appCode={appCode}
            ref={mediaLibraryRef}
            multiple={false}
            visibility="protected"
            {...mediaLibraryHandlers}
          />
        </Modal>
      )}
    </>
  );
};

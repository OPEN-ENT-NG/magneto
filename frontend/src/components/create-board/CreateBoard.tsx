import React, { FunctionComponent, useEffect, useState } from "react";

// eslint-disable-next-line import/order
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  Input,
  Label,
  Modal,
  Radio,
  TextArea,
} from "@edifice-ui/react";
import "./CreateBoard.scss";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import ViewQuiltOutlinedIcon from "@mui/icons-material/ViewQuiltOutlined";
import ViewStreamOutlinedIcon from "@mui/icons-material/ViewStreamOutlined";
import { useTranslation } from "react-i18next";

import UniqueImagePicker from "../unique-image-picker/UniqueImagePicker";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import useImageHandler from "~/hooks/useImageHandler";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { Board, BoardForm } from "~/models/board.model";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import {
  useCreateBoardMutation,
  useUpdateBoardMutation,
} from "~/services/api/boards.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
  boardToUpdate?: Board;
  reset?: () => void;
};

export interface FormInputs {
  title: string;
  description: string;
  enablePublic: boolean;
  formSlug: string;
}

export const CreateBoard: FunctionComponent<props> = ({
  isOpen,
  toggle,
  boardToUpdate,
  reset,
}: props) => {
  const { t } = useTranslation("magneto");
  const {
    cover: thumbnail,
    handleUploadImage: handleUploadImageThumbnail,
    handleDeleteImage: handleDeleteImageThumbnail,
    fetchUrl: fetchThumbnailUrl,
  } = useImageHandler("");
  const {
    cover: background,
    handleUploadImage: handleUploadImageBackground,
    handleDeleteImage: handleDeleteImageBackground,
    fetchUrl: fetchBackgroundUrl,
  } = useImageHandler("");
  const { currentFolder } = useFoldersNavigation();
  const [isCommentChecked, setIsCommentChecked] = useState(false);
  const [isFavoriteChecked, setIsFavoriteChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [disposition, setDisposition] = useState("free");
  const [tagsTextInput, setTagsTextInput] = useState("");
  const [tags, setTags] = useState([""]);
  const [thumbnailSrc, setThumbnailSrc] = useState("");
  const [backgroundSrc, setBackgroundSrc] = useState("");
  const [createBoard] = useCreateBoardMutation();
  const [updateBoard] = useUpdateBoardMutation();

  const { width } = useWindowDimensions();

  const setBoardFromForm = async (board: BoardForm) => {
    board.title = title;
    board.description = description;
    board.folderId = currentFolder.id;

    if (thumbnailSrc != "" && thumbnail == "") {
      board.imageUrl = thumbnailSrc;
    } else if (thumbnail != "") {
      await fetchThumbnailUrl().then((url) => {
        board.imageUrl = url;
      });
    }

    if (backgroundSrc != "" && background == "") {
      board.backgroundUrl = backgroundSrc;
    } else if (background != "") {
      await fetchBackgroundUrl().then((url) => {
        board.backgroundUrl = url;
      });
    }

    if (disposition == "vertical") board.layoutType = LAYOUT_TYPE.VERTICAL;
    else if (disposition == "horizontal")
      board.layoutType = LAYOUT_TYPE.HORIZONTAL;
    else board.layoutType = LAYOUT_TYPE.FREE;
    board.canComment = isCommentChecked;
    board.displayNbFavorites = isFavoriteChecked;
    board.tags = tags;
  };

  const onSubmit = async (): Promise<void> => {
    const board = new BoardForm();
    await setBoardFromForm(board);

    if (boardToUpdate != null) {
      board.id = boardToUpdate.id;
      updateBoard(board.toJSON());
      if (reset != null) reset();
    } else {
      createBoard(board.toJSON());
    }

    resetFields();
  };

  const resetFields = (): void => {
    if (boardToUpdate == null) {
      handleDeleteImageThumbnail();
      handleDeleteImageBackground();
      setIsCommentChecked(false);
      setIsFavoriteChecked(false);
      setTitle("");
      setDescription("");
      setDisposition("free");
      setTagsTextInput("");
      setThumbnailSrc("");
      setBackgroundSrc("");
    }
    toggle();
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
      setThumbnailSrc(boardToUpdate.imageUrl);
      setBackgroundSrc(boardToUpdate.backgroundUrl);
    }
  }, [boardToUpdate]);

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
                style={{
                  padding: ".8rem",
                }}
              >
                <UniqueImagePicker
                  addButtonLabel="Add image"
                  deleteButtonLabel="Delete image"
                  label="Upload an image"
                  onUploadImage={handleUploadImageThumbnail}
                  onDeleteImage={handleDeleteImageThumbnail}
                  src={thumbnailSrc}
                  onImageChange={(file) => {
                    if (file) {
                      handleUploadImageThumbnail(file);
                    } else {
                      handleDeleteImageThumbnail();
                      setThumbnailSrc("");
                    }
                  }}
                />
                {(thumbnail == "" || thumbnail == null) &&
                  thumbnailSrc == "" && (
                    <div className="font-red">
                      {t("magneto.board.manage.ask.image")}
                    </div>
                  )}
              </Grid.Col>
              <Grid.Col
                lg={width < 1280 ? "6" : "9"}
                md="6"
                sm="4"
                style={{
                  padding: ".8rem",
                }}
              >
                <div>
                  <div>
                    <FormControl id="title" className="mb-0-5">
                      <Label>{t("magneto.create.board.title")} * :</Label>
                      <Input
                        value={title}
                        placeholder=""
                        size="md"
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </FormControl>
                    <FormControl id="description" className="mb-1-5">
                      <Label>{t("magneto.create.board.description")} :</Label>
                      <TextArea
                        className="styled-text-area"
                        size="md"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormControl>
                  </div>
                  <div className="mb-1-5">
                    <h5 className="mb-1">
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
                    <div className="d-flex justify-around align-items-center">
                      <div className="d-flex align-items-center text-icon-pair mg-75">
                        <Radio
                          model={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          value="free"
                          checked={disposition == "free"}
                          className="mg-4"
                        />
                        <span className="text">
                          {t("magneto.create.board.display.free")}
                        </span>
                        <ViewQuiltOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                      <div className="d-flex align-items-center text-icon-pair mg-75">
                        <Radio
                          model={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          value="vertical"
                          checked={disposition == "vertical"}
                          className="mg-4"
                        />
                        <span className="text">
                          {t("magneto.create.board.display.vertical")}
                        </span>
                        <ViewColumnOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                      <div className="d-flex align-items-center text-icon-pair">
                        <Radio
                          model={disposition}
                          onChange={(e) => {
                            setDisposition(e.target.value);
                          }}
                          value="horizontal"
                          checked={disposition == "horizontal"}
                          className="mg-4"
                        />
                        <span className="text">
                          {t("magneto.create.board.display.horizontal")}
                        </span>
                        <ViewStreamOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                    </div>
                  </div>
                  <div className="mb-1">
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
                    <div className="mb-0-5">
                      {t("magneto.board.background.title")}
                    </div>
                    <UniqueImagePicker
                      addButtonLabel="Add image"
                      deleteButtonLabel="Delete image"
                      label="Upload an image"
                      onUploadImage={handleUploadImageBackground}
                      onDeleteImage={handleDeleteImageBackground}
                      src={backgroundSrc}
                      onImageChange={(file) => {
                        if (file) {
                          handleUploadImageBackground(file);
                        } else {
                          handleDeleteImageBackground();
                          setBackgroundSrc("");
                        }
                      }}
                    />
                    <i className="font-little">
                      {t("magneto.board.background.warning")}
                    </i>
                  </div>
                </div>
              </Grid.Col>
            </Grid>
          </Modal.Body>
          <Modal.Footer>
            <div className="right">
              <Button
                color="tertiary"
                type="button"
                variant="ghost"
                className="footer-button"
                onClick={resetFields}
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="filled"
                className="footer-button"
                onClick={onSubmit}
                disabled={
                  (thumbnailSrc == "" && thumbnail == "") || title == ""
                }
              >
                {boardToUpdate ? t("magneto.save") : t("magneto.create")}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

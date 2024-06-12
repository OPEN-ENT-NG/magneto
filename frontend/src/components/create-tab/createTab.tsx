import React, { FunctionComponent, useState } from "react";

// eslint-disable-next-line
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  ImagePicker,
  Input,
  Label,
  Modal,
  Radio,
  TextArea,
} from "@edifice-ui/react";

import "./createTab.scss";

import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import ViewQuiltOutlinedIcon from "@mui/icons-material/ViewQuiltOutlined";
import ViewStreamOutlinedIcon from "@mui/icons-material/ViewStreamOutlined";

import myImage from "./collaborativeeditor-default.png";
// import { useBackground } from "../../hooks/useBackground";
// import { useThumb } from "../../hooks/useThumb";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { useBackground } from "~/hooks/useBackground";
import { useThumb } from "~/hooks/useThumb";
import { BoardForm } from "~/models/board.model";
import { useCreateBoardMutation } from "~/services/api/boards.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
};

export interface FormInputs {
  title: string;
  description: string;
  enablePublic: boolean;
  formSlug: string;
}

export const CreateTab: FunctionComponent<props> = ({
  isOpen,
  toggle,
}: props) => {
  const { handleDeleteImage, handleUploadImage } = useThumb({
    selectedResource: undefined,
  });
  const [isCommentChecked, setIsCommentChecked] = useState(false);
  const [isFavoriteChecked, setIsFavoriteChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [disposition, setDisposition] = useState("free");
  const [tagsTextInput, setTagsTextInput] = useState("");
  const [tags, setTags] = useState([""]);
  const [createBoard] = useCreateBoardMutation();
  const { handleDeleteBackground, handleUploadBackground } = useBackground({
    selectedResource: undefined,
  });

  const onSubmit = async (): Promise<void> => {
    const board = new BoardForm();
    board.title = title;
    board.description = description;
    //TODO : change this to work with a future workspace file manager

    board.imageUrl = ""; //getUrl(thumbnail as File);
    board.backgroundUrl = ""; //getUrl(background as File);

    if (disposition == "vertical") board.layoutType = LAYOUT_TYPE.VERTICAL;
    else if (disposition == "horizontal")
      board.layoutType = LAYOUT_TYPE.HORIZONTAL;
    else board.layoutType = LAYOUT_TYPE.FREE;
    board.canComment = isCommentChecked;
    board.displayNbFavorites = isFavoriteChecked;
    board.tags = tags;

    createBoard(board.toJSON());

    reset();
  };

  //

  const reset = (): void => {
    handleDeleteImage();
    handleDeleteBackground();
    setIsCommentChecked(false);
    setIsFavoriteChecked(false);
    setTitle("");
    setDescription("");
    setDisposition("free");
    setTagsTextInput("");
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

  return (
    <>
      {isOpen && (
        <Modal
          id={"create"}
          isOpen={isOpen}
          onModalClose={reset}
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={reset}>
            <h4>Créer un tableau</h4>
          </Modal.Header>
          <Modal.Body>
            <Grid>
              <Grid.Col
                sm="3"
                style={{
                  minHeight: "70rem",
                  padding: ".8rem",
                }}
              >
                <ImagePicker
                  addButtonLabel="Add image"
                  deleteButtonLabel="Delete image"
                  label="Upload an image"
                  onDeleteImage={handleDeleteImage}
                  onUploadImage={handleUploadImage}
                  src={myImage}
                />
                <div className="font-red">Veuillez choisir une image *</div>
              </Grid.Col>
              <Grid.Col
                sm="9"
                style={{
                  minHeight: "10rem",
                  padding: ".8rem",
                }}
              >
                <div>
                  <div>
                    <FormControl id="title" className="mb-0-5">
                      <Label>Titre de mon tableau *:</Label>
                      <Input
                        placeholder=""
                        size="md"
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </FormControl>
                    <FormControl id="description" className="mb-1-5">
                      <Label>Description:</Label>
                      <TextArea
                        size="md"
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormControl>
                  </div>
                  <div className="mb-1-5">
                    <h5 className="mb-1">Options du tableau</h5>
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
                    <div className="d-flex gap-16 align-items-center">
                      <div className="d-flex align-items-center">
                        <Radio
                          label="Libre"
                          model={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          value="free"
                          checked={disposition == "free"}
                        />
                        <ViewQuiltOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                      <div className="d-flex align-items-center">
                        <Radio
                          label="Section verticale"
                          model={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          value="vertical"
                          checked={disposition == "vertical"}
                          className=""
                        />
                        <ViewColumnOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                      <div className="d-flex align-items-center">
                        <Radio
                          label="Section horizontale"
                          model={disposition}
                          onChange={(e) => {
                            setDisposition(e.target.value);
                          }}
                          value="horizontal"
                          checked={disposition == "horizontal"}
                        />
                        <ViewStreamOutlinedIcon sx={{ fontSize: 60 }} />
                      </div>
                    </div>
                  </div>
                  <div className="mb-1">
                    <FormControl id="keywords">
                      <Label>Mots-clés :</Label>
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
                      Image d'arrière plan du tableau :
                    </div>
                    <ImagePicker
                      addButtonLabel="Add image"
                      deleteButtonLabel="Delete image"
                      label="Upload an image"
                      onDeleteImage={handleDeleteBackground}
                      onUploadImage={handleUploadBackground}
                      src={myImage}
                    />
                    <i className="font-little">
                      Pour un rendu optimal, nous conseillons de charger une
                      image de minimum 1024x768px, format paysage.
                    </i>
                  </div>
                </div>
              </Grid.Col>
            </Grid>
          </Modal.Body>
          <Modal.Footer>
            <div className="right">
              <Button
                color="primary"
                type="button"
                variant="outline"
                className="footer-button"
                onClick={reset}
              >
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="filled"
                className="footer-button"
                onClick={onSubmit}
              >
                Enregistrer
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

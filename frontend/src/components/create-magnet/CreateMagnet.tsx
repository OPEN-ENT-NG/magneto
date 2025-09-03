import { FC, useEffect, useRef, useState, useCallback } from "react";

import { Button, IconButton } from "@cgi-learning-hub/ui";
import {
  IconButton as EdIconButton,
  Button as EdificeButton,
  FormControl,
  Input,
  Label,
} from "@edifice.io/react";
import { Editor, EditorRef } from "@edifice.io/react/editor";
import { IconEdit } from "@edifice.io/react/icons";
import { MediaLibraryType } from "@edifice.io/react/multimedia";
import { CancelOutlined, CheckCircleOutline } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Typography,
  FormControl as FormControlMUI,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import {
  modalContainerStyle,
  headerStyle,
  titleStyle,
  closeButtonStyle,
  contentContainerStyle,
  editorStyle,
  modalFooterStyle,
  formControlStyle,
  formControlMUIStyle,
  inputLabelStyle,
  selectStyle,
  footerButtonStyle,
  menuItemStyle,
  formControlEditorStyle,
  audioWrapperStyle,
  buttonStyle,
  inputAndButtonBoxStyle,
  buttonBoxStyle,
  dualButtonsStyle,
  dualButtonsSize,
  successColor,
  cancelColor,
  tooltipStyle,
} from "./style";
import { CardPayload } from "./types";
import {
  convertMediaTypeToResourceType,
  convertResourceTypeToMediaType,
} from "./utils";
import { MediaProps } from "../board-view/types";
import { ScaledIframe } from "../card-content-board/CardContentBoard";
import { CardContentFile } from "../card-content-file/CardContentFile";
import { FilePickerWorkspace } from "../file-picker-workspace/FilePickerWorkspace";
import { iconButtonStyle } from "../file-picker-workspace/style";
import { ImageContainer } from "../image-container/ImageContainer";
import { VideoPlayer } from "../video-player/VideoPlayer";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { useHtmlScraper } from "~/hooks/useHtmlScrapper";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import {
  useCreateCardMutation,
  useUpdateCardMutation,
} from "~/services/api/cards.service";
import { workspaceApi } from "~/services/api/workspace.service";

export const CreateMagnet: FC = () => {
  const { scrape } = useHtmlScraper();

  const { sendMessage, readyState } = useWebSocketMagneto();
  const { t } = useTranslation("magneto");
  const { board, documents } = useBoard();
  const dispatchRTK = useDispatch();

  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [initialLinkUrl, setInitialLinkUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [section, setSection] = useState<Section | null>(
    board.sections[0] ?? null,
  );
  const [hasOpenMessageSent, setHasOpenMessageSent] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [canBeIframed, setCanBeIframed] = useState(false);
  const [isLinkInputDisabled, setIsLinkInputDisabled] = useState(true);
  const editorRef = useRef<EditorRef>(null);

  const [createCard] = useCreateCardMutation();
  const [updateCard] = useUpdateCardMutation();

  const {
    media,
    setMedia,
    isCreateMagnetOpen,
    onClose,
    magnetType,
    setMagnetType,
    handleClickMedia,
    selectedBoardData,
    setSelectedBoardData,
  } = useMediaLibrary();

  const { activeCard, closeActiveCardAction } = useBoard();
  const isEditMagnet = !!activeCard;

  // Fonction pour scraper une URL donnée
  const handleScrapeUrl = useCallback(
    async (urlToScrape: string) => {
      if (
        !urlToScrape ||
        !(
          urlToScrape.startsWith("http://") ||
          urlToScrape.startsWith("https://")
        )
      ) {
        return;
      }

      try {
        const content = await scrape(urlToScrape);
        if (content?.cleanHtml) {
          setDescription(content.cleanHtml);
          setCanBeIframed(content.canBeIframed);
        }
      } catch (error) {
        console.error("Erreur lors du scraping:", error);
      }
    },
    [scrape],
  );

  useEffect(() => {
    if (
      isCreateMagnetOpen &&
      isEditMagnet &&
      readyState === WebSocket.OPEN &&
      !hasOpenMessageSent
    ) {
      sendMessage(
        JSON.stringify({
          type: WEBSOCKET_MESSAGE_TYPE.CARD_EDITION_STARTED,
          cardId: activeCard.id,
          isMoving: false,
        }),
      );
      setHasOpenMessageSent(true);
    }
  }, [
    isCreateMagnetOpen,
    isEditMagnet,
    hasOpenMessageSent,
    readyState,
    sendMessage,
  ]);

  useEffect(() => {
    return () => {
      if (isEditMagnet && hasOpenMessageSent && readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.CARD_EDITION_ENDED,
          }),
        );
      }
    };
  }, [isEditMagnet, hasOpenMessageSent, readyState]);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    const sectionTitle = event.target.value;
    const selectedSection = board.sections.find(
      (sectionSelected: Section) => sectionSelected.title === sectionTitle,
    );
    if (selectedSection) {
      setSection(selectedSection);
    }
  };

  const onCloseModalAndDeactivateCard = () => {
    closeActiveCardAction(BOARD_MODAL_TYPE.CREATE_EDIT);
    onCloseModal();
  };

  const onCloseModal = () => {
    setTitle("");
    setCaption("");
    setLinkUrl("");
    setDescription("");
    if (section !== null) setSection(board.sections[0]);
    setSelectedBoardData(null);
    onClose();
  };

  const modifyFile = (type: MediaLibraryType) => {
    handleClickMedia(type);
  };

  const onUpload = async () => {
    const payload: CardPayload = {
      boardId: board._id,
      caption: caption,
      description: editorRef.current?.getContent("html") as string,
      locked: isEditMagnet ? activeCard.locked : false,
      resourceId: media?.id ?? "",
      resourceType: getMagnetResourceType(),
      resourceUrl: selectedBoardData
        ? selectedBoardData.id
        : linkUrl
        ? linkUrl
        : media?.url ?? null,
      title: title,
      id: isEditMagnet ? activeCard.id : undefined,
      canBeIframed: canBeIframed,
      ...(!isEditMagnet && section?._id ? { sectionId: section._id } : {}),
    };
    if (isEditMagnet) {
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.CARD_UPDATED,
            card: payload,
          }),
        );
      } else {
        await updateCard(payload);
      }
    } else {
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.CARD_ADDED,
            card: payload,
          }),
        );
      } else {
        await createCard(payload);
      }
    }
    if (
      payload.resourceType === RESOURCE_TYPE.FILE &&
      documents.find((doc) => doc._id === payload.resourceId) === undefined
    ) {
      dispatchRTK(workspaceApi.util.invalidateTags(["Documents"]));
    }
    onCloseModalAndDeactivateCard();
  };

  const getMagnetResourceType = (): string => {
    if (isEditMagnet) {
      return magnetType ?? activeCard.resourceType;
    } else {
      return magnetType ?? convertMediaTypeToResourceType(media?.type);
    }
  };

  useEffect(() => {
    const handleMediaChange = async () => {
      if (!isEditMagnet && media?.name) {
        if (magnetTypeHasAudio) return setTitle(media.name.split(".")[0]);
        if (magnetTypeHasLink) {
          setLinkUrl(media.url);
          setTitle(media.name.replace(/^(?:https?:\/\/(?:www\.)?|www\.)/, ""));
          // Scraper automatiquement l'URL du media
          await handleScrapeUrl(media.url);
        } else if (!magnetTypeHasVideo)
          setTitle(media.name.split(".").slice(0, -1).join("."));
      }
    };

    handleMediaChange();
  }, [media, isEditMagnet, handleScrapeUrl]);

  useEffect(() => {
    if (!isEditMagnet && selectedBoardData) {
      setTitle(selectedBoardData.title);
      setDescription(selectedBoardData.description);
    }
  }, [selectedBoardData]);

  useEffect(() => {
    if (isEditMagnet) {
      setTitle(activeCard.title);
      setCaption(activeCard.caption);
      setCanBeIframed(activeCard.canBeIframed);
      // init if type link only
      if (activeCard.resourceType === RESOURCE_TYPE.LINK)
        setLinkUrl(activeCard.resourceUrl);
      setDescription(activeCard.description);

      if (activeCard.resourceType === MENU_NOT_MEDIA_TYPE.TEXT)
        setMagnetType(MENU_NOT_MEDIA_TYPE.TEXT);

      if (activeCard.resourceType === MENU_NOT_MEDIA_TYPE.BOARD)
        setMagnetType(MENU_NOT_MEDIA_TYPE.BOARD);

      setMedia({
        name: activeCard.metadata?.name,
        url: activeCard.resourceUrl,
        id: activeCard.resourceId,
        type: convertResourceTypeToMediaType(activeCard.resourceType),
      } as MediaProps);
    }
  }, [activeCard]);

  const magnetTypeHasFilePickerWorkspace =
    media && media.type === MEDIA_LIBRARY_TYPE.ATTACHMENT;

  const magnetTypeHasImage =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.IMAGE;
  const magnetTypeHasAudio =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.AUDIO;
  const magnetTypeHasLink =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.HYPERLINK;
  const magnetTypeHasVideo =
    media && media.url && media.type === MEDIA_LIBRARY_TYPE.VIDEO;
  const magnetTypeHasCaption = magnetType !== "text";

  const handleLinkUrlChange = useCallback(async () => {
    // Scraper seulement si c'est un type link
    if (magnetTypeHasLink) {
      setIsLinkInputDisabled(true);
      await handleScrapeUrl(linkUrl);
    }
  }, [magnetTypeHasLink, handleScrapeUrl, linkUrl]);

  useEffect(() => {
    if (isCreateMagnetOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isCreateMagnetOpen]);

  useEffect(() => {
    if (board.sections) {
      setSection(board.sections[0]);
    }
  }, [board.sections]);

  return (
    <Modal
      open={isCreateMagnetOpen}
      onClose={() => onCloseModalAndDeactivateCard()}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      style={{ zIndex: 1000 }}
    >
      <Box sx={modalContainerStyle}>
        <Box sx={headerStyle}>
          <Typography
            id="modal-title"
            variant="h4"
            component="h2"
            sx={titleStyle}
          >
            {isEditMagnet ? t("magneto.edit.card") : t("magneto.new.card")}
          </Typography>
          <IconButton
            onClick={() => onCloseModalAndDeactivateCard()}
            aria-label="close"
            sx={closeButtonStyle}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Box sx={contentContainerStyle}>
          {magnetTypeHasFilePickerWorkspace &&
            (activeCard ? (
              <CardContentFile card={activeCard} />
            ) : (
              <FilePickerWorkspace
                modifyFile={modifyFile}
                addButtonLabel={"Change file"}
              />
            ))}
          {magnetTypeHasImage && (
            <ImageContainer media={media} handleClickMedia={modifyFile} />
          )}
          {selectedBoardData !== null && (
            <ScaledIframe
              src={`/magneto#/board/${selectedBoardData._id}/view`}
            />
          )}
          {activeCard?.resourceType === RESOURCE_TYPE.BOARD && (
            <ScaledIframe
              src={`/magneto#/board/${activeCard.resourceUrl}/view`}
            />
          )}
          {magnetTypeHasAudio && (
            <Box sx={audioWrapperStyle}>
              <audio controls preload="metadata" src={media.url}>
                <source src={media.url} type={media.type} />
              </audio>
              {!isEditMagnet && (
                <EdIconButton
                  aria-label="IconEdit audio"
                  color="tertiary"
                  icon={<IconEdit />}
                  onClick={() => modifyFile(MEDIA_LIBRARY_TYPE.AUDIO)}
                  type="button"
                  variant="ghost"
                  style={iconButtonStyle}
                />
              )}
            </Box>
          )}
          {magnetTypeHasVideo && <VideoPlayer modifyFile={modifyFile} />}{" "}
          {magnetTypeHasLink && (
            <>
              {canBeIframed && <ScaledIframe src={linkUrl} />}
              <Box sx={inputAndButtonBoxStyle}>
                <FormControl id="url" style={{ flex: 1, marginBottom: 0 }}>
                  <Label>{t("magneto.site.address")}</Label>
                  <Input
                    ref={firstInputRef}
                    value={linkUrl}
                    size="md"
                    type="text"
                    onChange={(e) => setLinkUrl(e.target.value)}
                    disabled={magnetTypeHasLink && isLinkInputDisabled}
                  />
                </FormControl>
                <Box sx={buttonBoxStyle}>
                  {isLinkInputDisabled ? (
                    <Button
                      size="medium"
                      variant="text"
                      sx={buttonStyle}
                      onClick={() => {
                        setInitialLinkUrl(linkUrl);
                        setIsLinkInputDisabled(false);
                      }}
                    >
                      <IconEdit fontSize="large" />
                    </Button>
                  ) : (
                    <>
                      <Tooltip
                        placement="top"
                        title={t("magneto.validate")}
                        componentsProps={tooltipStyle}
                      >
                        <IconButton
                          size="medium"
                          sx={{ ...dualButtonsStyle, ...successColor }}
                          onClick={handleLinkUrlChange}
                        >
                          <CheckCircleOutline sx={dualButtonsSize} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        title={t("magneto.cancel")}
                        componentsProps={tooltipStyle}
                      >
                        <IconButton
                          size="medium"
                          sx={{ ...dualButtonsStyle, ...cancelColor }}
                          onClick={() => {
                            setLinkUrl(initialLinkUrl);
                            setIsLinkInputDisabled(true);
                          }}
                        >
                          <CancelOutlined sx={dualButtonsSize} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            </>
          )}
          <FormControl id="title" style={formControlStyle}>
            <Label>{t("magneto.card.title")}</Label>
            <Input
              ref={magnetTypeHasLink ? null : firstInputRef}
              value={title}
              placeholder={t("magneto.card.title")}
              size="md"
              type="text"
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          {magnetTypeHasCaption && (
            <FormControl id="caption" style={formControlStyle}>
              <Label>{t("magneto.card.caption")}</Label>
              <Input
                value={caption}
                placeholder={t("magneto.card.caption")}
                size="md"
                type="text"
                onChange={(e) => setCaption(e.target.value)}
              />
            </FormControl>
          )}
          <FormControl id="description" style={formControlEditorStyle}>
            <Label>{t("magneto.create.board.description")}</Label>
            <Box sx={editorStyle} id="editor-magneto">
              <Editor
                id="postContent"
                content={description}
                mode="edit"
                ref={editorRef}
              />
            </Box>
          </FormControl>
          {section && !isEditMagnet && (
            <FormControlMUI variant="outlined" sx={formControlMUIStyle}>
              <InputLabel id="input-section" shrink={true} sx={inputLabelStyle}>
                {t("magneto.card.section")}
              </InputLabel>
              <Select
                labelId="select-section"
                id="select-section"
                value={section.title}
                onChange={handleSectionChange}
                label={t("magneto.card.section")}
                notched
                size="medium"
                sx={selectStyle}
              >
                {board.sections.map((s: Section) => (
                  <MenuItem key={s.title} value={s.title}>
                    <Box sx={menuItemStyle}>{s.title}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControlMUI>
          )}
          <Box sx={modalFooterStyle}>
            <EdificeButton
              style={footerButtonStyle}
              color="tertiary"
              type="button"
              variant="ghost"
              onClick={() => onCloseModalAndDeactivateCard()}
            >
              {t("magneto.cancel")}
            </EdificeButton>
            <EdificeButton
              style={footerButtonStyle}
              color="primary"
              type="submit"
              variant="filled"
              onClick={() => onUpload()}
            >
              {t("magneto.save")}
            </EdificeButton>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

import { ReactNode, useState } from "react";

import {
  Alert,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@cgi-learning-hub/ui";
import {
  ID,
  PutShareResponse,
  RightStringified,
  ShareRight,
} from "@edifice.io/client";
import {
  Modal,
  Heading,
  LoadingScreen,
  VisuallyHidden,
  Avatar,
  Checkbox,
  Button,
  Tooltip,
  Combobox,
} from "@edifice.io/react";
import {
  IconBookmark,
  IconInfoCircle,
  IconRafterDown,
} from "@edifice.io/react/icons";
import { UseMutationResult } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { useSearch } from "./hooks/useSearch";
import useShare from "./hooks/useShare";
import { useShareBookmark } from "./hooks/useShareBookmark";
import { ShareBookmark } from "./ShareBookmark";
import { ShareBookmarkLine } from "./ShareBookmarkLine";
import { typographyStyle } from "./style";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder } from "~/models/folder.model";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import "./ShareModal.scss";


export type ShareOptions = {
  resourceId: ID;
  resourceRights: RightStringified[];
  resourceCreatorId: string;
};

export type ShareResourceMutation = UseMutationResult<
  PutShareResponse,
  unknown,
  {
    resourceId: string;
    rights: ShareRight[];
  },
  unknown
>;

interface ShareResourceModalProps {
  /** Handle open/close state */
  isOpen: boolean;
  /**
   * Expect resourceId,
   * new rights array (replace shared array),
   * creatorId
   * of a resource */
  shareOptions: ShareOptions;
  /**
   * Use the `shareResource` props when you need to do Optimistic UI
   * otherwise ShareModal handles everything
   * Must use React Query */
  shareResource?: ShareResourceMutation;
  /**
   * To pass any specific app related component (e.g: Blog)
   */
  children?: ReactNode;
  /**
   * onSuccess callback when a resource is successfully shared
   */
  onSuccess: () => void;
  /**
   * onCancel handler to close ShareModal
   */
  onCancel: () => void;
  appCode: string;
}

export default function ShareResourceModal({
  appCode,
  isOpen,
  shareOptions,
  shareResource,
  children,
  onSuccess,
  onCancel,
}: ShareResourceModalProps) {
  const { resourceId, resourceCreatorId, resourceRights } = shareOptions;

  const [isLoading, setIsLoading] = useState(true);

  const {
    state: { isSharing, shareRights, shareRightActions },
    dispatch: shareDispatch,
    myAvatar,
    currentIsAuthor,
    handleShare,
    toggleRight,
    handleDeleteRow,
  } = useShare({
    appCode,
    resourceId,
    resourceCreatorId,
    resourceRights,
    shareResource,
    setIsLoading,
    onSuccess,
  });

  const {
    state: { searchResults, searchInputValue },
    showSearchAdmlHint,
    showSearchLoading,
    showSearchNoResults,
    getSearchMinLength,
    handleSearchInputChange,
    handleSearchResultsChange,
  } = useSearch({
    appCode,
    resourceId,
    resourceCreatorId,
    shareRights,
    shareDispatch,
  });

  const {
    refBookmark,
    showBookmark,
    handleBookmarkChange,
    toggleBookmark,
    bookmark,
    handleOnSave,
    showBookmarkInput,
    toggleBookmarkInput,
  } = useShareBookmark({ shareRights, shareDispatch });

  const { selectedBoards } = useBoardsNavigation();

  const { selectedFolders, folderData } = useFoldersNavigation();

  const { t } = useTranslation("magneto");
  const rootElement = document.getElementById("root");

  const searchPlaceholder = showSearchAdmlHint()
    ? t("magneto.explorer.search.adml.hint")
    : t("magneto.explorer.modal.share.search.placeholder");

  const parentFolder: Folder =
    appCode === "magneto/board"
      ? folderData.find(
          (folder: Folder) => folder.id === selectedBoards[0].folderId,
        ) ?? new Folder()
      : folderData.find(
          (folder: Folder) => folder.id === selectedFolders[0].parentId,
        ) ?? new Folder();

  const parentFolderIsShared = () => {
    const isMyBoards: boolean =
      parentFolder?.id === FOLDER_TYPE.MY_BOARDS ||
      folderData.some((f: Folder) => f.id === parentFolder?.id);
    const isNotMainPage: boolean =
      parentFolder != null && parentFolder.id !== FOLDER_TYPE.MY_BOARDS;
    const parentFolderIsShared: boolean =
      !!parentFolder && !!parentFolder.rights && parentFolder.rights.length > 1;

    return isMyBoards && isNotMainPage && parentFolderIsShared;
  };
  console.log(rootElement?.getAttribute("data-min-hours"));

  return createPortal(
    <Modal id="share_modal" size="lg" isOpen={isOpen} onModalClose={onCancel}>
      <Modal.Header onModalClose={onCancel}>
        {t("magneto.share.title")}
      </Modal.Header>
      <Modal.Body>
        <Heading headingStyle="h4" level="h3" className="mb-16">
          {t("magneto.explorer.modal.share.usersWithAccess")}
        </Heading>
        <div className="table-responsive">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <table className="table border align-middle mb-0">
              <thead className="bg-secondary">
                <tr>
                  <th scope="col" className="w-32">
                    <VisuallyHidden>
                      {t("magneto.explorer.modal.share.avatar.shared.alt")}
                    </VisuallyHidden>
                  </th>
                  <th scope="col">
                    <VisuallyHidden>
                      {t("magneto.explorer.modal.share.search.placeholder")}
                    </VisuallyHidden>
                  </th>
                  {shareRightActions.map((shareRightAction) => (
                    <th
                      key={shareRightAction.displayName}
                      scope="col"
                      className="text-center text-white"
                    >
                      {t("magneto." + shareRightAction.displayName)}
                    </th>
                  ))}
                  <th scope="col">
                    <VisuallyHidden>{t("magneto.close")}</VisuallyHidden>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentIsAuthor() && (
                  <tr>
                    <th scope="row">
                      <Avatar
                        alt={t("magneto.explorer.modal.share.avatar.me.alt")}
                        size="xs"
                        src={myAvatar}
                        variant="circle"
                      />
                    </th>
                    <td>{t("magneto.share.me")}</td>
                    {shareRightActions.map((shareRightAction) => (
                      <td
                        key={shareRightAction.displayName}
                        style={{ width: "80px" }}
                        className="text-center text-white"
                      >
                        <Checkbox checked={true} disabled />
                      </td>
                    ))}
                    <td></td>
                  </tr>
                )}
                <ShareBookmarkLine
                  showBookmark={showBookmark}
                  shareRightActions={shareRightActions}
                  shareRights={shareRights}
                  onDeleteRow={handleDeleteRow}
                  toggleRight={toggleRight}
                  toggleBookmark={toggleBookmark}
                />
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-16">
          <Button
            color="tertiary"
            leftIcon={<IconBookmark />}
            rightIcon={
              <IconRafterDown
                title={t("magneto.show")}
                className="w-16 min-w-0"
                style={{
                  transition: "rotate 0.2s ease-out",
                  rotate: showBookmarkInput ? "-180deg" : "0deg",
                }}
              />
            }
            type="button"
            variant="ghost"
            className="fw-normal"
            onClick={() => toggleBookmarkInput(!showBookmarkInput)}
          >
            {t("magneto.share.save.sharebookmark")}
          </Button>
          {showBookmarkInput && (
            <ShareBookmark
              refBookmark={refBookmark}
              bookmark={bookmark}
              onBookmarkChange={handleBookmarkChange}
              onSave={handleOnSave}
            />
          )}
        </div>
        <hr />
        <Heading
          headingStyle="h4"
          level="h3"
          className="mb-16 d-flex align-items-center"
        >
          <div className="me-8">{t("magneto.explorer.modal.share.search")}</div>
          <Tooltip
            message={t("magneto.share.heading.tooltip.message")}
            placement="top"
          >
            <IconInfoCircle className="c-pointer" height="18" />
          </Tooltip>
        </Heading>
        <div className="row">
          <div className="col-10">
            <Combobox
              value={searchInputValue}
              placeholder={searchPlaceholder}
              isLoading={showSearchLoading()}
              noResult={showSearchNoResults()}
              options={searchResults}
              searchMinLength={getSearchMinLength()}
              onSearchInputChange={handleSearchInputChange}
              onSearchResultsChange={handleSearchResultsChange}
            />
          </div>
        </div>
        {children}
        <div className="sharePanel-warning">
          {appCode === "magneto/board" &&
            !parentFolderIsShared() &&
            t("magneto.board.share.warning")}
          {appCode === "magneto/folder" &&
            !parentFolderIsShared() &&
            !!selectedFolders[0].rights &&
            selectedFolders[0].rights.length > 1 &&
            t("magneto.folder.share.warning")}
          {parentFolderIsShared() && (
            <div className="red">
              {t("magneto.share.warning", { 0: parentFolder.title })}
            </div>
          )}
        </div>
        {appCode === "magneto/board" && (
          <>
            <hr />
            <Heading headingStyle="h4" level="h3" className="mb-16">
              {t("magneto.explorer.modal.share.usersWithAccess")}
            </Heading>
            <Alert severity="info">
              <Typography sx={typographyStyle}>
                {"magneto.share.public.info"}
              </Typography>
            </Alert>
            <Stack
              direction="row"
              alignItems={"center"}
              spacing={1}
              useFlexGap
              className="mt-16"
            >
              <Switch />
              <Typography sx={typographyStyle}>
                {"magneto.share.public.switch"}
              </Typography>
            </Stack>
            <TextField label="Uncontrolled" defaultValue="foo" />
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          color="tertiary"
          variant="ghost"
          onClick={onCancel}
        >
          {t("magneto.explorer.cancel")}
        </Button>

        <Button
          type="button"
          color="primary"
          variant="filled"
          isLoading={isSharing}
          onClick={handleShare}
          disabled={isSharing}
        >
          {t("magneto.share")}
        </Button>
      </Modal.Footer>
    </Modal>,
    document.getElementById("portal") as HTMLElement,
  );
}

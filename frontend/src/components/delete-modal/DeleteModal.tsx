import React, { FunctionComponent } from "react";

import { t } from "i18next";
// eslint-disable-next-line
import { Button, Modal } from "@edifice-ui/react";

import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import {
  usePreDeleteBoardsMutation,
  useDeleteBoardsMutation,
} from "~/services/api/boards.service";
import {
  usePreDeleteFoldersMutation,
  useDeleteFoldersMutation,
} from "~/services/api/folders.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
  boardIds: string[];
  folderIds: string[];
  isPredelete: boolean;
  reset: () => void;
};

export const DeleteModal: FunctionComponent<props> = ({
  isOpen,
  toggle,
  boardIds,
  folderIds,
  isPredelete,
  reset,
}: props) => {
  const [preDeleteBoards] = usePreDeleteBoardsMutation();
  const [preDeleteFolders] = usePreDeleteFoldersMutation();
  const [deleteBoards] = useDeleteBoardsMutation();
  const [deleteFolders] = useDeleteFoldersMutation();

  const preDeleteBoardsAndToast = usePredefinedToasts({
    func: preDeleteBoards,
    parameter: boardIds,
    successMessage: t("magneto.predelete.elements.confirm"),
    failureMessage: t("magneto.predelete.elements.error"),
  });

  const deleteBoardsAndToast = usePredefinedToasts({
    func: deleteBoards,
    parameter: boardIds,
    successMessage: t("magneto.delete.elements.confirm"),
    failureMessage: t("magneto.delete.elements.error"),
  });

  const preDeleteFoldersAndToast = usePredefinedToasts({
    func: preDeleteFolders,
    parameter: folderIds,
    successMessage: t("magneto.predelete.elements.confirm"),
    failureMessage: t("magneto.predelete.elements.error"),
  });

  const deleteFoldersAndToast = usePredefinedToasts({
    func: deleteFolders,
    parameter: folderIds,
    successMessage: t("magneto.delete.elements.confirm"),
    failureMessage: t("magneto.delete.elements.error"),
  });

  const onSubmit = (): void => {
    if (isPredelete) onSubmitPredelete();
    else onSubmitDelete();
    reset();
    toggle();
  };

  const onSubmitPredelete = async (): Promise<void> => {
    if (boardIds.length > 0) {
      preDeleteBoardsAndToast();
      try {
        if (folderIds.length > 0) {
          await preDeleteFolders(folderIds); //If we're predeleting folders and boards, only send one notification
        }
      } catch (error) {
        console.error(error);
      }
    } else if (folderIds.length > 0) preDeleteFoldersAndToast();
  };

  const onSubmitDelete = async (): Promise<void> => {
    if (boardIds.length > 0) {
      deleteBoardsAndToast();
      try {
        if (folderIds.length > 0) {
          await deleteFolders(folderIds); //If we're predeleting folders and boards, only send one notification
        }
      } catch (error) {
        console.error(error);
      }
    } else if (folderIds.length > 0) deleteFoldersAndToast();
  };

  return (
    <>
      {isOpen && (
        <Modal
          id={"create"}
          isOpen={isOpen}
          onModalClose={toggle}
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={toggle}>
            <h2>{t("magneto.delete.elements")}</h2>
          </Modal.Header>
          <Modal.Body>
            {isPredelete ? (
              <div>{t("magneto.predelete.elements.message")}</div>
            ) : (
              <div>{t("magneto.delete.elements.message")}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="right">
              <Button
                color="primary"
                type="button"
                variant="outline"
                className="footer-button"
                onClick={toggle}
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="filled"
                className="footer-button"
                onClick={onSubmit}
              >
                {t("magneto.save")}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

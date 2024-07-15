import React, { FunctionComponent, useEffect, useId, useState } from "react";

import { Button, FormControl, Input, Label, Modal } from "@edifice-ui/react";
import "./CreateFolder.scss";
import { useTranslation } from "react-i18next";

import { Folder } from "../../models/folder.model";
import {
  useCreateFolderMutation,
  useUpdateFolderMutation,
} from "~/services/api/folders.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
  folderToUpdate?: Folder;
  reset?: () => void;
  toggleDrawer?: () => void;
};

export const CreateFolder: FunctionComponent<props> = ({
  isOpen,
  toggle,
  folderToUpdate,
  reset,
  toggleDrawer,
}: props) => {
  const { t } = useTranslation("magneto");
  const [title, setTitle] = useState("");
  const [parentId] = useState("");
  const [addFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();

  const formId = `createFolder_${useId}`;

  const onSubmit = async (): Promise<void> => {
    try {
      const folder = new Folder();
      folder.title = title;
      folder.parentId = parentId;
      if (folderToUpdate != null) {
        folder.id = folderToUpdate.id;
        await updateFolder(folder);
        if (reset != null) reset();
      } else {
        await addFolder(folder);
      }
      if (toggleDrawer != null) toggleDrawer();
      resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  const resetFields = (): void => {
    setTitle("");
    toggle();
  };

  useEffect(() => {
    if (folderToUpdate != null) {
      setTitle(folderToUpdate.title);
    }
  }, [folderToUpdate]);

  return (
    <>
      {isOpen && (
        <Modal
          id={"createFolder"}
          isOpen={isOpen}
          onModalClose={resetFields}
          viewport={false}
        >
          <Modal.Header onModalClose={resetFields}>
            {t(
              folderToUpdate != null
                ? "magneto.folder.rename"
                : "magneto.create.folder",
            )}
          </Modal.Header>
          <Modal.Body>
            <form id={formId}>
              <FormControl id="title" isRequired>
                <Label>{t("magneto.create.folder.name")}</Label>
                <Input
                  placeholder={t("magneto.create.folder.name")}
                  size="md"
                  type="text"
                  value={title}
                  aria-required={true}
                  maxLength={60}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="tertiary"
              type="button"
              variant="ghost"
              onClick={resetFields}
            >
              {t("magneto.cancel")}
            </Button>
            <Button
              color="primary"
              type="submit"
              variant="filled"
              disabled={title === ""}
              onClick={onSubmit}
            >
              {t("magneto.create")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

import React, { FunctionComponent, useEffect, useState } from "react";

import { Button, FormControl, Input, Label, Modal } from "@edifice-ui/react";
import "./CreateFolder.scss";
import { t } from "i18next";

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
};

export const CreateFolder: FunctionComponent<props> = ({
  isOpen,
  toggle,
  folderToUpdate,
  reset,
}: props) => {
  const [title, setTitle] = useState("");
  const [parentId] = useState("");
  const [addFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();

  const onSubmit = async (): Promise<void> => {
    const folder = new Folder();
    folder.title = title;
    folder.parentId = parentId;
    if (folderToUpdate != null) {
      folder.id = folderToUpdate.id;
      await updateFolder(folder);
      if (reset != null) reset();
    } else {
      await addFolder(folder);
      console.log("Dossier " + title + " créé!");
    }
    toggle();
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
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={resetFields}>
            {folderToUpdate != null ? (
              <h4>{t("magneto.folder.rename")}</h4>
            ) : (
              <h4>{t("magneto.create.folder")}</h4>
            )}
          </Modal.Header>
          <Modal.Body>
            <FormControl id="title" className="mb-0-5">
              <Label>{t("magneto.create.folder.name")} :</Label>
              <Input
                placeholder=""
                size="md"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <div className="right">
              <Button
                color="primary"
                type="button"
                variant="outline"
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
                disabled={title == ""}
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

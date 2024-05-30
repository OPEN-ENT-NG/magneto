import React, { FunctionComponent, useEffect, useState } from "react";

import { Button, FormControl, Input, Label, Modal } from "@edifice-ui/react";

import "./CreateFolder.scss";
import { Folder } from "../../models/folder.model";
import { useCreateFolderMutation, useUpdateFolderMutation } from "~/services/api/folders.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
  folderToUpdate?: Folder;
};

export const CreateFolder: FunctionComponent<props> = ({
  isOpen,
  toggle,
  folderToUpdate,
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
    }
    else {
      await addFolder(folder);
      console.log("Dossier " + title + " créé!");
    }
    toggle();
  };

  const reset = (): void => {
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
          onModalClose={reset}
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={reset}>
            {folderToUpdate != null ? (
              <h4>Modifier un dossier</h4>
            ) : (
              <h4>Créer un dossier</h4>
            )}
          </Modal.Header>
          <Modal.Body>
            <FormControl id="title" className="mb-0-5">
              <Label>Nom du dossier :</Label>
              <Input
                placeholder=""
                size="md"
                type="text"
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
                onClick={reset}
              >
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="filled"
                className="footer-button"
                disabled={title == ""}
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

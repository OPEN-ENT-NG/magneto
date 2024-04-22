import React, { FunctionComponent, useState } from "react";

import { Button, FormControl, Input, Label, Modal } from "@edifice-ui/react";

import "./CreateFolder.scss";
import { Folder } from "../../models/folder.model";
import { useCreateFolderMutation } from "~/services/api/folders.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
};

export const CreateFolder: FunctionComponent<props> = ({
  isOpen,
  toggle,
}: props) => {
  const [title, setTitle] = useState("");
  const [parentId] = useState("");
  const [addFolder] = useCreateFolderMutation();

  const onSubmit = async (): Promise<void> => {
    const folder = new Folder();
    folder.title = title;
    folder.parentId = parentId;
    await addFolder(folder);
    console.log("Dossier " + title + " créé!");
    toggle();
  };

  const reset = (): void => {
    setTitle("");
    toggle();
  };

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
            <h4>Créer un dossier</h4>
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

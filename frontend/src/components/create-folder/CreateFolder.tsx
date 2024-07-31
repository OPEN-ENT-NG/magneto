import {
  FunctionComponent,
  useEffect,
  useId,
  useState,
  KeyboardEvent,
} from "react";

import { Button, FormControl, Input, Label, Modal } from "@edifice-ui/react";
import "./CreateFolder.scss";
import { useTranslation } from "react-i18next";

import { Folder } from "../../models/folder.model";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
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
  const [addFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();
  const { currentFolder } = useFoldersNavigation();

  const formId = `createFolder_${useId}`;

  const onSubmit = async (): Promise<void> => {
    if (!title) return;
    try {
      const folder = new Folder();
      folder.title = title;
      folder.parentId =
        currentFolder.id == FOLDER_TYPE.MY_BOARDS ? "" : currentFolder.id;
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

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (title) e.preventDefault();
      onSubmit();
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
  }, [folderToUpdate, isOpen]);

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
                <Label>{t("magneto.create.folder.name") + " :"}</Label>
                <Input
                  placeholder={t("magneto.create.folder.name")}
                  size="md"
                  type="text"
                  value={title}
                  aria-required={true}
                  maxLength={60}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleInputKeyDown}
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
              {folderToUpdate ? t("magneto.save") : t("magneto.create")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

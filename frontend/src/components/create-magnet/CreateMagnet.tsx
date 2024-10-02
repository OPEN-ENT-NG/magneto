import { FC, useEffect, useState } from "react";

import { Button, MediaLibrary, Modal, useOdeClient } from "@edifice-ui/react";

import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export const CreateMagnet: FC = () => {
  const { appCode } = useOdeClient();

  const [isOpen, setIsOpen] = useState(false);

  const { mediaLibraryRef, libraryMedia, mediaLibraryHandlers, media } =
    useMediaLibrary();

  useEffect(() => {
    if (libraryMedia) setIsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryMedia]);

  return (
    <>
      {isOpen && (
        <Modal
          id={"displayMessage"}
          isOpen={isOpen}
          size="md"
          viewport={false}
          onModalClose={() => setIsOpen(false)}
        >
          <Modal.Header onModalClose={() => setIsOpen(false)}>CC</Modal.Header>
          <Modal.Body>
            Placeholders - Media type : {media?.type}
            Media name : {media?.name}
          </Modal.Body>

          <Modal.Footer>
            <div className="right">
              <Button
                color="primary"
                type="submit"
                variant="filled"
                className="footer-button"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
      <MediaLibrary
        appCode={appCode}
        ref={mediaLibraryRef}
        multiple={false}
        visibility="protected"
        {...mediaLibraryHandlers}
      />
    </>
  );
};

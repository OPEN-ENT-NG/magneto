import React from "react";

import { Button, Modal } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

type MessageModalProps = {
  isOpen: boolean;
  i18nKey: string;
  param?: string;
  hasSubmit: boolean;
  onSubmit?: () => void;
  onCancel: () => void;
};

export const MessageModal: React.FunctionComponent<MessageModalProps> = ({
  isOpen,
  i18nKey,
  param,
  hasSubmit,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {isOpen && (
        <Modal
          id={"displayMessage"}
          isOpen={isOpen}
          onModalClose={onCancel}
          size="md"
          viewport={false}
        >
          <Modal.Body>
            {!!i18nKey && !!param && param != ""
              ? t(i18nKey, { 0: param })
              : t(i18nKey)}
          </Modal.Body>

          <Modal.Footer>
            <div className="right">
              <Button
                color="primary"
                type="button"
                variant="outline"
                className="footer-button"
                onClick={onCancel}
              >
                {t("magneto.cancel")}
              </Button>
              {hasSubmit && (
                <Button
                  color="primary"
                  type="submit"
                  variant="filled"
                  className="footer-button"
                  onClick={onSubmit}
                >
                  {t("magneto.confirm")}
                </Button>
              )}
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

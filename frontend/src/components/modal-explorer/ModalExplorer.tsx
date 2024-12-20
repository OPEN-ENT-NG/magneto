import { FC, useEffect, useState } from "react";

import { Button, Image, Modal } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ONBOARDING_EXPLORER_IMAGES } from "~/core/constants/onboarding.const";
import { PREF_EXPLORER_MODAL } from "~/core/constants/preferences.const";
import { useOnboardingModal } from "~/hooks/useOnboardingModal";

import "./ModalExplorer.scss";

export const ModalExplorer: FC = () => {
  const { t } = useTranslation("magneto");
  const [swiperInstance, setSwiperInstance] = useState<any>();
  const [swiperProgress, setSwiperprogress] = useState<number>(0);
  const { isOpen, isOnboarding, setIsOpen, handleSavePreference } =
    useOnboardingModal(PREF_EXPLORER_MODAL);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
    link.rel = "stylesheet";
    link.type = "text/css";

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return isOnboarding
    ? createPortal(
        <Modal
          id="onboarding-modal-magneto"
          size="md"
          isOpen={isOpen}
          focusId="nextButtonId"
          onModalClose={() => setIsOpen(false)}
        >
          <Modal.Header onModalClose={() => setIsOpen(false)}>
            {t("magneto.modal.explorer.title")}
          </Modal.Header>
          <Modal.Body>
            <Swiper
              modules={[Pagination]}
              onSwiper={(swiper) => {
                setSwiperInstance(swiper);
              }}
              onSlideChange={(swiper) => {
                setSwiperprogress(swiper.progress);
              }}
              pagination={{
                clickable: true,
              }}
            >
              {ONBOARDING_EXPLORER_IMAGES.map((item, index) => {
                return (
                  <SwiperSlide
                    key={index}
                    className="mag-modal-explorer-swiper"
                  >
                    <Image
                      className="mx-auto my-12 mag-modal-explorer-image"
                      loading="lazy"
                      src={`${item.src}`}
                      alt={t(item.alt)}
                    />
                    <p>{t(item.text)}</p>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              {t("magneto.modal.explorer.trash.later")}
            </Button>

            {swiperProgress > 0 && (
              <Button
                type="button"
                color="primary"
                variant="outline"
                onClick={() => swiperInstance.slidePrev()}
              >
                {t("magneto.modal.explorer.prev")}
              </Button>
            )}
            {swiperProgress < 1 && (
              <Button
                id="nextButtonId"
                type="button"
                color="primary"
                variant="filled"
                onClick={() => swiperInstance.slideNext()}
              >
                {t("magneto.modal.explorer.next")}
              </Button>
            )}
            {swiperProgress === 1 && (
              <Button
                type="button"
                color="primary"
                variant="filled"
                onClick={handleSavePreference}
              >
                {t("magneto.modal.explorer.close")}
              </Button>
            )}
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
};

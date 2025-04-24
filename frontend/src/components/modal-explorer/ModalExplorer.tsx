import { FC, useEffect, useState } from "react";

import {
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@cgi-learning-hub/ui";
import { Image } from "@edifice.io/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ModalExplorerProps } from "./types";
import { buttonStyle, contentStyle } from "../export-modal/style";
import { actionStyle, dialogStyle, titleStyle } from "../message-modal/style";
import { PREF_UPDATE_MODAL } from "~/core/constants/preferences.const";
import { useOnboardingModal } from "~/hooks/useOnboardingModal";

import "./ModalExplorer.scss";

export const ModalExplorer: FC<ModalExplorerProps> = ({ onboarding }) => {
  const { t } = useTranslation("magneto");
  const [swiperInstance, setSwiperInstance] = useState<any>();
  const [swiperProgress, setSwiperprogress] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { isOpen, isOnboarding, setIsOpen, handleSavePreference } =
    useOnboardingModal(PREF_UPDATE_MODAL);

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
        <Dialog
          sx={dialogStyle}
          id="onboarding-modal-magneto"
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <DialogTitle component="h2" sx={titleStyle}>
            {t(
              onboarding[activeIndex]?.title || "magneto.modal.explorer.title",
            )}
          </DialogTitle>
          <DialogContent sx={contentStyle}>
            <Swiper
              modules={[Pagination]}
              onSwiper={(swiper) => {
                setSwiperInstance(swiper);
              }}
              onSlideChange={(swiper) => {
                setSwiperprogress(swiper.progress);
                setActiveIndex(swiper.activeIndex);
              }}
              pagination={{
                clickable: true,
              }}
            >
              {onboarding.map((item, index) => {
                return (
                  <SwiperSlide
                    key={index}
                    className="mag-modal-explorer-swiper"
                  >
                    {item.custom ?? (
                      <Image
                        className="mx-auto my-12 mag-modal-explorer-image"
                        loading="lazy"
                        src={`${item.src}`}
                        alt={t(item.alt)}
                      />
                    )}
                    <p>{t(item.text)}</p>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </DialogContent>
          <DialogActions sx={actionStyle}>
            <Button
              variant="text"
              color="primary"
              size="medium"
              sx={buttonStyle}
              onClick={() => setIsOpen(false)}
            >
              {t("magneto.modal.explorer.trash.later")}
            </Button>

            {swiperProgress > 0 && (
              <Button
                variant="outlined"
                color="primary"
                size="medium"
                sx={buttonStyle}
                onClick={() => swiperInstance.slidePrev()}
              >
                {t("magneto.modal.explorer.prev")}
              </Button>
            )}
            {swiperProgress < 1 && (
              <Button
                id="nextButtonId"
                variant="contained"
                color="primary"
                size="medium"
                sx={buttonStyle}
                onClick={() => swiperInstance.slideNext()}
              >
                {t("magneto.modal.explorer.next")}
              </Button>
            )}
            {swiperProgress === 1 && (
              <Button
                variant="contained"
                color="primary"
                size="medium"
                sx={buttonStyle}
                onClick={handleSavePreference}
              >
                {t("magneto.modal.explorer.close")}
              </Button>
            )}
          </DialogActions>
        </Dialog>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
};

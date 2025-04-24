import { createElement, ReactNode } from "react";

import AlertIcon from "~/components/alert-icon/AlertIcon";

export interface ExplorerImage {
  src: string;
  alt: string;
  text: string;
  title?: string;
  custom?: ReactNode;
}

export const ONBOARDING_EXPLORER_IMAGES: ExplorerImage[] = [
  {
    src: "magneto/public/img/onboarding_1.png",
    alt: "magneto.modal.explorer.screen1.alt",
    text: "magneto.modal.explorer.screen1.text",
  },
  {
    src: "/magneto/public/img/onboarding_2.svg",
    alt: "magneto.modal.explorer.screen2.alt",
    text: "magneto.modal.explorer.screen2.text",
  },
  {
    src: "magneto/public/img/onboarding_3.png",
    alt: "magneto.modal.explorer.screen3.alt",
    text: "magneto.modal.explorer.screen3.text",
  },
];

export const ONBOARDING_UPDATE_IMAGES: ExplorerImage[] = [
  {
    src: "magneto/public/img/magnet_board.svg",
    alt: "magneto.modal.update.screen1.alt",
    text: "magneto.modal.update.screen1.text",
    title: "magneto.modal.update.screen1.title",
    custom: createElement(AlertIcon, {
      iconColor: "var(--theme-palette-primary-main)",
      backgroundColor: "var(--theme-palette-primary-lighter)",
    }),
  },
  {
    src: "/magneto/public/img/magnet_locked.svg",
    alt: "magneto.modal.update.screen2.alt",
    text: "magneto.modal.update.screen2.text",
    title: "magneto.modal.update.screen2.title",
  },
  {
    src: "magneto/public/img/powerpoint.svg",
    alt: "magneto.modal.update.screen3.alt",
    text: "magneto.modal.update.screen3.text",
    title: "magneto.modal.update.screen3.title",
  },
  {
    src: "magneto/public/img/board_public.svg",
    alt: "magneto.modal.update.screen4.alt",
    text: "magneto.modal.update.screen4.text",
    title: "magneto.modal.update.screen4.title",
  },
];

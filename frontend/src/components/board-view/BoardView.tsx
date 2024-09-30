import { FC, useEffect, useState } from "react";

import "./BoardView.scss";

import {
  Button,
  IExternalLink,
  InternalLinkTabResult,
  LoadingScreen,
  MediaLibrary,
  MediaLibraryType,
  Modal,
  useOdeClient,
} from "@edifice-ui/react";
import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { BoardBodyWrapper, BoardViewWrapper } from "./style";
import { useHeaderHeight } from "./useHeaderHeight";
import { CardsFreeLayout } from "../cards-free-layout/CardsFreeLayout";
import { CardsHorizontalLayout } from "../cards-horizontal-layout/CardsHorizontalLayout";
import { CardsVerticalLayout } from "../cards-vertical-layout/CardsVerticalLayout";
import { HeaderView } from "../header-view/HeaderView";
import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useBoard } from "~/providers/BoardProvider";
import { MessageModal } from "../message-modal/MessageModal";
import { useMediaLibrary } from "~/hooks/useMediaLibrary";
import { WorkspaceElement } from "edifice-ts-client";

export interface MediaProps {
  id: string;
  name: string;
  application: string;
  type: MediaLibraryType;
  url: string;
  targetUrl?: string;
}

export const BoardView: FC = () => {
  const { t } = useTranslation("magneto");
  const [media, setMedia] = useState<MediaProps | null>(null);

  const sideMenuData = useSideMenuData();
  const {
    board,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    isLoading,
    hasEditRights,
  } = useBoard();
  const headerHeight = useHeaderHeight();

  const { appCode } = useOdeClient();

  const {
    ref: mediaLibraryRef,
    libraryMedia,
    ...mediaLibraryHandlers
  } = useMediaLibrary();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight}px`,
    );
  }, [headerHeight]);

  const handleClickMedia = (type: MediaLibraryType) => {
    setMedia({ ...(media as MediaProps), type });
    console.log({ ...(media as MediaProps), type });
    mediaLibraryRef.current?.show(type);
  };

  useEffect(() => {
    if (libraryMedia) {
      if (libraryMedia.url) {
        const medialIb = libraryMedia as IExternalLink;
        setMedia({
          type: (media as MediaProps).type,
          id: "",
          application: "",
          name: medialIb?.text || "",
          url: medialIb?.url,
          targetUrl: medialIb.target,
        });
      } else if (libraryMedia.resources) {
        const medialIb = libraryMedia as InternalLinkTabResult;
        setMedia({
          type: (media as MediaProps).type,
          id: medialIb?.resources?.[0]?.assetId ?? "",
          name: medialIb?.resources?.[0]?.name || "",
          application: medialIb?.resources?.[0]?.application || "",
          url:
            medialIb.resources?.[0]?.path ??
            `/${medialIb.resources?.[0]?.application}#/view/${medialIb.resources?.[0]?.assetId}`,
          targetUrl: medialIb.target,
        });
      } else {
        const medialIb = libraryMedia as WorkspaceElement;
        setMedia({
          type: (media as MediaProps).type,
          id: medialIb?._id || "",
          name: medialIb?.name || "",
          application: "",
          url: medialIb?._id
            ? `/workspace/document/${medialIb?._id}`
            : (libraryMedia as string),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryMedia]);

  const displayLayout = () => {
    switch (board.layoutType) {
      case LAYOUT_TYPE.FREE:
        return <CardsFreeLayout />;
      case LAYOUT_TYPE.VERTICAL:
        return <CardsVerticalLayout />;
      case LAYOUT_TYPE.HORIZONTAL:
        return <CardsHorizontalLayout />;
      default:
        return <CardsFreeLayout />;
    }
  };

  const onclose = (): void => {
    throw new Error("Function not implemented.");
  };

  return isLoading ? (
    <LoadingScreen position={false} />
  ) : (
    <BoardViewWrapper layout={board.layoutType}>
      <HeaderView />
      {hasEditRights() && <SideMenu sideMenuData={sideMenuData} />}
      {/* <BoardBodyWrapper layout={board.layoutType} headerHeight={headerHeight}>
        {displayLayout()}
        {board.backgroundUrl ? (
          <img
            src={board.backgroundUrl}
            alt="backgroundImage"
            className="background-image"
          ></img>
        ) : (
          <div className="no-background-image"></div>
        )}
        {!board.cardIds?.length && !board.sections?.length && (
          <div className="cards-empty-state">
            <div className="card-empty-state-message">
              {t("magneto.add.content.from.menu")}
            </div>
            <Icon path={mdiKeyboardBackspace} size={7} />
          </div>
        )}
      </BoardBodyWrapper> */}
      <Modal
        id={"displayMessage"}
        isOpen={true}
        size="md"
        viewport={false}
        onModalClose={function (): void {
          throw new Error("Function not implemented.");
        }}
      >
        <Modal.Header onModalClose={onclose}> </Modal.Header>
        <Modal.Body>
          <MediaLibrary
            appCode={appCode}
            ref={mediaLibraryRef}
            multiple={false}
            visibility="protected"
            {...mediaLibraryHandlers}
          />
          <img src={media?.url} alt={"cc"} width={200} height={200} />
        </Modal.Body>

        <Modal.Footer>
          <div className="right">
            <Button
              color="tertiary"
              type="button"
              variant="ghost"
              className="footer-button"
              onClick={() => handleClickMedia("image")}
            >
              {t("magneto.cancel")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <div className="zoom-container">
        <ZoomComponent
          opacity={0.75}
          zoomLevel={zoomLevel}
          zoomMaxLevel={5}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
        />
      </div>
    </BoardViewWrapper>
  );
};

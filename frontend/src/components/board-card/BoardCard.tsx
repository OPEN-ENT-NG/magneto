import { FC, useEffect, useRef, useMemo, useCallback, memo } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@edifice-ui/react";
import Icon from "@mdi/react";
import LockIcon from "@mui/icons-material/Lock";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Tooltip } from "@mui/material";

import {
  StyledCardHeader,
  StyledAvatar,
  StyledIconButton,
  StyledTypographySubheader,
  StyledCardContent,
  StyledContentTitleTypography,
  CardContentWrapper,
  StyledCardActions,
  StyledTypographyContainer,
  StyledTypography,
  StyledLegendTypography,
  StyledBox,
  Simple14Typography,
  BottomIconButton,
  StyledCard,
} from "./style";
import { BoardCardProps } from "./types";
import { useCardDropDownItems } from "./useCardDropDownItems";
import { useResourceTypeDisplay } from "./useResourceTypeDisplay";
import { CardComment } from "../card-comment/CardComment";
import { CardCommentProps } from "../card-comment/types";
import { CardContent } from "../card-content/CardContent";
import { CardPayload } from "../create-magnet/types";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../drop-down-list/useDropDown";
import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";
import { DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import useDirectory from "~/hooks/useDirectory";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { useBoard } from "~/providers/BoardProvider";
import {
  useFavoriteCardMutation,
  useUpdateCardMutation,
} from "~/services/api/cards.service";

const MemoizedCardContent = memo(CardContent);
const MemoizedDropDownList = memo(DropDownList);

const MemoizedCardComment = memo(
  CardComment,
  (prevProps: CardCommentProps, nextProps: CardCommentProps) => {
    const prevComment = prevProps.commentData;
    const nextComment = nextProps.commentData;

    return (
      prevComment.cardId === nextComment.cardId &&
      prevComment.cardComment === nextComment.cardComment &&
      prevComment.nbOfComment === nextComment.nbOfComment
    );
  },
);

const MemoizedCardHeader = memo(
  ({
    avatarUrl,
    ownerName,
    timeLabel,
    timeTooltip,
    onToggleDropdown,
    isLocked,
  }: {
    avatarUrl: string;
    ownerName: string;
    timeLabel: string;
    timeTooltip: string;
    onToggleDropdown: () => void;
    isLocked: boolean;
  }) => (
    <StyledCardHeader
      avatar={<StyledAvatar aria-label="recipe" src={avatarUrl} />}
      action={
        <div>
          {isLocked && <LockIcon />}
          <StyledIconButton
            aria-label="settings"
            onClick={onToggleDropdown}
            data-type={POINTER_TYPES.NON_SELECTABLE}
          >
            <MoreVertIcon />
          </StyledIconButton>
        </div>
      }
      title={ownerName}
      subheader={
        <Tooltip title={timeTooltip} placement="bottom-start">
          <StyledTypographySubheader>{timeLabel}</StyledTypographySubheader>
        </Tooltip>
      }
    />
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.avatarUrl === nextProps.avatarUrl &&
      prevProps.ownerName === nextProps.ownerName &&
      prevProps.timeLabel === nextProps.timeLabel &&
      prevProps.timeTooltip === nextProps.timeTooltip &&
      prevProps.onToggleDropdown === nextProps.onToggleDropdown
    );
  },
);

const MemoizedContent = memo(
  ({
    title,
    zoomLevel,
    resourceType,
    card,
  }: {
    title: string;
    zoomLevel: number;
    resourceType: string;
    card: any;
  }) => (
    <StyledCardContent>
      <StyledContentTitleTypography zoomLevel={zoomLevel}>
        {title || <span>&nbsp;</span>}
      </StyledContentTitleTypography>
      {zoomLevel > 1 && (
        <CardContentWrapper resourceType={resourceType}>
          <MemoizedCardContent card={card} />
        </CardContentWrapper>
      )}
    </StyledCardContent>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.zoomLevel === nextProps.zoomLevel &&
      prevProps.resourceType === nextProps.resourceType &&
      prevProps.card === nextProps.card
    );
  },
);

const MemoizedCardActions = memo(
  ({
    cardIsLiked,
    zoomLevel,
    icon,
    type,
    caption,
    nbOfFavorites,
    displayNbFavorites,
    handleFavoriteClick,
  }: {
    cardIsLiked: boolean;
    zoomLevel: number;
    icon: string;
    type: string;
    caption: string;
    nbOfFavorites: number;
    displayNbFavorites: boolean;
    handleFavoriteClick: () => void;
  }) => (
    <StyledCardActions zoomLevel={zoomLevel} disableSpacing>
      <StyledTypographyContainer>
        <StyledTypography>
          <Icon path={icon} size={1} />
          {type}
        </StyledTypography>
        {zoomLevel > 1 && (
          <Tooltip title={caption}>
            <StyledLegendTypography>{caption}</StyledLegendTypography>
          </Tooltip>
        )}
      </StyledTypographyContainer>
      <StyledBox>
        {displayNbFavorites && (
          <Simple14Typography>{nbOfFavorites}</Simple14Typography>
        )}
        <BottomIconButton
          aria-label="add to favorites"
          size="small"
          onClick={() => handleFavoriteClick()}
          data-type={POINTER_TYPES.NON_SELECTABLE}
        >
          {cardIsLiked ? <StarIcon /> : <StarBorderIcon />}
        </BottomIconButton>
      </StyledBox>
    </StyledCardActions>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.cardIsLiked === nextProps.cardIsLiked &&
      prevProps.zoomLevel === nextProps.zoomLevel &&
      prevProps.icon === nextProps.icon &&
      prevProps.type === nextProps.type &&
      prevProps.caption === nextProps.caption &&
      prevProps.nbOfFavorites === nextProps.nbOfFavorites &&
      prevProps.displayNbFavorites === nextProps.displayNbFavorites &&
      prevProps.handleFavoriteClick === nextProps.handleFavoriteClick
    );
  },
);

export const BoardCard: FC<BoardCardProps> = memo(
  ({
    card,
    zoomLevel,
    canComment = false,
    displayNbFavorites = false,
    readOnly = false,
  }) => {
    const { icon, type } = useResourceTypeDisplay(card.resourceType);
    const time = useElapsedTime(card.modificationDate);
    const { openDropdownId, registerDropdown, toggleDropdown, closeDropdown } =
      useDropdown();
    const { getAvatarURL } = useDirectory();
    const [updateCard] = useUpdateCardMutation();
    const [favoriteCard] = useFavoriteCardMutation();
    const { user } = useUser();
    const { board, hasEditRights, hasManageRights } = useBoard();

    const hasLockedCardRights = (): boolean => {
      const isCardOwner: boolean = card.ownerId == user?.userId;
      return isCardOwner || (card.locked ? hasManageRights() : hasEditRights());
    };

    const lockOrUnlockMagnet = async () => {
      const payload: CardPayload = {
        id: card.id,
        boardId: board._id,
        caption: card.caption,
        description: card.description,
        locked: !card.locked,
        resourceId: card.resourceId,
        resourceType: card.resourceType,
        resourceUrl: card.resourceUrl,
        title: card.title,
      };

      await updateCard(payload);
    };

    const dropDownItemList = useCardDropDownItems(
      readOnly,
      card.locked,
      lockOrUnlockMagnet,
      card,
      card.locked ? !hasLockedCardRights() : false,
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const isOpen = openDropdownId === card.id;

    const handleToggleDropdown = useCallback(() => {
      if (card.id) {
        toggleDropdown(card.id);
      }
    }, [card.id, toggleDropdown]);

    const handleDropdownClose = useCallback(
      () => toggleDropdown(null),
      [toggleDropdown],
    );

    const sortableProps = useSortable({
      id: card.id,
      data: {
        type: DND_ITEM_TYPE.CARD,
        card: card,
      },
      disabled: readOnly,
    });

    const {
      isDragging,
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = sortableProps;

    const handleFavoriteClick = useCallback(() => {
      favoriteCard({ cardId: card.id, isFavorite: card.liked });
    }, [card.id, card.liked, favoriteCard]);

    const style = useMemo(
      () => ({
        transform: CSS.Translate.toString({
          x: transform?.x ?? 0,
          y: transform?.y ?? 0,
          scaleX: 1,
          scaleY: 1,
        }),
        transition: transition || undefined,
        cursor: listeners ? "move" : "default",
      }),
      [transform, transition, listeners],
    );

    const headerProps = useMemo(
      () => ({
        avatarUrl: getAvatarURL(card.ownerId, "user"),
        ownerName: card.ownerName,
        timeLabel: time.label,
        timeTooltip: time.tooltip,
        onToggleDropdown: handleToggleDropdown,
        isLocked: card.locked,
      }),
      [
        card.ownerId,
        card.ownerName,
        time.label,
        time.tooltip,
        handleToggleDropdown,
        getAvatarURL,
        card.locked,
      ],
    );

    const contentProps = useMemo(
      () => ({
        title: card.title,
        zoomLevel,
        resourceType: card.resourceType,
        card,
      }),
      [card.title, zoomLevel, card.resourceType, card],
    );

    const actionProps = useMemo(
      () => ({
        cardIsLiked: card.liked,
        zoomLevel,
        icon,
        type,
        caption: card.caption,
        nbOfFavorites: card.nbOfFavorites,
        displayNbFavorites,
        handleFavoriteClick,
      }),
      [
        card.liked,
        zoomLevel,
        icon,
        type,
        card.caption,
        card.nbOfFavorites,
        displayNbFavorites,
        handleFavoriteClick,
      ],
    );

    // Effets
    useEffect(() => {
      registerDropdown(card.id, dropdownRef.current);
    }, [card.id, registerDropdown]);

    useEffect(() => {
      if (isDragging) closeDropdown();
    }, [isDragging, closeDropdown]);

    const commentData = useMemo(
      () => ({
        cardComment: card.lastComment,
        nbOfComment: card.nbOfComments,
        cardId: card.id,
      }),
      [card.lastComment, card.nbOfComments, card.id],
    );

    return (
      <StyledCard
        data-dropdown-open={isOpen ? "true" : "false"}
        data-type={DND_ITEM_TYPE.CARD}
        zoomLevel={zoomLevel}
        isDragging={isDragging}
        ref={setNodeRef}
        style={style}
        {...(readOnly ? {} : { ...attributes, ...listeners })}
      >
        <div ref={dropdownRef}>
          <MemoizedCardHeader {...headerProps} />
        </div>
        <MemoizedContent {...contentProps} />
        <MemoizedCardActions {...actionProps} />

        {isOpen && dropdownRef.current && (
          <MemoizedDropDownList
            items={dropDownItemList}
            onClose={handleDropdownClose}
            open={isOpen}
            anchorEl={dropdownRef.current}
            position="right-top"
          />
        )}

        {canComment && zoomLevel > 1 && (
          <MemoizedCardComment commentData={commentData} />
        )}
      </StyledCard>
    );
  },
);

BoardCard.displayName = "BoardCard";
const MemoizedBoardCard = memo(BoardCard, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.liked === nextProps.card.liked &&
    prevProps.card.modificationDate === nextProps.card.modificationDate &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.canComment === nextProps.canComment &&
    prevProps.card.lastComment === nextProps.card.lastComment &&
    prevProps.card.nbOfComments === nextProps.card.nbOfComments &&
    prevProps.displayNbFavorites === nextProps.displayNbFavorites &&
    prevProps.readOnly === nextProps.readOnly
  );
});

export default MemoizedBoardCard;

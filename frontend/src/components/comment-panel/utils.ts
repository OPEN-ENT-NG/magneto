import { RefObject } from "react";

import dayjs from "dayjs";

import { CommentOrDivider } from "./types";
import { Comment } from "~/models/comment.types";

export const processCommentsWithDividers = (
  comments: Comment[],
): CommentOrDivider[] => {
  if (!comments?.length) return [];

  const sortedComments = [...comments].sort(
    (a, b) => dayjs(a.creationDate).valueOf() - dayjs(b.creationDate).valueOf(),
  );

  return sortedComments.reduce(
    (acc: CommentOrDivider[], comment: Comment, index: number) => {
      const currentDivider = dayjs(comment.creationDate).isSame(dayjs(), "day")
        ? "magneto.today"
        : dayjs(comment.creationDate).isSame(dayjs().subtract(1, "day"), "day")
        ? "magneto.yesterday"
        : dayjs(comment.creationDate).format("DD/MM/YYYY");

      const needsDivider =
        index === 0 ||
        (() => {
          const prevComment = sortedComments[index - 1];
          const prevDivider = dayjs(prevComment.creationDate).isSame(
            dayjs(),
            "day",
          )
            ? "magneto.today"
            : dayjs(prevComment.creationDate).isSame(
                dayjs().subtract(1, "day"),
                "day",
              )
            ? "magneto.yesterday"
            : dayjs(prevComment.creationDate).format("DD/MM/YYYY");

          return prevDivider !== currentDivider;
        })();

      return needsDivider
        ? [...acc, currentDivider, comment]
        : [...acc, comment];
    },
    [],
  );
};

export const scrollToBottom = (ref: RefObject<HTMLDivElement>) => {
  if (ref.current) {
    ref.current.scrollTop = ref.current.scrollHeight;
  }
};

export const getModalPosition = (
  anchorEl: HTMLElement,
  anchorOrigin: {
    vertical: "top" | "center" | "bottom";
    horizontal: "left" | "center" | "right";
  },
  transformOrigin: {
    vertical: "top" | "center" | "bottom";
    horizontal: "left" | "center" | "right";
  },
) => {
  const rect = anchorEl.getBoundingClientRect();
  const anchorPoint = {
    x:
      anchorOrigin.horizontal === "left"
        ? rect.left
        : anchorOrigin.horizontal === "center"
        ? rect.left + rect.width / 2
        : rect.right,
    y:
      anchorOrigin.vertical === "top"
        ? rect.top
        : anchorOrigin.vertical === "center"
        ? rect.top + rect.height / 2
        : rect.bottom,
  };

  return {
    position: "absolute",
    left: `${anchorPoint.x}px`,
    top: `${anchorPoint.y}px`,
    transform: `translate(${
      transformOrigin.horizontal === "left"
        ? "0"
        : transformOrigin.horizontal === "center"
        ? "-50%"
        : "-100%"
    }, ${
      transformOrigin.vertical === "top"
        ? "0"
        : transformOrigin.vertical === "center"
        ? "-50%"
        : "-100%"
    })`,
  };
};

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

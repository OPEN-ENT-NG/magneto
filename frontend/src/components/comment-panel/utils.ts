import dayjs from "dayjs";

import { CommentOrDivider } from "./types";
import { Comment } from "~/models/comment.types";

export const processCommentsWithDividers = (
  comments: Comment[],
): CommentOrDivider[] => {
  if (!comments?.length) return [];

  const sortedComments = [...comments].sort(
    (a, b) =>
      dayjs(a.modificationDate).valueOf() - dayjs(b.modificationDate).valueOf(),
  );

  return sortedComments.reduce(
    (acc: CommentOrDivider[], comment: Comment, index: number) => {
      const currentDivider = dayjs(comment.modificationDate).isSame(
        dayjs(),
        "day",
      )
        ? "Aujourd'hui"
        : dayjs(comment.modificationDate).isSame(
            dayjs().subtract(1, "day"),
            "day",
          )
        ? "Hier"
        : dayjs(comment.modificationDate).format("DD/MM/YYYY");

      const needsDivider =
        index === 0 ||
        (() => {
          const prevComment = sortedComments[index - 1];
          const prevDivider = dayjs(prevComment.modificationDate).isSame(
            dayjs(),
            "day",
          )
            ? "Aujourd'hui"
            : dayjs(prevComment.modificationDate).isSame(
                dayjs().subtract(1, "day"),
                "day",
              )
            ? "Hier"
            : dayjs(prevComment.modificationDate).format("DD/MM/YYYY");

          return prevDivider !== currentDivider;
        })();

      return needsDivider
        ? [...acc, currentDivider, comment]
        : [...acc, comment];
    },
    [],
  );
};

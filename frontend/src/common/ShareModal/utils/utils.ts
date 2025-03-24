export const createExternalLink = (
  host: string | null | undefined,
  boardId: string,
) => {
  if (!host || host === "{{host}}") return null;
  return `${host}/magneto/public#/pub/${boardId}`;
};

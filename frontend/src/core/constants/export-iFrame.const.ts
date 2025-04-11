/**
 * Generates the iframe code based on the provided parameters.
 * @param isExternalInput - Is the board shared publicly.
 * @param boardId - The ID of the board.
 * @returns The iframe code as a string.
 */
export const getIframeCode = (
  isExternalInput: boolean,
  boardId: string,
) => `<div style="width:100%; overflow:hidden;">
    <iframe src="${window.location.origin}${
      !isExternalInput
        ? `/magneto#/board/${boardId}/view`
        : `/magneto/public#/pub/${boardId}`
    }" 
    style="width:125%; height:125%; transform: scale(0.8); transform-origin: 0 0;" scrolling="no"></iframe>
</div>`;

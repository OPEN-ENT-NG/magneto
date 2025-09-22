/**
 * Generates the iframe code based on the provided parameters.
 * @param isExternalInput - Is the board shared publicly.
 * @param boardId - The ID of the board.
 * @returns The iframe code as a string.
 */
export const getIframeCode = (
  isExternalInput: boolean,
  boardId: string,
) => `<div style="width:100%; height:100%; overflow:hidden;">
    <iframe src="${window.location.origin}${
      !isExternalInput
        ? `/magneto#/board/${boardId}/view`
        : `/magneto/public#/pub/${boardId}`
    }" 
    style="width:100%; height:70vh; display: block; border: none; margin: 0 auto;" scrolling="no" allowfullscreen></iframe>
</div>`;

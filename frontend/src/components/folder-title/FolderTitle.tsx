/** @jsxImportSource @emotion/react */
import { FC } from "react";

import { elementWrapper, folderTitleWrapper, SVGWrapper, textStyle } from "./style";
import { FolderTitleProps } from "./types";


export const FolderTitle: FC<FolderTitleProps> = ({ text, SVGLeft = null, SVGRight = null, position = "start" }) => (
    <div css={folderTitleWrapper(position)}>
        <div css={elementWrapper}>
            {SVGLeft ? <div css={SVGWrapper}>{SVGLeft}</div> : null}
            <span css={textStyle}>{text}</span>
            {SVGRight ? <div css={SVGWrapper}>{SVGRight}</div> : null}
        </div>
    </div>

)

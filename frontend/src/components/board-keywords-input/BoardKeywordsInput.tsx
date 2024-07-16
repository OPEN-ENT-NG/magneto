import React, { FunctionComponent, useEffect, useState } from "react";

import { FormControl, Input, Label } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { Board } from "~/models/board.model";

type props = {
    board: Board;
};

export const BoardKeywordsInput: FunctionComponent<props> = ({
    board,
}: props) => {
    const { t } = useTranslation("magneto");
    const [tagsTextInput, setTagsTextInput] = useState("");

    const updateKeywords = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue: string = event.target.value;

        if (inputValue.length > 0 && inputValue[inputValue.length - 1] === ",") {
            setTagsTextInput(inputValue.replace(",", ""));
            return;
        }

        if (inputValue.length > 0 && inputValue[inputValue.length - 1] === " ") {
            let inputArray: string[] = inputValue.split(" ");

            inputArray = inputArray.map((keyword) => {
                if (keyword === "") {
                    return "";
                } else if (keyword[0] === "#") {
                    return keyword;
                } else {
                    return "#" + keyword;
                }
            });

            setTagsTextInput(inputArray.join(" "));
        }

        const updatedTags: string[] = inputValue
            .split(" ")
            .filter((keyword) => keyword !== "")
            .map((keyword) =>
                keyword[0] === "#"
                    ? keyword.substring(1).toLowerCase()
                    : keyword.toLowerCase(),
            );

        board.tags = updatedTags;
    };

    useEffect(() => {
        if (board != null) {
            setTagsTextInput(board.tagsTextInput);
        }
    }, [board]);

    return (
        <div className="mb-1">
            <FormControl id="keywords">
                <Label>{t("magneto.board.keywords")}</Label>
                <Input
                    placeholder=""
                    size="md"
                    type="text"
                    value={tagsTextInput}
                    onChange={(e) => {
                        setTagsTextInput(e.target.value);
                        updateKeywords(e);
                    }}
                />
            </FormControl>
        </div>
    );
};

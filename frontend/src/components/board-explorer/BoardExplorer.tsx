import React, { FC, useEffect, useMemo, useState } from "react";
import "./BoardExplorer.scss";
import { Button } from "@edifice-ui/react";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useBoard } from "~/providers/BoardProvider";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import { Section } from "~/providers/BoardProvider/types";
import { useTranslation } from "react-i18next";
import { Card } from "~/models/card.model";

export const retourStyle = {
  position: "fixed",
  right: "6%",
  transform: "translateX(20%)",
  top: "6%",
} as React.CSSProperties;

export const boxStyle = {
  padding: "1rem 0",
  position: "relative",
  overflow: "visible", // Permet au bouton de dépasser
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as React.CSSProperties;

export const BoardExplorer: FC = () => {
  const { board } = useBoard();
  const navigate = useNavigate();
  const { t } = useTranslation("magneto");

  const filteredSections = useMemo(() => {
    return board.sections.filter(
      (section) => section.cards && section.cards.length > 0,
    );
  }, [board]);

  const navigateToView = () => {
    navigate(`/board/${board.id}/view`);
  };

  const initialCards = useMemo(() => {
    return board.isLayoutFree()
      ? board.cards
      : filteredSections.flatMap((section) => section.cards || []);
  }, [board]);

  const [card, setCard] = useState(initialCards[0]);
  const [cardIndex, setCardIndex] = useState(0);
  const [section, setSection] = useState<Section | null>(
    board.isLayoutFree() ? filteredSections[0] : null,
  );

  useEffect(() => {
    setCard(initialCards[0]);
  }, [initialCards]);

  useEffect(() => {
    setSection(filteredSections[0]);
  }, [filteredSections]);

  const navigatePage = (direction: "next" | "prev") => {
    const newIndex = direction === "next" ? cardIndex + 1 : cardIndex - 1;
    const newCard = initialCards[newIndex];

    if (board.isLayoutFree()) {
      const newSection = filteredSections.find((s) =>
        s.cards.some((card) => card.id === newCard.id),
      );
      if (newSection) {
        setSection(newSection);
      }
    }

    setCard(newCard);
    setCardIndex(newIndex);
  };

  const isLastCardInBoard = (): boolean => {
    const cards = board.isLayoutFree() ? board.cards : initialCards;
    return card === cards[cards.length - 1];
  };

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    const sectionId = event.target.value;
    const selectedSection = filteredSections.find(
      (sectionSelected) => sectionSelected._id === sectionId,
    );
    if (selectedSection) {
      setSection(selectedSection);

      const index = initialCards.findIndex(
        (selectedCard: Card) =>
          selectedCard.id === selectedSection?.cards[0].id,
      );
      setCard(initialCards[index]);
      setCardIndex(index);
    }
  };

  const time = useElapsedTime(card?.modificationDate);

  return (
    <>
      {filteredSections && section && (
        <FormControl size="medium" variant="filled" fullWidth>
          <InputLabel id="select-label" sx={{ fontSize: "1.5rem" }}>
            Section
          </InputLabel>
          <Select
            labelId="select-section"
            id="select-section"
            value={section?._id}
            onChange={handleSectionChange}
            label={t("magneto.card.section")}
            sx={{
              width: "55%",
              fontSize: "1.5rem",
              backgroundColor: "rgba(0, 0, 0, 0.01)",
              boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
              "&::before": {
                borderBottomColor: "#ededed",
              },
              "&::after": {
                borderBottomColor: "grey",
              },
              "&.Mui-focused": {
                backgroundColor: "#fafafa",
              },
            }}
          >
            {filteredSections.map((s: Section) => (
              <MenuItem key={s._id} value={s._id} sx={{ fontSize: "1.5rem" }}>
                {s.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        color="primary"
        type="submit"
        variant="filled"
        className="retour-button"
        onClick={navigateToView}
        style={retourStyle}
      >
        {"<- Retour"}
      </Button>
      <div
        style={
          {
            paddingRight: "1.6rem",
            paddingLeft: "1.6rem",
          } as React.CSSProperties
        }
      >
        <Box sx={boxStyle}>
          <div>
            <h1>Mon en-tête</h1>
          </div>

          {cardIndex > 0 && (
            <IconButton
              sx={{
                position: "fixed",
                left: "6%",
                top: "50%",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "white" },
                width: "7rem",
                height: "7rem",
                boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
                "& .MuiSvgIcon-root": {
                  fontSize: "5rem",
                },
              }}
              onClick={() => navigatePage("prev")}
            >
              <ChevronLeftIcon sx={{ color: "black" }} />
            </IconButton>
          )}
          {!isLastCardInBoard() && (
            <IconButton
              sx={{
                position: "fixed",
                right: "6%",
                top: "50%",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "white" },
                width: "7rem",
                height: "7rem",
                boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
                "& .MuiSvgIcon-root": {
                  fontSize: "5rem",
                },
              }}
              onClick={() => navigatePage("next")}
            >
              <ChevronRightIcon sx={{ color: "black" }} />
            </IconButton>
          )}
        </Box>
        <Box sx={{ marginBottom: "10rem" }}>
          <span>
            Crée par {card?.ownerName}, modifié par{" "}
            {card?.lastModifierName ?? card?.ownerName}
          </span>
          <span> {time.label}</span>
        </Box>
        <Box sx={{ marginBottom: "10rem" }}>STUB CONTENT</Box>
        <Box
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(card?.description),
          }}
        />
        <Box>
          <span>{card?.caption}</span>
        </Box>
      </div>
    </>
  );
};

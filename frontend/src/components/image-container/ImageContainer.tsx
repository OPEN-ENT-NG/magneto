import { Box } from "@mui/material";
import { IconButton } from "@edifice-ui/react";
import { Edit } from "@edifice-ui/icons";
import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
import { useEffect, useRef, useState } from "react";
import { ImageContainerProps } from "./types";

export const ImageContainer = ({
  media,
  handleClickMedia,
}: ImageContainerProps) => {
  const [imageBounds, setImageBounds] = useState({ top: 0, right: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateButtonPosition = () => {
      if (imageRef.current && containerRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setImageBounds({
          top: imgRect.top - containerRect.top,
          right: containerRect.right - imgRect.right,
        });
      }
    };

    // Initial position
    updateButtonPosition();

    // Update position on window resize
    window.addEventListener("resize", updateButtonPosition);

    // Update position when image loads
    if (imageRef.current) {
      imageRef.current.addEventListener("load", updateButtonPosition);
    }

    return () => {
      window.removeEventListener("resize", updateButtonPosition);
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", updateButtonPosition);
      }
    };
  }, [media?.url]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "15rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "1rem",
        overflow: "hidden",
      }}
    >
      <img
        ref={imageRef}
        src={media?.url}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
        alt={media?.name}
      />
      <Box
        sx={{
          position: "absolute",
          top: `${imageBounds.top}px`,
          right: `${imageBounds.right}px`,
          backgroundColor: "var(--edifice-white)",
          borderRadius: "0.8rem",
          width: "4rem",
          height: "4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <IconButton
          aria-label="Edit image"
          color="tertiary"
          icon={<Edit />}
          onClick={() => handleClickMedia(MEDIA_LIBRARY_TYPE.IMAGE)}
          type="button"
          variant="ghost"
          style={{
            padding: 0,
            minWidth: "auto",
            width: "3.2rem",
            height: "3.2rem",
          }}
        />
      </Box>
    </Box>
  );
};

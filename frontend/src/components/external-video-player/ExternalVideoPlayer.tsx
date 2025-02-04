import { FC } from "react";

import { Box } from "@mui/material";
import ReactPlayer from "react-player";

import { iframeStyle, reactPlayerStyle, videoPlayerWrapper } from "./style";
import { VIDEO_SOURCE, VideoPlayerProps } from "./types";
import { getDailymotionId } from "./utils";

export const ExternalVideoPlayer: FC<VideoPlayerProps> = ({
  url,
  source,
  width = "100%",
  height = "100%",
  ...playerProps
}) => {
  if (source === VIDEO_SOURCE.PEERTUBE) {
    return (
      <Box sx={videoPlayerWrapper}>
        <iframe
          src={url}
          title={"peertube"}
          style={iframeStyle}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      </Box>
    );
  }

  if (source === VIDEO_SOURCE.DAILYMOTION) {
    const videoId = getDailymotionId(url);
    return (
      <Box sx={videoPlayerWrapper}>
        <iframe
          src={`https://geo.dailymotion.com/player.html?video=${videoId}`}
          title="Dailymotion video player"
          style={iframeStyle}
          allowFullScreen
          allow="autoplay; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      </Box>
    );
  }

  return (
    <Box sx={videoPlayerWrapper}>
      <ReactPlayer
        url={url}
        width={width}
        height={height}
        style={reactPlayerStyle}
        controls
        pip
        stopOnUnmount
        {...playerProps}
      />
    </Box>
  );
};

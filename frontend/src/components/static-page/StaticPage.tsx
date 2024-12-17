import React from 'react';

interface UrlBackgroundViewerProps {
  url: string;
  width?: number;
  height?: number;
}

export const UrlBackgroundViewer: React.FC<UrlBackgroundViewerProps> = ({
  url,
  width = 1920,
  height = 1080
}) => {
  return (
    <div 
      style={{
        width: '100%',
        maxWidth: `${width}px`,
        height: `${height}px`,
        background: `url(${url}) no-repeat center center`,
        backgroundSize: 'contain',
        pointerEvents: 'none',
      }}
    />
  );
};
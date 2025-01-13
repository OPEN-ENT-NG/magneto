import { useEffect, useState } from "react";

import { IResource } from "@edifice.io/client";

interface UseBackgroundProps {
  selectedResource?: IResource;
}

export const useBackground = ({ selectedResource }: UseBackgroundProps) => {
  const [background, setBackground] = useState<string | Blob | File>(
    selectedResource ? selectedResource.thumbnail : "",
  );

  useEffect(() => {
    setBackground(selectedResource?.thumbnail || "");
  }, [selectedResource]);

  const handleUploadBackground = (file: File) => setBackground(file);
  const handleDeleteBackground = () => setBackground("");

  return {
    background,
    handleDeleteBackground,
    handleUploadBackground,
  };
};

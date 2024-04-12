import { useEffect, useState } from "react";

import { IResource } from "edifice-ts-client";

interface UseThumbProps {
  selectedResource?: IResource;
}

export const useThumb = ({ selectedResource }: UseThumbProps) => {
  const [thumbnail, setThumbnail] = useState<string | Blob | File>(
    selectedResource ? selectedResource.thumbnail : "",
  );

  useEffect(() => {
    setThumbnail(selectedResource?.thumbnail || "");
  }, [selectedResource]);

  const handleUploadImage = (file: File) => setThumbnail(file);
  const handleDeleteImage = () => setThumbnail("");

  return {
    thumbnail,
    handleDeleteImage,
    handleUploadImage,
  };
};

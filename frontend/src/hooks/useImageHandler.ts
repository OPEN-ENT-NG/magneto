import { useEffect, useState } from "react";

import { odeServices } from "edifice-ts-client";

export default function useImageHandler(initialCover: string | Blob | File) {
  const [cover, setCover] = useState<string | Blob | File>(initialCover);

  useEffect(() => {
    setCover(initialCover);
  }, [initialCover]);

  const handleUploadImage = (file: File) => setCover(file);

  const handleDeleteImage = () => setCover("");

  const fetchUrl = async (): Promise<string> => {
    let blob: Blob = new Blob();
    if (typeof cover === "string") {
      blob = await odeServices.http().get(cover, {
        responseType: "blob",
      });
    } else if (cover) {
      blob = await odeServices.http().get(URL.createObjectURL(cover as Blob), {
        responseType: "blob",
      });
    }

    const response = await odeServices.workspace().saveFile(blob, {
      visibility: "protected",
      application: "media-library",
    });

    return (
      "/workspace/document/" +
      (response._id != null ? response._id : "undefined")
    );
  };

  return {
    cover,
    handleUploadImage,
    handleDeleteImage,
    fetchUrl,
  };
}

import { ComponentPropsWithRef, useEffect, useState, useRef, FC } from "react";

import { Delete, Edit } from "@edifice-ui/icons";
import { IconButton } from "@edifice-ui/react";
import { Avatar } from "@edifice-ui/react";
import { AppIcon } from "@edifice-ui/react";
import clsx from "clsx";
import { IWebApp } from "edifice-ts-client";

interface UniqueImagePickerProps extends ComponentPropsWithRef<"input"> {
  addButtonLabel: string;
  deleteButtonLabel: string;
  src?: string;
  libraryMedia: any;
  mediaLibraryRef: any;
  app?: IWebApp | undefined;
  appCode?: string;
  className?: string;
  id: string;
  onUploadImage: (id: string) => void;
  onDeleteImage: () => void;
}

export const UniqueImagePicker: FC<UniqueImagePickerProps> = ({
  addButtonLabel = "Add image",
  deleteButtonLabel = "Delete image",
  src,
  className,
  app,
  id,
  onUploadImage,
  onDeleteImage,
}) => {
  const [preview, setPreview] = useState<string>(src || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (src) {
      setPreview(src);
    }
  }, [src]);

  const handleClean = () => {
    setPreview("");
    onDeleteImage();
  };

  const classes = clsx("image-input", className);

  return (
    <div ref={wrapperRef} id="image-input" className={classes}>
      <div className="image-input-actions gap-8">
        <IconButton
          aria-label={addButtonLabel}
          color="tertiary"
          icon={<Edit />}
          onClick={() => onUploadImage(id)}
          type="button"
          variant="ghost"
        />
        <IconButton
          aria-label={deleteButtonLabel}
          color="danger"
          disabled={!preview}
          icon={<Delete width="20" height="20" />}
          onClick={handleClean}
          type="button"
          variant="ghost"
        />
      </div>
      {preview ? (
        <Avatar alt="" src={preview} size="xl" />
      ) : (
        <AppIcon app={app} iconFit="ratio" size="160" variant="rounded" />
      )}
    </div>
  );
};

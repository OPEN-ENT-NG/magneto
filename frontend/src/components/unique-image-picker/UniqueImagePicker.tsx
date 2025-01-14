import { ComponentPropsWithRef, useEffect, useState, useRef, FC } from "react";

import { IWebApp } from "@edifice.io/client";
import { IconButton } from "@edifice.io/react";
import { Avatar } from "@edifice.io/react";
import { AppIcon } from "@edifice.io/react";
import { IconDelete, IconEdit } from "@edifice.io/react/icons";
import clsx from "clsx";

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
          icon={<IconEdit />}
          onClick={() => onUploadImage(id)}
          type="button"
          variant="ghost"
        />
        <IconButton
          aria-label={deleteButtonLabel}
          color="danger"
          disabled={!preview}
          icon={<IconDelete width="20" height="20" />}
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

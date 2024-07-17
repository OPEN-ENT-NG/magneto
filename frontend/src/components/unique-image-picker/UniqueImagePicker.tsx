import React, { useRef, useCallback, useEffect } from "react";

import { ImagePicker, ImagePickerProps } from "@edifice-ui/react";

interface UniqueImagePickerProps extends ImagePickerProps {
  onImageChange: (file: File | null) => void;
}

const UniqueImagePicker: React.FC<UniqueImagePickerProps> = ({
  onImageChange,
  ...props
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const idRef = useRef(
    `image-picker-${Math.random().toString(36).substring(2, 11)}`,
  );
  const isClickingButton = useRef(false);

  const handleUploadImage = useCallback(
    (file: File) => {
      onImageChange(file);
    },
    [onImageChange],
  );

  const handleDeleteImage = useCallback(() => {
    onImageChange(null);
  }, [onImageChange]);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;

    const handleClick = (event: MouseEvent) => {
      if (wrapperElement && wrapperElement.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (target.tagName !== "INPUT" && !isClickingButton.current) {
          event.preventDefault();
          event.stopPropagation();
          inputRef.current?.click();
        }
      }
    };

    const handleButtonMouseDown = () => {
      isClickingButton.current = true;
    };

    const handleButtonMouseUp = () => {
      setTimeout(() => {
        isClickingButton.current = false;
      }, 0);
    };

    document.addEventListener("click", handleClick);

    const buttons = wrapperElement?.querySelectorAll("button");
    buttons?.forEach((button) => {
      button.addEventListener("mousedown", handleButtonMouseDown);
      button.addEventListener("mouseup", handleButtonMouseUp);
    });

    return () => {
      document.removeEventListener("click", handleClick);
      buttons?.forEach((button) => {
        button.removeEventListener("mousedown", handleButtonMouseDown);
        button.removeEventListener("mouseup", handleButtonMouseUp);
      });
    };
  }, []);

  return (
    <div ref={wrapperRef} id={idRef.current}>
      <ImagePicker
        {...props}
        onUploadImage={handleUploadImage}
        onDeleteImage={handleDeleteImage}
        ref={(el) => {
          if (el) {
            inputRef.current = el.querySelector('input[type="file"]');
          }
        }}
      />
    </div>
  );
};

export default UniqueImagePicker;

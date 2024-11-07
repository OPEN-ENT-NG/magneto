import { useMemo } from "react";

type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

interface FileSize {
  value: number;
  unit: FileSizeUnit;
}

export const useFileSize = (sizeInBytes: number): FileSize => {
  return useMemo(() => {
    const units: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB"];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return {
      value: Number(size.toFixed(1)),
      unit: units[unitIndex],
    };
  }, [sizeInBytes]);
};

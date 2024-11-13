import { EXTENSION_FORMAT } from "./extension-format.const";

export const FILE_VALIDATION_CONFIG: {
  allowedExtensions: string[];
  maxSizeInBytes: number;
} = {
  allowedExtensions: Object.values(EXTENSION_FORMAT).flatMap((ext) => ext),
  maxSizeInBytes: 50 * 1024 * 1024, // 50MB
};

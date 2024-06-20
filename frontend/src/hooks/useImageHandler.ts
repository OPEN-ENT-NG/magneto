import { useEffect, useState } from "react";

import { odeServices } from "edifice-ts-client";

export default function useImageHandler(initialCover: string | Blob | File) {
    const [cover, setCover] = useState<string | Blob | File>(initialCover);

    useEffect(() => {
        setCover(initialCover);
    }, [initialCover]);

    const handleUploadImage = (file: File) => setCover(file);

    const handleDeleteImage = () => setCover("");

    const fetchCoverBlob = async (): Promise<Blob> => {
        if (typeof cover === "string") {
            return await odeServices.http().get(cover, {
                responseType: "blob",
            });
        } else if (cover) {
            return await odeServices
                .http()
                .get(URL.createObjectURL(cover as Blob), {
                    responseType: "blob",
                });
        }
        return new Blob();
    };

    return {
        cover,
        handleUploadImage,
        handleDeleteImage,
        fetchCoverBlob,
    };
}
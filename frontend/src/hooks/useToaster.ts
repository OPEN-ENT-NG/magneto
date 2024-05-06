import { useEffect, useState } from "react";

export const useToaster = () => {
    const [isToasterOpen, setIsToasterOpen] = useState<boolean>(true);

    useEffect(() => {
        console.log(isToasterOpen);
        setIsToasterOpen(!isToasterOpen);
    }, []);

    return {
        isToasterOpen,
    };
}
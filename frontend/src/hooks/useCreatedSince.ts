import { useState, useEffect } from "react";
import {
  format,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale";

const formatCreatedSince = (date: Date, now: Date): string => {
  const diffSeconds = differenceInSeconds(now, date);
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffSeconds < 60) return "à l'instant";
  if (diffMinutes < 60)
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 30) return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  return format(date, "dd MMMM yyyy", { locale: fr });
};

const useCreatedSince = (dateString: string): string => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const updateFormattedDate = () => {
      const date = new Date(dateString);
      const now = new Date();
      setFormattedDate(formatCreatedSince(date, now));
    };

    updateFormattedDate();
    const intervalId = setInterval(updateFormattedDate, 60000); // Met à jour chaque minute

    return () => clearInterval(intervalId);
  }, [dateString]);

  return formattedDate;
};

export default useCreatedSince;

// Exemple d'utilisation :
// const MyComponent: React.FC = () => {
//   const someDate = '2024-09-10T13:00:00';
//   const formattedDate = useCreatedSince(someDate);
//
//   return <div>{formattedDate}</div>;
// };

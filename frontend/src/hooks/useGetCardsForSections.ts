import { useState, useEffect } from "react";
import { Card } from "~/models/card.model";
import { useGetAllCardsBySectionQuery } from "~/services/api/cards.service";

interface UseGetCardsForSectionsResult {
  cardsBySection: Map<string, Card[]>;
  isLoading: boolean;
  error: any;
}

const useGetCardsForSections = (
  sectionIds: string[],
): UseGetCardsForSectionsResult => {
  const [cardsBySection, setCardsBySection] = useState<Map<string, Card[]>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cardsMap = new Map<string, Card[]>();

        // Effectuer les appels pour chaque sectionId
        await Promise.all(
          sectionIds.map(async (sectionId) => {
            const { data, error } = useGetAllCardsBySectionQuery(sectionId);

            if (error) {
              throw error;
            }

            if (data) {
              cardsMap.set(sectionId, data);
            }
          }),
        );

        setCardsBySection(cardsMap);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (sectionIds.length > 0) {
      fetchCards();
    } else {
      setIsLoading(false); // Pas de sections à charger
    }
  }, [sectionIds]);

  return { cardsBySection, isLoading, error };
};

export default useGetCardsForSections;

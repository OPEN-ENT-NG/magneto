import { useState, useEffect } from "react";

interface UseHtmlGetReturn {
  html: string;
  loading: boolean;
  error: string | null;
}

interface ApiResponse {
  html: string;
}

interface ApiError {
  error: string;
}

/**
 * Hook pour récupérer le HTML d'une URL
 */
const useHtmlGet = (url: string): UseHtmlGetReturn => {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setHtml("");
      setError(null);
      return;
    }

    const fetchHtml = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/get-html", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }

        const data = (await response.json()) as ApiResponse | ApiError;

        if ("error" in data) {
          throw new Error(data.error);
        }

        setHtml(data.html || "");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        setHtml("");
      } finally {
        setLoading(false);
      }
    };

    void fetchHtml();
  }, [url]);

  return { html, loading, error };
};

export default useHtmlGet;

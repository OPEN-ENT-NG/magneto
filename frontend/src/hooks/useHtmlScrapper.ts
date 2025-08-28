import { useCallback, useMemo } from "react";

import { useFetchRawHtmlMutation } from "~/services/api/cards.service";

// types/htmlScraping.ts
export interface RawHtmlResponse {
  html: string;
  url: string;
  contentType?: string;
  timestamp: number;
}

export interface ScrapedContent {
  originalUrl: string;
  cleanHtml: string;
  title: string;
  timestamp: number;
  contentType?: string;
}

export interface HtmlScrapingError {
  error: string;
  message?: string;
  status?: number | string;
}

interface UseHtmlScrapperReturn {
  scrapedContent: ScrapedContent | null;
  scrape: (urlToScrape?: string) => Promise<ScrapedContent>;
  isLoading: boolean;
  error: HtmlScrapingError | null;
  reset: () => void;
  isValidUrl: boolean;
}

interface UseHtmlScrapperParams {
  url?: string;
}

// Pour RTK Query
export interface FetchHtmlRequest {
  url: string;
}

// ===== FONCTIONS UTILITAIRES =====

const removeElements = (doc: Document, selectors: string[]): void => {
  selectors.forEach((selector) => {
    try {
      doc.querySelectorAll(selector).forEach((el) => el.remove());
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
    }
  });
};

const fixUrls = (doc: Document, baseUrl: string): void => {
  try {
    const base = new URL(baseUrl);

    // Fixer les images
    doc.querySelectorAll<HTMLImageElement>("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      if (
        src &&
        !src.startsWith("http") &&
        !src.startsWith("data:") &&
        !src.startsWith("//")
      ) {
        try {
          img.src = new URL(src, base).toString();
        } catch (e) {
          console.warn(`Invalid image URL: ${src}`, e);
          img.remove();
        }
      }
    });

    // Fixer les liens CSS
    doc
      .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      .forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("//")) {
          try {
            link.href = new URL(href, base).toString();
          } catch (e) {
            console.warn(`Invalid CSS URL: ${href}`, e);
          }
        }
      });

    // Fixer les autres liens
    doc.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (
        href &&
        !href.startsWith("http") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("#") &&
        !href.startsWith("//")
      ) {
        try {
          link.href = new URL(href, base).toString();
        } catch (e) {
          console.warn(`Invalid link URL: ${href}`, e);
        }
      }
    });
  } catch (e) {
    console.error("URL fixing error:", e);
  }
};

const optimizeStyles = (doc: Document): void => {
  // Nettoyer les styles inline potentiellement dangereux
  doc.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
    const style = element.getAttribute("style");
    if (style) {
      // Supprimer les propriétés CSS dangereuses
      const cleanStyle = style
        .replace(/expression\s*\([^)]*\)/gi, "") // IE expressions
        .replace(/javascript\s*:/gi, "") // JavaScript dans les CSS
        .replace(/url\s*\(\s*javascript\s*:/gi, ""); // JavaScript dans les URLs CSS

      element.setAttribute("style", cleanStyle);
    }
  });

  // Optimiser les balises style internes
  doc.querySelectorAll<HTMLStyleElement>("style").forEach((style) => {
    if (style.textContent) {
      // Supprimer les commentaires CSS et espaces inutiles
      const cleanedContent = style.textContent
        .replace(/\/\*[\s\S]*?\*\//g, "") // Commentaires CSS
        .replace(/\s+/g, " ") // Espaces multiples
        .trim();

      style.textContent = cleanedContent;
    }
  });
};

/**
 * Nettoie les délimiteurs LaTeX d'une formule mathématique
 */
const cleanLatexDelimiters = (latex: string): string => {
  let result = latex;

  // Mappings des délimiteurs LaTeX vers leurs équivalents simples
  const delimiterMappings: Record<string, string> = {
    // Barres absolues et normes
    "\\left\\|": "‖",
    "\\right\\|": "‖",
    "\\left|": "|",
    "\\right|": "|",

    // Parenthèses
    "\\left(": "(",
    "\\right)": ")",

    // Crochets
    "\\left[": "[",
    "\\right]": "]",

    // Accolades
    "\\left\\{": "{",
    "\\right\\}": "}",

    // Chevrons
    "\\left\\langle": "⟨",
    "\\right\\rangle": "⟩",

    // Plafonds et planchers
    "\\left\\lceil": "⌈",
    "\\right\\rceil": "⌉",
    "\\left\\lfloor": "⌊",
    "\\right\\rfloor": "⌋",

    // Autres délimiteurs courants
    "\\left.": "", // délimiteur invisible
    "\\right.": "", // délimiteur invisible

    // Espaces LaTeX
    "\\,": " ", // petit espace
    "\\:": " ", // espace moyen
    "\\;": " ", // grand espace
    "\\quad": "  ", // espace quadruple
    "\\qquad": "    ", // espace octuple
    "\\ ": " ", // espace forcé
  };

  // Remplacer dans l'ordre des plus longs aux plus courts
  const sortedKeys = Object.keys(delimiterMappings).sort(
    (a, b) => b.length - a.length,
  );

  sortedKeys.forEach((latexDelimiter) => {
    const replacement = delimiterMappings[latexDelimiter];
    // Échapper les caractères spéciaux pour la regex
    const escapedDelimiter = latexDelimiter.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const regex = new RegExp(escapedDelimiter, "g");
    result = result.replace(regex, replacement);
  });

  // Nettoyer les espaces multiples
  result = result.replace(/\s+/g, " ").trim();

  return result;
};

const extractKaTeXFormulas = (doc: Document): void => {
  try {
    const katexWrappers = doc.querySelectorAll(".katex-wrapper");
    let formulasExtracted = 0;

    katexWrappers.forEach((wrapper) => {
      try {
        const annotation = wrapper.querySelector(
          'annotation[encoding="application/x-tex"]',
        );

        if (annotation && annotation.textContent) {
          const latexFormula = annotation.textContent.trim();

          // Nettoyer les délimiteurs LaTeX
          const cleanedFormula = cleanLatexDelimiters(latexFormula);

          const isDisplayMode =
            wrapper.querySelector(".katex-display") !== null;

          // Créer l'élément de remplacement
          const mathElement = doc.createElement("span");
          mathElement.className = isDisplayMode
            ? "math-display"
            : "math-inline";
          mathElement.textContent = cleanedFormula; // Utiliser la formule nettoyée
          mathElement.setAttribute("title", latexFormula); // Garder l'original en tooltip

          // Gérer le cas spécial des paragraphes tex-par pour display
          const texParent = wrapper.closest("p.tex-par");
          if (texParent && isDisplayMode && texParent.children.length === 1) {
            const mathDiv = doc.createElement("div");
            mathDiv.className = "math-display";
            mathDiv.textContent = cleanedFormula; // Utiliser la formule nettoyée
            mathDiv.setAttribute("title", latexFormula); // Garder l'original en tooltip
            texParent.parentNode?.replaceChild(mathDiv, texParent);
          } else {
            wrapper.parentNode?.replaceChild(mathElement, wrapper);
          }

          console.log(`Formule nettoyée: ${latexFormula} → ${cleanedFormula}`);
          formulasExtracted++;
        }
      } catch (error) {
        console.warn("Erreur extraction formule:", error);
      }
    });

    if (formulasExtracted > 0) {
      console.log(`${formulasExtracted} formules KaTeX extraites`);
    }

    // Nettoyer les résidus KaTeX
    doc
      .querySelectorAll(
        ".katex, .katex-wrapper, .katex-display, .katex-html, .katex-mathml",
      )
      .forEach((el) => el.remove());
  } catch (error) {
    console.error("Erreur extraction KaTeX:", error);
  }
};

const extractTitle = (htmlString: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const titleElement = doc.querySelector("title");
    return titleElement?.textContent?.trim() || "";
  } catch (error) {
    console.error("Title extraction error:", error);
    return "";
  }
};

const cleanHtml = (htmlString: string, baseUrl: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Vérifier si le parsing a réussi
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      throw new Error("HTML parsing failed");
    }

    // Extraire les formules KaTeX en premier
    extractKaTeXFormulas(doc);

    // Supprimer les éléments indésirables
    const selectorsToRemove: string[] = [
      "script",
      "noscript",
      'iframe[src*="analytics"]',
      'iframe[src*="google-analytics"]',
      'iframe[src*="facebook"]',
      'iframe[src*="twitter"]',
      "nav",
      "header",
      "footer",
      ".navbar",
      ".nav-bar",
      ".navigation",
      ".sidebar",
      ".side-bar",
      ".menu",
      ".advertisement",
      ".ads",
      ".ad",
      ".cookie-banner",
      ".cookie-notice",
      ".popup",
      ".modal",
      "meta[http-equiv]",
      "base",
      ".social-share",
      ".share-buttons",
      ".comments",
      ".comment-section",
      ".related-articles",
      ".recommended",
    ];

    removeElements(doc, selectorsToRemove);

    // Supprimer les attributs d'événements dangereux
    const dangerousAttributes = [
      "onclick",
      "onload",
      "onerror",
      "onmouseover",
      "onmouseout",
      "onfocus",
      "onblur",
      "onsubmit",
      "onchange",
      "onkeydown",
      "onkeyup",
      "onmousedown",
      "onmouseup",
      "ondblclick",
      "oncontextmenu",
    ];

    doc.querySelectorAll("*").forEach((element) => {
      dangerousAttributes.forEach((attr) => element.removeAttribute(attr));

      // Supprimer les attributs data potentiellement problématiques
      Array.from(element.attributes).forEach((attr) => {
        if (
          attr.name.startsWith("data-track") ||
          attr.name.startsWith("data-analytics") ||
          attr.name.startsWith("data-ga")
        ) {
          element.removeAttribute(attr.name);
        }
      });
    });

    // Corriger les URLs relatives
    fixUrls(doc, baseUrl);

    // Optimiser les styles
    optimizeStyles(doc);

    // Nettoyer les éléments vides ou inutiles
    doc.querySelectorAll("div, span, p").forEach((element) => {
      // Préserver les éléments mathématiques
      if (
        element.classList.contains("math-display") ||
        element.classList.contains("math-inline")
      ) {
        return;
      }

      if (
        !element.textContent?.trim() &&
        !element.querySelector("img, video, audio, canvas, svg") &&
        !element.querySelector(".math-display, .math-inline")
      ) {
        element.remove();
      }
    });

    return doc.documentElement.outerHTML;
  } catch (error) {
    console.error("HTML cleaning error:", error);
    return htmlString;
  }
};

// Fonction utilitaire pour convertir en format TipTap
export const convertHtmlForTipTap = (cleanHtml: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, "text/html");

    // Convertir math-display
    doc.querySelectorAll(".math-display").forEach((element) => {
      const latexContent = element.textContent || "";
      const mathDiv = doc.createElement("div");
      mathDiv.setAttribute("data-type", "mathematics");
      mathDiv.setAttribute("data-display", "block");
      mathDiv.textContent = latexContent;
      element.parentNode?.replaceChild(mathDiv, element);
    });

    // Convertir math-inline
    doc.querySelectorAll(".math-inline").forEach((element) => {
      const latexContent = element.textContent || "";
      const mathSpan = doc.createElement("span");
      mathSpan.setAttribute("data-type", "mathematics");
      mathSpan.setAttribute("data-display", "inline");
      mathSpan.textContent = latexContent;
      element.parentNode?.replaceChild(mathSpan, element);
    });

    return doc.body.innerHTML;
  } catch (error) {
    console.error("Erreur conversion TipTap:", error);
    return cleanHtml;
  }
};

// ===== HOOK PRINCIPAL =====

export const useHtmlScraper = (
  params?: UseHtmlScrapperParams,
): UseHtmlScrapperReturn => {
  const { url } = params || {};

  const [
    fetchRawHtml,
    { data: rawData, isLoading, error: rtqError, reset: resetMutation },
  ] = useFetchRawHtmlMutation();

  // Validation de l'URL
  const isValidUrl = useMemo((): boolean => {
    if (!url) return false;

    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  }, [url]);

  // Transformation de l'erreur
  const error = useMemo((): HtmlScrapingError | null => {
    if (!rtqError) return null;

    if ("status" in rtqError) {
      return {
        error: "Network error",
        status: rtqError.status,
      };
    }

    if ("message" in rtqError) {
      return {
        error: "Request failed",
        message: rtqError.message,
      };
    }

    return {
      error: "Unknown error",
      message: String(rtqError),
    };
  }, [rtqError]);

  // Traitement et nettoyage du HTML récupéré
  const scrapedContent = useMemo((): ScrapedContent | null => {
    if (!rawData || !url) return null;

    try {
      const cleanedHtml = cleanHtml(rawData.html, rawData.url);
      const title = extractTitle(rawData.html);

      return {
        originalUrl: rawData.url,
        cleanHtml: cleanedHtml,
        title,
        timestamp: rawData.timestamp,
        contentType: rawData.contentType,
      };
    } catch (error) {
      console.error("HTML processing error:", error);
      return null;
    }
  }, [rawData, url]);

  // Fonction pour déclencher manuellement le scraping
  const scrape = useCallback(
    async (urlToScrape?: string): Promise<ScrapedContent> => {
      const targetUrl = urlToScrape || url;

      if (!targetUrl) {
        throw new Error("Invalid or missing URL");
      }

      // Validation de l'URL cible
      try {
        new URL(targetUrl);
        if (
          !targetUrl.startsWith("http://") &&
          !targetUrl.startsWith("https://")
        ) {
          throw new Error("URL must start with http:// or https://");
        }
      } catch {
        throw new Error("Invalid URL format");
      }

      try {
        const rawResult = await fetchRawHtml(targetUrl).unwrap();

        const cleanedHtml = cleanHtml(rawResult.html, rawResult.url);
        const title = extractTitle(rawResult.html);

        return {
          originalUrl: rawResult.url,
          cleanHtml: cleanedHtml,
          title,
          timestamp: rawResult.timestamp,
          contentType: rawResult.contentType,
        };
      } catch (err) {
        console.error("Scraping error:", err);

        if (err && typeof err === "object" && "message" in err) {
          throw new Error(`Scraping failed: ${err.message}`);
        }

        throw new Error("Failed to scrape and clean HTML content");
      }
    },
    [url, fetchRawHtml],
  );

  // Reset function qui nettoie tout
  const reset = useCallback(() => {
    resetMutation();
  }, [resetMutation]);

  return {
    scrapedContent,
    scrape,
    isLoading,
    error,
    reset,
    isValidUrl,
  };
};

import { useEffect } from "react";
import { LoadingScreen, Layout, useEdificeClient } from "@edifice.io/react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "~/components/error-boundary";
import PublicLayout from "~/components/public-layout/PublicLayout";

function Root() {
  const { init } = useEdificeClient();
  const isInIframe = window.self !== window.top;

  useEffect(() => {
    if (isInIframe) {
      let observer: MutationObserver | null = null;

      // Fonction pour cacher le header
      const hideHeader = () => {
        const header = document.querySelector("header.no-1d") as HTMLElement;

        if (header) {
          // Header trouvé, on le cache
          header.style.display = "none";

          // Arrêter l'observer puisqu'on a trouvé et caché le header
          if (observer) {
            observer.disconnect();
            observer = null;
          }

          return true; // Header trouvé et caché
        }
        return false; // Header non trouvé
      };

      // Essayer immédiatement (au cas où)
      if (!hideHeader()) {
        // Si le header n'est pas encore là, configurer l'observer
        observer = new MutationObserver(() => {
          hideHeader();
        });

        // Observer tout le document
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }

      // Nettoyer l'observer si le composant est démonté
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [isInIframe]);

  if (window.location.hash.includes("/pub/"))
    return (
      <PublicLayout>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </PublicLayout>
    );
  if (!init) {
    return <LoadingScreen position={false} />;
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Layout>
  );
}

export default Root;

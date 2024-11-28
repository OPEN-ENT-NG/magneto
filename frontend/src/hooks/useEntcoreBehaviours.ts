import { useState, useEffect } from "react";

export const useEntcoreBehaviours = () => {
  const [behaviours, setBehaviours] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScripts = () => {
      const script1 = document.createElement("script");
      script1.src = "/assets/js/entcore/ng-app.js";

      script1.onload = () => {
        const script2 = document.createElement("script");
        script2.src = "/lool/public/js/behaviours.js";

        script2.onload = () => {
          if (window.entcore && window.entcore.Behaviours) {
            const initPromise = new Promise<void>((resolve) => {
              try {
                window.entcore.Behaviours.applicationsBehaviours["lool"].init();
                resolve();
              } catch (error) {
                console.error("Initialization error:", error);
                resolve();
              }
            });

            initPromise.then(() => {
              setBehaviours(window.entcore.Behaviours);
              setIsLoading(false);
            });
          }
        };

        document.body.appendChild(script2);
      };

      document.body.appendChild(script1);
    };

    if (!window.entcore) {
      loadScripts();
    } else {
      const initPromise = new Promise<void>((resolve) => {
        try {
          window.entcore.Behaviours.applicationsBehaviours["lool"].init();
          resolve();
        } catch (error) {
          console.error("Initialization error:", error);
          resolve();
        }
      });

      initPromise.then(() => {
        setBehaviours(window.entcore.Behaviours);
        setIsLoading(false);
      });
    }

    return () => {
      const scripts = document.body.querySelectorAll(
        'script[src*="ng-app.js"], script[src*="behaviours.js"]',
      );
      scripts.forEach((script) => script.remove());
    };
  }, []);

  return { behaviours, isLoading };
};

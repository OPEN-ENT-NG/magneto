import { useState, useEffect } from "react";

export const useEntcoreBehaviours = () => {
  const [behaviours, setBehaviours] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScripts = () => {
      const script1 = document.createElement("script");
      script1.src = "/assets/js/entcore/ng-app.js";

      script1.onload = () => {
        const script2 = document.createElement("script");
        script2.src = "/lool/public/js/behaviours.js?_=1732545009089";

        script2.onload = () => {
          if (window.entcore && window.entcore.Behaviours) {
            setBehaviours(window.entcore.Behaviours);
            setIsLoading(false);
          }
        };

        document.body.appendChild(script2);
      };

      document.body.appendChild(script1);
    };

    if (!window.entcore) {
      loadScripts();
    } else {
      setBehaviours(window.entcore.Behaviours);
      setIsLoading(false);
    }
  }, []);

  return { behaviours, isLoading };
};

// utils/filterToast.ts
export const initToastFilter = () => {
  // Observer les mutations du DOM pour détecter les nouveaux toasts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Chercher les toasts avec le message indésirable
          const toasts = node.querySelectorAll(".alert-danger.is-toast");
          toasts.forEach((toast) => {
            if (toast.textContent?.includes("Temps d'attente dépassé")) {
              (toast as HTMLElement).style.display = "none";
            }
          });

          // Si le node lui-même est un toast
          if (
            node.classList?.contains("is-toast") &&
            node.textContent?.includes("Temps d'attente dépassé")
          ) {
            node.style.display = "none";
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CustomIframeProps {
  src: string;
  width?: number;
  height?: number;
}

export const CustomIframe: React.FC<CustomIframeProps> = ({ 
  src, 
  width = 1500, 
  height = 800 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  const adjustIframeScale = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      // Utiliser un délai pour s'assurer que le contenu est chargé
      setTimeout(() => {
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument || iframeWindow?.document;
        
        if (!iframeDocument) return;

        // Essayer différentes méthodes pour obtenir les dimensions
        const contentWidth = Math.max(
          iframeDocument.body?.scrollWidth || 0,
          iframeDocument.documentElement?.scrollWidth || 0,
          iframeWindow?.innerWidth || 0
        );
        
        const contentHeight = Math.max(
          iframeDocument.body?.scrollHeight || 0,
          iframeDocument.documentElement?.scrollHeight || 0,
          iframeWindow?.innerHeight || 0
        );

        // Calculer l'échelle
        const scaleX = width / contentWidth;
        const scaleY = height / contentHeight;
        
        // Prendre le zoom le plus petit, mais sans dépasser 1
        const newScale = Math.min(scaleX, scaleY, 1);
        
        // Mettre à jour le state pour déclencher un re-render
        setScale(newScale);

        console.log('Iframe Scaling:', {
          contentWidth, 
          contentHeight, 
          scaleX, 
          scaleY, 
          finalScale: newScale
        });
      }, 1000); // Délai plus long pour charger le contenu
    } catch (error) {
      console.error('Erreur de scaling de l\'iframe:', error);
    }
  }, [width, height]);

  // Gérer le chargement et le scaling
  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
    adjustIframeScale();
    
    // Ajouter un écouteur de redimensionnement
    window.addEventListener('resize', adjustIframeScale);
    
    return () => {
      window.removeEventListener('resize', adjustIframeScale);
    };
  }, [adjustIframeScale]);

  // Effet pour gérer l'événement de chargement
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
      };
    }
  }, [handleIframeLoad]);

  return (
    <div 
      style={{ 
        width: '100%', 
        maxWidth: `${width}px`, 
        height, 
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Scaled Iframe"
      />
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          Chargement...
        </div>
      )}
    </div>
  );
};
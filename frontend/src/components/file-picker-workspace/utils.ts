export const getFileExtension = (filename: string) => {
  // Si le nom de fichier est vide ou n'est pas une chaîne, on retourne une chaîne vide
  if (typeof filename !== "string" || filename.length === 0) {
    return "";
  }

  // On divise le nom de fichier par les points
  const parts = filename.split(".");

  // Si le fichier commence par un point mais n'a pas d'extension explicite (ex: ".bashrc")
  if (parts.length === 1 || (parts[0] === "" && parts.length === 2)) {
    return "";
  }

  // On récupère la dernière partie (extension)
  const extension = parts.pop();

  // On s'assure que l'extension n'est pas indéfinie, sinon on renvoie une chaîne vide
  return extension ? extension.toLowerCase() : "";
};

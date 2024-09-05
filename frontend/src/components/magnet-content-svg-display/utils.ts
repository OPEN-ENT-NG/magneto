const checkFaviconUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok ? url : null;
  } catch (error) {
    console.error(`Error checking favicon at ${url}:`, error);
    return null;
  }
};

export const getFavicon = async (url: string): Promise<string | null> => {
  console.log(`Attempting to fetch favicon for URL: ${url}`);

  try {
    const parser = new URL(url);
    const baseUrl = `${parser.protocol}//${parser.hostname}`;
    console.log(`Base URL: ${baseUrl}`);

    const locations = [
      `${baseUrl}/favicon.ico`,
      `${baseUrl}/favicon.png`,
      `${baseUrl}/apple-touch-icon.png`,
      `${baseUrl}/apple-touch-icon-precomposed.png`,
    ];

    const results = await Promise.all(locations.map(checkFaviconUrl));
    const faviconUrl = results.find((result) => result !== null);

    if (faviconUrl) {
      console.log(`Favicon found at: ${faviconUrl}`);
      return faviconUrl;
    }

    console.log("No favicon found at common locations");
    return null;
  } catch (error) {
    console.error("Error in getFavicon:", error);
    return null;
  }
};

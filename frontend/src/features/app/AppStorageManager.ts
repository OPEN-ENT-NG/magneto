// @ts-ignore
import { PersistenceManager } from "@edifice-wisemapping/editor";

import { DEFAULT_MAP } from "~/config/default-map";
import { updateApp } from "~/services/api";

class AppStorageManager extends PersistenceManager {
  private documentUrl: string;
  private mapName: string;

  constructor(documentUrl: string, mapName: string) {
    super();
    this.documentUrl = documentUrl;
    this.mapName = mapName;
  }

  saveMapXml(_mapId: string, mapDoc: Document): void {
    const mapXml = new XMLSerializer().serializeToString(mapDoc);

    const body = {
      name: this.mapName,
      map: mapXml,
    };

    if (body) {
      updateApp(this.documentUrl, body);
    }
  }

  loadMapDom(): Promise<Document> {
    const result: Promise<Document> = fetch(this.documentUrl, {
      method: "GET",
    })
      .then((response: Response) => {
        if (!response.ok) {
          console.error(`Response: ${response.status}`);
          throw new Error(
            `Response: ${response.status}, ${response.statusText}`,
          );
        }
        return response.json();
      })
      .then((data) => {
        return data.map ? data.map : DEFAULT_MAP(data?.name);
      })
      .then((xmlStr) => new DOMParser().parseFromString(xmlStr, "text/xml"));

    return result;
  }
}

export default AppStorageManager;

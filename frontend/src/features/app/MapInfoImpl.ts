// @ts-ignore
import { MapInfo } from "@edifice-wisemapping/editor";

class MapInfoImpl implements MapInfo {
  private id: string;
  private title: string;
  private locked: boolean;
  private starred: boolean;
  // private lockedMsg: string | undefined;

  constructor(
    id: string,
    title: string,
    locked: boolean /* lockedMgsg?: strin */,
  ) {
    this.id = id;
    this.title = title;
    this.locked = locked;
    // this.lockedMsg = lockedMsg;
    this.starred = true;
  }

  isStarred(): Promise<boolean> {
    return Promise.resolve(this.starred);
  }

  updateStarred(value: boolean): Promise<void> {
    this.starred = value;
    return Promise.resolve();
  }

  getTitle(): string {
    return this.title;
  }

  setTitle(value: string): void {
    throw (this.title = value);
  }

  isLocked(): boolean {
    return this.locked;
  }

  getLockedMessage(): string {
    return "Map Is Locked !";
  }

  getZoom(): number {
    return 0.8;
  }

  getId(): string {
    return this.id;
  }
}
export default MapInfoImpl;

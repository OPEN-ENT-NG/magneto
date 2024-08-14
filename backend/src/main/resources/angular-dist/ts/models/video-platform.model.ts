import {videoPlatformService} from "../services/video-platform.service";
import {VIDEO_PLATFORMES} from "../core/constants/video-platform.const";


interface IVideoPlatform {
    getThumbnail(): Promise<string> | string;
}

export abstract class VideoPlatform implements IVideoPlatform {
    protected constructor(protected url: string) {
        this.url = url;
    }

    abstract getThumbnail(): Promise<string> | string;
}

export class PeerTube extends VideoPlatform {
    constructor(url: string) {
        super(url);
    }

    getThumbnail(): Promise<string> {
        return videoPlatformService.getPeertubeThumbnail(this.extractDomain(), this.extractDomain() + VIDEO_PLATFORMES.peertube.replace('{id}', this.extractVideoID()));
    }

    private extractVideoID(): string {
        const match = this.url.match(/\/([^/]+)$/);
        return match ? match[1] : '';
    }

    private extractDomain(): string {
        const match = this.url.match(/^(https?:\/\/[^\/]+)/i);
        return match ? match[1] : '';
    }
}

export class Vimeo extends VideoPlatform {
    constructor(url: string) {
        super(url);
    }

    getThumbnail(): Promise<string> {
        return videoPlatformService.getVimeoThumbnail(VIDEO_PLATFORMES.vimeo + this.url);
    }
}

export class Dailymotion extends VideoPlatform {
    constructor(url: string) {
        super(url);
    }

    getThumbnail(): string {
        return VIDEO_PLATFORMES.dailymotion.replace('{id}', this.extractVideoID());
    }

    private extractVideoID(): string {
        const match = this.url.match(/\/video\/([^/]+)$/);
        return match ? match[1] : '';
    }
}

export class Youtube extends VideoPlatform {
    constructor(url: string) {
        super(url);
    }

    getThumbnail(): string {
        return VIDEO_PLATFORMES.youtube.replace('{id}', this.extractVideoID());
    }

    private extractVideoID(): string {
        const match = this.url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : '';
    }
}

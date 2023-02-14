import {EXTENSION_FORMAT} from "../core/constants/extension-format.const";
import {Card, IMetadata} from "../models";
import {RESOURCE_TYPE} from "../core/enums/resource-type.enum";

export class WorkspaceUtils {

    static getExtension = (metadata: IMetadata): string => {
        let result: string = RESOURCE_TYPE.DEFAULT;
        if (!!metadata.filename) {
            let extension: string;
            extension = metadata.filename.split('.').pop();
            result = this.getExtensionType(extension);
        }
        return result;
    }

    static getExtensionType = (extension: string): string => {
        for(let extensionElement in EXTENSION_FORMAT) {
            if(extensionElement.includes(extension)) return extensionElement;
        }
        return RESOURCE_TYPE.DEFAULT
    }
}
export interface Draggable {
    dragHoverHandler?(event: DragEvent, content?:any): void; // Called when the item is hover on target
    dragConditionHandler?(event: DragEvent, content?: any): boolean; // Check if item can be dragged
    dragStartHandler?(event: DragEvent, content?: any): void; // Called when the item begin to be moved
    dragEndHandler?(event: DragEvent, content?: any): void; // Called when the item is dropped
    dropConditionHandler?(event: DragEvent, content?: any): boolean; // Check if item can be dropped on the target
    dragDropHandler?(event: DragEvent, content?: any): Promise<void>;
    dragDropFilesHandler?(files: FileList): Promise<void>; // Callback called when the item is dropped on target
}
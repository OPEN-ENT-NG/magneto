import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BoardView } from "~/components/board-view/BoardView";
import { BoardProvider } from "~/providers/BoardProvider";
import { MediaLibraryProvider } from "~/providers/MediaLibraryProvider";
import { SVGProvider } from "~/providers/SVGProvider";

export const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
       <BoardProvider>
      <SVGProvider>
        <MediaLibraryProvider>
          <BoardView />
        </MediaLibraryProvider>
      </SVGProvider>
    </BoardProvider>
    </DndProvider>

  );
};

// import { DndContext } from "@dnd-kit/core";
import { BoardView } from "~/components/board-view/BoardView";
import { BoardProvider } from "~/providers/BoardProvider";
import { MediaLibraryProvider } from "~/providers/MediaLibraryProvider";
import { SVGProvider } from "~/providers/SVGProvider";

export const App = () => {
  return (
    <BoardProvider>
      <SVGProvider>
        <MediaLibraryProvider>
          <BoardView />
        </MediaLibraryProvider>
      </SVGProvider>
    </BoardProvider>
  );
};

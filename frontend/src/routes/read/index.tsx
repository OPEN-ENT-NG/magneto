import { ReadView } from "~/components/read-view/ReadView";
import { BoardProvider } from "~/providers/BoardProvider";
import { SVGProvider } from "~/providers/SVGProvider";

export const App = () => {
  return (
    <BoardProvider>
      <SVGProvider>
        <ReadView />
      </SVGProvider>
    </BoardProvider>
  );
};

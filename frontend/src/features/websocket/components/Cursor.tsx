import * as React from 'react';

import { usePerfectCursor } from '../hooks/usePerfectCursor';

export function Cursor({
  userId,
  point,
}: {
    userId: string | undefined;
    point: number[];
}) {
  const rCursor = React.useRef<HTMLDivElement>(null);

  const animateCursor = React.useCallback((point: number[]) => {
    const elm = rCursor.current;
    if (!elm) return;
    elm.style.setProperty(
      'transform',
      `translate(${point[0]}px, ${point[1]}px)`,
    );
  }, []);

  const onPointMove = usePerfectCursor(animateCursor);

  React.useLayoutEffect(() => onPointMove(point), [onPointMove, point]);

  return (
    <div
      ref={rCursor}
      style={{
        position: 'absolute',
        zIndex: 99,
        top: -60,
        left: -15,
        width: 44,
        height: 44,
      }}
    >
    <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        >
        <g fill="rgba(0,0,0,.2)" transform="translate(1,1)">
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
        </g>
        <g fill="white">
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
        </g>
        <g fill={"red"}>
            <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
            <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
        </g>
    </svg>
        <div className="cursor bg-secondary-500 border border-2 border-white text-white py-2 px-4 rounded">
            <strong className="caption">{userId}</strong>
        </div>
    </div>
  );
}
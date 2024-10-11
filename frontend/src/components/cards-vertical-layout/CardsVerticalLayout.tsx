import { FC } from "react";

import { CancelDrop, closestCenter, CollisionDetection, DndContext, KeyboardSensor, MeasuringStrategy, Modifiers, MouseSensor, rectIntersection, TouchSensor, UniqueIdentifier, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import { AnimateLayoutChanges, arrayMove, defaultAnimateLayoutChanges, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, SortingStrategy, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardWrapper,
  CardsWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";
import { unstable_batchedUpdates } from "react-dom";

interface Props {
    adjustScale?: boolean;
    cancelDrop?: CancelDrop;
    columns?: number;
    containerStyle?: React.CSSProperties;
    getItemStyles?(args: {
      value: UniqueIdentifier;
      index: number;
      overIndex: number;
      isDragging: boolean;
      containerId: UniqueIdentifier;
      isSorting: boolean;
      isDragOverlay: boolean;
    }): React.CSSProperties;
    wrapperStyle?(args: { index: number }): React.CSSProperties;
    itemCount?: number;
    items?: Items;
    handle?: boolean;
    renderItem?: any;
    strategy?: SortingStrategy;
    modifiers?: Modifiers;
    minimal?: boolean;
    trashable?: boolean;
    scrollable?: boolean;
    vertical?: boolean;
  }

  export const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";
const empty: UniqueIdentifier[] = [];


export const CardsVerticalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();

  if (!board.sections?.length) return null;
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });


  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: string) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  // Custom collision detection strategy optimized for multiple containers
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Start by finding any intersecting droppable
      let overId = rectIntersection(args);

      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
          )
        });
      }

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return overId;
        }

        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
              )
            });
          }
        }

        lastOverId.current = overId;

        return overId;
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current;
    },
    [activeId, items]
  );

  const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({...args, wasDragging: true});

  
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
    const [items, setItems] = useState<UniqueIdentifier[]>(
      () =>
        initialItems ??
        createRange<UniqueIdentifier>(itemCount, (index) => index + 1)
    );

    const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;

    const onDragStart = ({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      };

    const onDragOver = ({ active, over }) => {
        const overId = over?.id;

        if (!overId || overId === TRASH_ID || active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const overIndex = overItems.indexOf(overId);
            const activeIndex = activeItems.indexOf(active.id);

            let newIndex: number;

            if (overId in items) {
              newIndex = overItems.length + 1;
            } else {
              const isBelowOverItem =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.offsetTop >
                  over.rect.offsetTop + over.rect.height;

              const modifier = isBelowOverItem ? 1 : 0;

              newIndex =
                overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            recentlyMovedToNewContainer.current = true;

            return {
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (item) => item !== active.id
              ),
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(
                  newIndex,
                  items[overContainer].length
                )
              ]
            };
          });
        }
    };
      const onDragEnd = ({ active, over }) => {
        if (active.id in items && over?.id) {
          setContainers((containers) => {
            const activeIndex = containers.indexOf(active.id);
            const overIndex = containers.indexOf(over.id);

            return arrayMove(containers, activeIndex, overIndex);
          });
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (!overId) {
          setActiveId(null);
          return;
        }

        if (overId === TRASH_ID) {
          setItems((items) => ({
            ...items,
            [activeContainer]: items[activeContainer].filter(
              (id) => id !== activeId
            )
          }));
          setActiveId(null);
          return;
        }

        if (overId === PLACEHOLDER_ID) {
          const newContainerId = getNextContainerId();

          unstable_batchedUpdates(() => {
            setContainers((containers) => [...containers, newContainerId]);
            setItems((items) => ({
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (id) => id !== activeId
              ),
              [newContainerId]: [active.id]
            }));
            setActiveId(null);
          });
          return;
        }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = items[activeContainer].indexOf(active.id);
          const overIndex = items[overContainer].indexOf(overId);

          if (activeIndex !== overIndex) {
            setItems((items) => ({
              ...items,
              [overContainer]: arrayMove(
                items[overContainer],
                activeIndex,
                overIndex
              )
            }));
          }
        }

        setActiveId(null);
      };
      const onDragCancel = ({active: {id}}) => {
        return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
          id
        )} of ${items.length}.`;
      };

  return (
    <Box sx={mainWrapperProps}>
      <DndContext 
       sensors={sensors}
       collisionDetection={collisionDetectionStrategy}
       measuring={{
         droppable: {
           strategy: MeasuringStrategy.Always
         }
       }}
       onDragStart={onDragStart}
       onDragOver={onDragOver}
       onDragEnd={onDragEnd}
    //    cancelDrop={cancelDrop}
       onDragCancel={onDragCancel}
    //    modifiers={modifiers}

      >
        <SortableContext items={[...board.sections, ...PLACEHOLDER_ID]} strategy={
            horizontalListSortingStrategy
          }>
          {board.sections.map((section, sectionIndex) => (
            <SectionWrapper
              key={section._id}
              id={section._id}
              sectionNumber={
                hasEditRights()
                  ? board.sections.length + 1
                  : board.sections.length
              }
            >
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={section} />
              </Box>
              <CardsWrapper zoomLevel={zoomLevel}>
                <div ref={disabled ? undefined : setNodeRef}>
                  <SortableContext items={section.cards} strategy={verticalListSortingStrategy}>
                    {section.cards.map((card, cardIndex) => (
                      <CardWrapper key={card.id}>
                        <div ref={setNodeRef} style={style}>
                          <BoardCard
                            card={card}
                            zoomLevel={zoomLevel}
                            canComment={board.canComment}
                            displayNbFavorites={board.displayNbFavorites}
                            key={card}
                            value={card}
                            cardIndex={cardIndex}
                            sectionIndex={sectionIndex}
                            containerId={section._id}
                          />
                        </div>
                      </CardWrapper>
                    ))}
                  </SortableContext>
                </div>
              </CardsWrapper>
            </SectionWrapper>
          ))}
          {hasEditRights() && (
            <SectionWrapper
              sectionNumber={board.sections.length + 1}
              isLast={true}
            >
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={null} />
              </Box>
            </SectionWrapper>
          )}
        </SortableContext>
      </DndContext>
    </Box>
  );
};

// export const CardsVerticalLayout: FC = () => { return <div>hello</div> };
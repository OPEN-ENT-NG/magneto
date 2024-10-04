import { FC, useCallback, useEffect, useState } from "react";

// import { Announcements, DndContext, UniqueIdentifier, useDraggable } from "@dnd-kit/core";
// import { SortableContext, useSortable } from "@dnd-kit/sortable";
// import { Box } from "@mui/material";

// import {
//   SectionWrapper,
//   sectionNameWrapperStyle,
//   mainWrapperProps,
//   CardWrapper,
//   CardsWrapper,
// } from "./style";
// import { BoardCard } from "../board-card/BoardCard";
// import { SectionName } from "../section-name/SectionName";
// import { useBoard } from "~/providers/BoardProvider";

// export const CardsVerticalLayout: FC = () => {
//   const { board, zoomLevel, hasEditRights } = useBoard();

//   if (!board.sections?.length) return null;

//   const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
//   const animateLayoutChanges: AnimateLayoutChanges = (args) =>
//     defaultAnimateLayoutChanges({...args, wasDragging: true});

//   const {
//     active,
//     attributes,
//     isDragging,
//     listeners,
//     over,
//     setNodeRef,
//     transition,
//     transform,
//   } = useSortable({
//     id,
//     data: {
//       type: "container",
//       children: items,
//     },
//     animateLayoutChanges,
//   });

//   const style = transform
//     ? {
//         transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
//       }
//     : undefined;
//     const [items, setItems] = useState<UniqueIdentifier[]>(
//       () =>
//         initialItems ??
//         createRange<UniqueIdentifier>(itemCount, (index) => index + 1)
//     );

//     const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;

//     const announcements: Announcements = {
//       onDragStart({active: {id}}) {
//         return `Picked up sortable item ${String(
//           id
//         )}. Sortable item ${id} is in position ${getPosition(id)} of ${
//           items.length
//         }`;
//       },
//       onDragOver({active, over}) {
//         // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
//         // The first `onDragOver` event therefore doesn't need to be announced, because it is called
//         // immediately after the `onDragStart` announcement and is redundant.
//         if (isFirstAnnouncement.current === true) {
//           isFirstAnnouncement.current = false;
//           return;
//         }
  
//         if (over) {
//           return `Sortable item ${
//             active.id
//           } was moved into position ${getPosition(over.id)} of ${items.length}`;
//         }
  
//         return;
//       },
//       onDragEnd({active, over}) {
//         if (over) {
//           return `Sortable item ${
//             active.id
//           } was dropped at position ${getPosition(over.id)} of ${items.length}`;
//         }
  
//         return;
//       },
//       onDragCancel({active: {id}}) {
//         return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
//           id
//         )} of ${items.length}.`;
//       },
//     };

//     useEffect(() => {
//       if (!activeId) {
//         isFirstAnnouncement.current = true;
//       }
//     }, [activeId]);

//   return (
//     <Box sx={mainWrapperProps}>
//       <DndContext 
//        accessibility={{
//         announcements,
//         screenReaderInstructions,
//       }}
//       sensors={sensors}
//       collisionDetection={collisionDetection}
//       onDragStart={({active}) => {
//         if (!active) {
//           return;
//         }

//         setActiveId(active.id);
//       }}>
//         <SortableContext items={board.sections}>
//           {board.sections.map((section, sectionIndex) => (
//             <SectionWrapper
//               key={section._id}
//               sectionNumber={
//                 hasEditRights()
//                   ? board.sections.length + 1
//                   : board.sections.length
//               }
//             >
//               <Box sx={sectionNameWrapperStyle}>
//                 <SectionName section={section} />
//               </Box>
//               <CardsWrapper zoomLevel={zoomLevel}>
//                 <div ref={disabled ? undefined : setNodeRef}>
//                   <SortableContext items={section.cards}>
//                     {section.cards.map((card, cardIndex) => (
//                       <CardWrapper key={card.id}>
//                         <div ref={setNodeRef} style={style}>
//                           <BoardCard
//                             card={card}
//                             zoomLevel={zoomLevel}
//                             canComment={board.canComment}
//                             displayNbFavorites={board.displayNbFavorites}
//                             key={card.id}
//                             cardIndex={cardIndex}
//                             sectionIndex={sectionIndex}
//                           />
//                         </div>
//                       </CardWrapper>
//                     ))}
//                   </SortableContext>
//                 </div>
//               </CardsWrapper>
//             </SectionWrapper>
//           ))}
//           {hasEditRights() && (
//             <SectionWrapper
//               sectionNumber={board.sections.length + 1}
//               isLast={true}
//             >
//               <Box sx={sectionNameWrapperStyle}>
//                 <SectionName section={null} />
//               </Box>
//             </SectionWrapper>
//           )}
//         </SortableContext>
//       </DndContext>
//     </Box>
//   );
// };

export const CardsVerticalLayout: FC = () => { return <div>hello</div> };
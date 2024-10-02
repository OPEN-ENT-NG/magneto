// import { FC } from "react";

// import { Box } from "@mui/material";

// import {
//   CardWrapper,
//   CardsWrapper,
// } from "./style";
// import { BoardCard } from "../board-card/BoardCard";
// import { SectionName } from "../section-name/SectionName";
// import { useBoard } from "~/providers/BoardProvider";
// import { useDrop } from "react-dnd";
// import { DRAG_AND_DROP_TYPE } from "~/core/enums/drag-and-drop-type.enum";
// import { Card } from "~/models/card.model";

// interface CardBoardListProps {
//     cards: Card[];
//   }

// export const CardBoardList: FC<CardBoardListProps> = ({ cards }) => {
//   const { board, zoomLevel } = useBoard();

// //   const [{ isOver }, drop] = useDrop({
// //     accept: "card",
// //     // drop: () => setHasDrop(true),
// //     drop: () => console.log("drop"),
// //     collect: (monitor: any) => ({
// //       isOver: !!monitor.isOver(),
// //     }),
// //   });

//   if (!cards.length) return null;

//   return (
    
//         //   <div
//         //         ref={drop}
//         //         draggable="true"
//         //         // className={
//         //         //   isOver
//         //         //     ? DRAG_AND_DROP_TYPE.DRAG_OVER
//         //         //     : DRAG_AND_DROP_TYPE.NO_DRAG_OVER
//         //         // }
//         //         // key={card.id}
//         //       > 
//           <CardsWrapper zoomLevel={zoomLevel}>
//             {cards.map((card) => (
              
//             <CardWrapper>
//                 <BoardCard
//                   card={card}
//                   zoomLevel={zoomLevel}
//                   canComment={board.canComment}
//                   displayNbFavorites={board.displayNbFavorites}
//                   key={card.id}
//                 />
//               </CardWrapper>
            
              
//             ))}
//           </CardsWrapper>
//         //   </div>
        
//   );
// };

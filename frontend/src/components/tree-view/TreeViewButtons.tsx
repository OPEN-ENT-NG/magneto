import React from "react";

import {  Button, TreeView } from "@edifice-ui/react";

  export const TreeViewButtons = () => {

  return (
    <>
      <div>
        <Button
          type={'button'}
          /**
           * `primary`, `secondary`, `tertiary` or `danger`
           */
          color={'secondary'}
          /**
           * `filled`, `outline` or `ghost`
           */
          variant={'outline'}
          /**
           * `sm`, `md` or `lg`
           */
          size={'sm'}
          /**
           * Does it has a text ?
           */
          children={'Créer un dossier'}
          /**
           * Display Icon Component to the left
           */
          leftIcon={<Plus />}
          
          /**
           * Is it loading ?
           */
          isLoading={false}
          ></Button>
          <br/>
          <Button
              type={'button'}
          /**
           * `primary`, `secondary`, `tertiary` or `danger`
           */
          color={'secondary'}
          /**
           * `filled`, `outline` or `ghost`
           */
          variant={'outline'}
          /**
           * `sm`, `md` or `lg`
           */
          size={'sm'}
          /**
           * Does it has a text ?
           */
          children={'Afficher mes aimants favoris'}
          /**
           * Display Icon Component to the left
           */
          // leftIcon={<i></i>}
          
          /**
           * Is it loading ?
           */
          isLoading={false}
        ></Button>
      </div>
      
    </>
  );
};

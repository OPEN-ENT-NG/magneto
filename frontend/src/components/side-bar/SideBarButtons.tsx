import React from "react";

import {  Button } from "@edifice-ui/react";
import { Icon } from '@mdi/react';
import { mdiFolderPlus, mdiStar } from '@mdi/js';
import { useTranslation } from "react-i18next";



  export const SideBarButtons = () => {
  const { t } = useTranslation();


  return (
    <>
      <div className="d-grid my-16">
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
          children={t('magneto.create.folder')}
          /**
           * Display Icon Component to the left
           */
          leftIcon={<Icon path={mdiFolderPlus} size={1}></Icon>}
          
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
          leftIcon={<Icon path={mdiStar} size={1}></Icon>}
          
          /**
           * Is it loading ?
           */
          isLoading={false}
        ></Button>
      </div>
      
    </>
  );
};

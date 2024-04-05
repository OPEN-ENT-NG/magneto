import React from "react";

import { TreeView, Grid } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";

import { Card } from "~/components/card/Card.tsx";
import Header from "~/components/header/Header";

// const ExportModal = lazy(async () => await import("~/features/export-modal"));

export interface AppProps {
  _id: string;
  created: Date;
  description: string;
  map: string;
  modified: Date;
  name: string;
  owner: { userId: ID; displayName: string };
  shared: any[];
  thumbnail: string;
}

export const App = () => {
  console.log("i am in app");
  return (
    <>
      <Header />
      <>
        <Grid>
          <Grid.Col
            sm="4"
            style={{
              minHeight: "70rem",
              padding: ".8rem",
            }}
          >
            <TreeView
              data={{
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                id: "12",
                                name: "level 4 arborescence tree",
                              },
                              {
                                id: "13",
                                name: "level 4 arborescence tree",
                              },
                            ],
                            id: "8",
                            name: "level 3 arborescence tree",
                          },
                          {
                            id: "9",
                            name: "level 3 arborescence tree",
                          },
                        ],
                        id: "4",
                        name: "level 2 arborescence tree",
                      },
                      {
                        children: [
                          {
                            id: "10",
                            name: "level 3 arborescence tree",
                          },
                          {
                            id: "11",
                            name: "level 3 arborescence tree",
                          },
                        ],
                        id: "5",
                        name: "level 2 arborescence tree",
                      },
                    ],
                    id: "1",
                    name: "level 1 arborescence tree",
                  },
                  {
                    children: [
                      {
                        id: "6",
                        name: "level 2 arborescence tree",
                      },
                      {
                        id: "7",
                        name: "level 2 arborescence tree",
                      },
                    ],
                    id: "2",
                    name: "level 1 arborescence tree",
                  },
                  {
                    id: "3",
                    name: "level 1 arborescence tree",
                  },
                ],
                id: "root",
                name: "Section Element",
                section: true,
              }}
              onTreeItemBlur={function Ga() { }}
              onTreeItemFocus={function Ga() { }}
              onTreeItemFold={function Ga() { }}
              onTreeItemSelect={function Ga() { }}
              onTreeItemUnfold={function Ga() { }}
            />
          </Grid.Col>
          <Grid.Col
            sm="8"
            style={{
              minHeight: "10rem",
              padding: ".8rem",
            }}
          >
            <Card title={"Main"} content={"NON"} />
          </Grid.Col>
        </Grid>
      </>
    </>
  );
};

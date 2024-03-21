import React from "react";

import { ID } from "edifice-ts-client";
import { Link } from "react-router-dom";

import { Card } from "~/components/card/Card.tsx";

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
      <div>root index principal</div>
      <Card title="Sample Card" content="This is a sample card component." />
      <Link to={`/user`}>click to access user </Link>
      <Link to={`/info`}>click to access info </Link>
      <Link to={`/`}>click to access /</Link>
      <p>hello</p>
    </>
  );
};

import { ID } from "edifice-ts-client";
import { Link } from "react-router-dom";

import "./index.css";

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
  return (
    <>
      <div>coucou je suis user</div>
      <Link to={`/user`}>click to access user </Link>
      <Link to={`/info`}>click to access info </Link>
      <Link to={`/board/{id}/view`}>click to access board </Link>
      <Link to={`/board/{id}/reading`}>click to access read </Link>
      <Link to={`/`}>click to access /</Link>
    </>
  );
};

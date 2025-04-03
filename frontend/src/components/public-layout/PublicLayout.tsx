import React from "react";

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <>
      <header
        className="header no-1d"
        style={{
          height: "71px",
        }}
      >
        <nav
          className="navbar navbar-expand-md"
          style={
            {
              height: "100%",
              background: "var(--theme-palette-primary-dark)",
            } as React.CSSProperties
          }
        />
      </header>
      <main className={"d-flex flex-column bg-white container-fluid"}>
        {children}
      </main>
    </>
  );
};

export default PublicLayout;

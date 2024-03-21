import React from "react";
import "./Card.scss";

interface CardProps {
  title: string;
  content: string;
}

export const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <div className="card">
      <div className="card-content">
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
    </div>
  );
};

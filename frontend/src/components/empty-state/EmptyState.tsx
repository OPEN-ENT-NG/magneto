import { useTranslation } from "react-i18next";

import { EmptyStateMagneto } from "../SVG/EmptyStateMagneto";

import "./EmptyState.scss";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
}) => {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <div className="empty-state-svg">
        <EmptyStateMagneto />
      </div>
      <span className="empty-state-text">
        {<p>{t(title)}</p>}
        {description && <p>{t(description)}</p>}
      </span>
    </div>
  );
};

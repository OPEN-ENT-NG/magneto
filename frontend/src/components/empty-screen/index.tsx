import { useEdificeClient, useOdeTheme, EmptyScreen } from "@edifice.io/react";
import { useTranslation } from "react-i18next";

export default function EmptyScreenApp(): JSX.Element {
  const { appCode } = useEdificeClient();
  const { theme } = useOdeTheme();
  const { t } = useTranslation("magneto");

  return (
    <EmptyScreen
      imageSrc={`${theme?.bootstrapPath}/images/emptyscreen/illu-${appCode}.svg`}
      imageAlt={t("explorer.emptyScreen.app.alt")}
      title={t("explorer.emptyScreen.blog.title.create")}
      text={"Oops"}
    />
  );
}

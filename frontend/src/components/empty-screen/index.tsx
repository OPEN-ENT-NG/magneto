import {
  useEdificeClient,
  useEdificeTheme,
  EmptyScreen,
} from "@edifice.io/react";
import { useTranslation } from "react-i18next";

export default function EmptyScreenApp(): JSX.Element {
  const { appCode } = useEdificeClient();
  const { theme } = useEdificeTheme();
  const { t } = useTranslation("magneto");

  return (
    <EmptyScreen
      imageSrc={`${theme?.basePath}/images/emptyscreen/illu-${appCode}.svg`}
      imageAlt={t("explorer.emptyScreen.app.alt")}
      title={t("explorer.emptyScreen.blog.title.create")}
      text={"Oops"}
    />
  );
}

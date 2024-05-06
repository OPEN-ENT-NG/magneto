import { Button, ActionBar } from "@edifice-ui/react";
import { useTransition, animated } from "@react-spring/web";
import { useTranslation } from "react-i18next";

import  { useToaster }  from "~/hooks/useToaster";

export default function ToasterContainer() {
  const { t } = useTranslation();
  const {
    isToasterOpen,
  } = useToaster();

  const transition = useTransition(isToasterOpen, {
    from: { opacity: 0, transform: "translateY(100%)" },
    enter: { opacity: 1, transform: "translateY(0)" },
    leave: { opacity: 0, transform: "translateY(100%)" },
  });

  return (
    <>
      {transition((style, isToasterOpen) => {
        return (
          isToasterOpen && (
            <animated.div
              className="position-fixed bottom-0 start-0 end-0 z-3"
              style={style}
            >
              <ActionBar>
                {/* {actions
                  ?.filter(
                    (action: IAction) =>
                      action.available && action.target === "actionbar",
                  )
                  .map((action: IAction) => {
                    return (
                      isActivable(action) && (
                        <AccessControl
                          key={action.id}
                          resourceRights={selectedElement}
                          roleExpected={action.right!}
                          action={action}
                        >
                          <Button
                            id={action.id}
                            key={action.id}
                            type="button"
                            color="primary"
                            variant="filled"
                            onClick={() => {
                              handleClick(action);
                            }}
                          >
                            {t(overrideLabel(action))}
                          </Button>
                        </AccessControl>
                      )
                    );
                  })} */}
                <Button
                    color="primary"
                    type="button"
                    variant="filled"
                    >
                    Créer
                    </Button>
                    <Button
                    color="primary"
                    type="button"
                    variant="filled"
                    >
                    Modifier
                    </Button>
                    <Button
                    color="primary"
                    type="button"
                    variant="filled"
                    >
                    Publier
                </Button>
              </ActionBar>
            </animated.div>
          )
        );
      })}
    </>
  );
}

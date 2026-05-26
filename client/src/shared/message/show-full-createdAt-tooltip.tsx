import { Tooltip } from "@/components/ui/tooltip";
import { formatDateForTooltip } from "@/core/utils/chat-functions";
import type { ReactNode } from "react";

const ShowFullTimeStampTooltip = ({
  children,
  createdAt,
}: {
  children: ReactNode;
  createdAt: string;
}) => {
  const formatedDate = formatDateForTooltip(createdAt);

  return (
    <Tooltip
      lazyMount
      unmountOnExit
      content={formatedDate}
      showArrow
      positioning={{
        placement: "top",
      }}
      contentProps={{
        maxW: "175px",
        padding: "8px",
        rounded: "md",
        fontSize: "xs",

        color: "fg",
        css: { "--tooltip-bg": "colors.bg" },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default ShowFullTimeStampTooltip;






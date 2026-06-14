import { Badge } from "@/components/ui/badge";
import type { Direction } from "@/lib/cloudledger/types";

export function DirectionBadge({
  direction,
  kidName,
}: {
  direction: Direction;
  kidName: string;
}) {
  const label = direction === "dad_owes_kid" ? `Dad owes ${kidName}` : `${kidName} owes Dad`;

  return (
    <Badge
      className={
        direction === "dad_owes_kid"
          ? "rounded-full border-amber-200/80 bg-amber-50/80 text-amber-800 hover:bg-amber-50"
          : "rounded-full border-violet-200/80 bg-violet-50/80 text-violet-800 hover:bg-violet-50"
      }
    >
      {label}
    </Badge>
  );
}

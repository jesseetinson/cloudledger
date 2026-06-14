import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/cloudledger/types";

export function CategoryBadge({ category }: { category: Pick<Category, "name"> }) {
  return (
    <Badge className="rounded-full border-sky-200/80 bg-sky-50/80 text-sky-800 hover:bg-sky-50">
      {category.name}
    </Badge>
  );
}

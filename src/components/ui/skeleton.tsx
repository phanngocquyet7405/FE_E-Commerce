import React from "react";
import { cn } from "@/utils/format";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/70", className)}
      {...props}
    />
  );
}

/**
 * Hiển thị các hàng giả lập cho Data Table
 */
export function TableSkeletonRows({
  rows = 5,
  cols = 7,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b transition-colors">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="p-3.5">
              <Skeleton
                className={cn(
                  "h-4 rounded-lg",
                  cIdx === 0
                    ? "w-20"
                    : cIdx === 1
                    ? "w-36"
                    : cIdx === cols - 1
                    ? "w-16 ml-auto"
                    : "w-24"
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default Skeleton;

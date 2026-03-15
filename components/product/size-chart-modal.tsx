"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SizeRow = {
  size: string;
  chest?: number;
  waist?: number;
  hip?: number;
  length?: number;
  [key: string]: number | string | undefined;
};

export function SizeChartModal({
  open,
  onOpenChange,
  sizeChart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizeChart: SizeRow[] | null;
}) {
  if (!sizeChart || !Array.isArray(sizeChart) || sizeChart.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Size Chart</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">No size chart available for this product.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const keys = Object.keys(sizeChart[0]).filter((k) => k !== "size" && typeof sizeChart[0][k] === "number");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Size Chart (cm)</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Size</th>
                {keys.map((k) => (
                  <th key={k} className="text-left py-2 font-medium capitalize">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row) => (
                <tr key={row.size} className="border-b">
                  <td className="py-2 font-medium">{row.size}</td>
                  {keys.map((k) => (
                    <td key={k} className="py-2 text-muted-foreground">
                      {row[k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

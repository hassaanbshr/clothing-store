"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SizeRow = {
  size: string;
  chest?: number;
  waist?: number;
  hip?: number;
  length?: number;
};

export function SizeRecommendationTool({
  open,
  onOpenChange,
  sizeChart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizeChart: SizeRow[] | null;
}) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeChart || sizeChart.length === 0) {
      setResult("No size chart available.");
      return;
    }
    const waistNum = waist ? parseFloat(waist) : null;
    const chestNum = chest ? parseFloat(chest) : null;
    const hipNum = hip ? parseFloat(hip) : null;
    let best = sizeChart[0];
    let bestScore = Infinity;
    for (const row of sizeChart) {
      let score = 0;
      if (waistNum != null && row.waist != null) score += Math.abs(row.waist - waistNum);
      if (chestNum != null && row.chest != null) score += Math.abs(row.chest - chestNum);
      if (hipNum != null && row.hip != null) score += Math.abs(row.hip - hipNum);
      if (score < bestScore) {
        bestScore = score;
        best = row;
      }
    }
    setResult(`We recommend size ${best.size}.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Find My Size</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Enter your measurements (in cm) for a size recommendation.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Height (cm)</label>
            <Input
              type="number"
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Chest (cm)</label>
            <Input
              type="number"
              placeholder="e.g. 94"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Waist (cm)</label>
            <Input
              type="number"
              placeholder="e.g. 78"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Hip (cm)</label>
            <Input
              type="number"
              placeholder="e.g. 98"
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">
            Get recommendation
          </Button>
        </form>
        {result && (
          <p className="mt-4 p-3 rounded-md bg-muted font-medium">{result}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

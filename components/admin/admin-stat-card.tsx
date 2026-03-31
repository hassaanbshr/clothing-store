import { Badge } from "@/components/ui/badge";

type AdminStatCardProps = {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
};

export function AdminStatCard({
  label,
  value,
  helper,
  trend,
}: AdminStatCardProps) {
  return (
    <div className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        {trend ? <Badge variant="outline">{trend}</Badge> : null}
      </div>
      {helper ? <p className="mt-3 text-sm text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

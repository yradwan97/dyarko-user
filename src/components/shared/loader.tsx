import { Loader2 } from "lucide-react";

export function Loader({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className || 'min-h-screen'}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

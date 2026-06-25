import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAIConfig } from "@/hooks/useAIConfig";
import { Brain, BrainCircuit, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIGlobalToggle() {
  const { globalEnabled, setGlobalEnabledAndSave, loading, saving } = useAIConfig();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur-sm shadow-sm">
      {loading || saving ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
      ) : globalEnabled ? (
        <BrainCircuit className="h-4 w-4 text-emerald-500 shrink-0 animate-pulse" />
      ) : (
        <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <Label htmlFor="ai-global-toggle" className="text-xs font-semibold cursor-pointer select-none">
        IA Geral
      </Label>
      <Switch
        id="ai-global-toggle"
        checked={globalEnabled}
        onCheckedChange={setGlobalEnabledAndSave}
        disabled={loading || saving}
        className={cn(
          "h-5 w-9 shrink-0 [&>span]:h-4 [&>span]:w-4 data-[state=checked]:bg-emerald-500 [&>span]:data-[state=checked]:translate-x-4"
        )}
      />
    </div>
  );
}

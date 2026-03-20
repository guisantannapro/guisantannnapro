import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  planFilter: string;
  onPlanFilterChange: (value: string) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  totalResults: number;
}

const ClientFilters = ({
  searchTerm,
  onSearchChange,
  planFilter,
  onPlanFilterChange,
  periodFilter,
  onPeriodFilterChange,
  totalResults,
}: ClientFiltersProps) => {
  const hasActiveFilters = searchTerm || planFilter !== "all" || periodFilter !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onPlanFilterChange("all");
    onPeriodFilterChange("all");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 border-border bg-background"
          />
        </div>

        {/* Plan Filter */}
        <Select value={planFilter} onValueChange={onPlanFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-border bg-background">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            <SelectItem value="base">Base</SelectItem>
            <SelectItem value="transformacao">Transformação</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
          </SelectContent>
        </Select>

        {/* Period Filter */}
        <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px] border-border bg-background">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filters info */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {totalResults} resultado{totalResults !== 1 ? "s" : ""}
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7 px-2"
          >
            <X size={12} />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClientFilters;

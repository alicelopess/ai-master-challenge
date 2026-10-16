"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UI } from "@/copy/pt-BR";

// O Select do Radix não aceita valor vazio: "todos" é uma chave interna desta tela.
const ALL = "__todos__";

type FilterProps = {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
};

function Filter({ label, options, value, onChange }: FilterProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? null : next)}>
        <SelectTrigger aria-label={label} className="w-full sm:w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{UI.filters.all}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type Props = {
  managers: string[];
  offices: string[];
  manager: string | null;
  office: string | null;
  onChange: (changes: { gerente?: string | null; escritorio?: string | null }) => void;
};

/** Filtros de gerente e escritório (os que a API aceita), com as opções do cadastro de vendedores. */
export function TeamFilters({ managers, offices, manager, office, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Filter label={UI.filters.manager} options={managers} value={manager}
              onChange={(value) => onChange({ gerente: value })} />
      <Filter label={UI.filters.office} options={offices} value={office}
              onChange={(value) => onChange({ escritorio: value })} />
      {(manager || office) && (
        <Button variant="ghost" className="w-fit" onClick={() => onChange({ gerente: null, escritorio: null })}>
          <X aria-hidden />
          {UI.filters.clear}
        </Button>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from "react";

interface Municipality {
  nome: string;
  uf: string;
}

interface CityStateFieldProps {
  value: string;
  onChange: (city: string, uf: string) => void;
  className?: string;
}

let cachedMunicipalities: Municipality[] = [];

const CityStateField = ({ value, onChange, className }: CityStateFieldProps) => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>(cachedMunicipalities);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUf, setSelectedUf] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cachedMunicipalities.length > 0) return;
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome")
      .then((r) => r.json())
      .then((data: any[]) => {
        const mapped = data.map((m) => ({
          nome: m.nome,
          uf: m.microrregiao?.mesorregiao?.UF?.sigla || "",
        }));
        cachedMunicipalities = mapped;
        setMunicipalities(mapped);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const term = value.toLowerCase();
    return municipalities
      .filter((m) => m.nome.toLowerCase().startsWith(term))
      .slice(0, 8);
  }, [value, municipalities]);

  const handleSelect = (m: Municipality) => {
    setSelectedUf(m.uf);
    onChange(m.nome, m.uf);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <input
            className={className}
            placeholder="Digite sua cidade"
            value={value}
            onChange={(e) => {
              onChange(e.target.value, selectedUf);
              setShowSuggestions(true);
            }}
            onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          />
        </div>
        <div className="w-[72px] shrink-0">
          <input
            className={className + " text-center"}
            placeholder="UF"
            value={selectedUf}
            readOnly
            tabIndex={-1}
          />
        </div>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((m, i) => (
            <li
              key={`${m.nome}-${m.uf}-${i}`}
              className="px-3 py-2 text-sm text-foreground hover:bg-primary/10 cursor-pointer flex justify-between"
              onMouseDown={() => handleSelect(m)}
            >
              <span>{m.nome}</span>
              <span className="text-muted-foreground text-xs">{m.uf}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityStateField;

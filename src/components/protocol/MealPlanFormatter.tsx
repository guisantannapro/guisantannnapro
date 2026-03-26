type Props = {
  content: string;
};

const MEAL_HEADERS = [
  /^refeição\s*\d+/i,
  /^pre\s*treino/i,
  /^pré\s*treino/i,
  /^pós\s*treino/i,
  /^pos\s*treino/i,
  /^refeição\s*livre/i,
  /^consumo\s*de\s*água/i,
];

function isMealHeader(line: string): boolean {
  const trimmed = line.trim();
  return MEAL_HEADERS.some((r) => r.test(trimmed));
}

function isOrSeparator(line: string): boolean {
  const trimmed = line.trim().toLowerCase();
  return trimmed === "ou" || /^\d+\s+ou\s+\d+$/.test(trimmed);
}

function isObservation(line: string): boolean {
  return line.trim().toLowerCase().startsWith("obs:");
}

function isOptionHeader(line: string): boolean {
  return /^\d+\s*-\s+/.test(line.trim());
}

export function MealPlanFormatter({ content }: Props) {
  const lines = content.split("\n");

  return (
    <div className="meal-plan-formatted">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={i} className="meal-plan-spacer" />;

        if (isMealHeader(trimmed)) {
          return (
            <div key={i} className="meal-plan-header">
              {trimmed}
            </div>
          );
        }

        if (isOrSeparator(trimmed)) {
          return (
            <div key={i} className="meal-plan-or">
              <span className="meal-plan-or-line" />
              <span className="meal-plan-or-text">{trimmed.toUpperCase()}</span>
              <span className="meal-plan-or-line" />
            </div>
          );
        }

        if (isObservation(trimmed)) {
          return (
            <div key={i} className="meal-plan-obs">
              {trimmed}
            </div>
          );
        }

        if (isOptionHeader(trimmed)) {
          return (
            <div key={i} className="meal-plan-option-header">
              {trimmed}
            </div>
          );
        }

        return (
          <div key={i} className="meal-plan-item">
            {trimmed}
          </div>
        );
      })}
    </div>
  );
}

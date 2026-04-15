---
name: Training Logbook Tables
description: Interactive exercise tables in protocols — admin defines exercises, client fills results
type: feature
---
O protocolo de treino usa tabelas interativas (logbook) em vez de texto livre.

**Estrutura:**
- Tabela `protocol_exercises` no banco com campos admin (bloqueados) e cliente (editáveis)
- Dois tipos de tabela: `standard` (Top Set + Back-off) e `complementar` (Método)
- 4 semanas por padrão (configurável pelo admin)
- 6 dias padrão: PUSH, PULL, LEGS, PUSH, PULL, COMPLEMENTAR

**Admin (ProtocolPreviewModal):**
- `ExerciseTableEditor` — define exercícios, métodos, observações pré-preenchidas
- Template padrão carregado ao selecionar tipo de protocolo
- Exercícios replicados para todas as semanas ao salvar

**Cliente (Protocolo page):**
- `InteractiveTrainingTable` — tabelas agrupadas por semana/dia
- Campos editáveis: client_top_set, client_back_off, client_resultado, client_obs
- Campos bloqueados: exercise_name, metodo, admin_obs (quando preenchido)
- Auto-save com debounce de 800ms e feedback visual (✓ verde)

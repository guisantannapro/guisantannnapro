---
name: Interactive Training Log
description: Client-facing editable training table for logging weights, reps, and difficulty per exercise per day
type: feature
---
- Table `training_logs` stores per-set data: exercise_name, set_number, weight_kg, reps, difficulty (1-5), training_date
- Linked to `protocolos` via protocolo_id (CASCADE delete)
- Component `TrainingLog.tsx` in MinhaArea: date navigation, grouped by exercise, quick-add from parsed protocol exercises
- Component `TrainingLogsViewer.tsx` in Dashboard ClientViewTab: read-only admin view of client logs
- RLS: user owns their logs, admin full access
- Does NOT alter existing protocol flow (view, PDF, etc.)

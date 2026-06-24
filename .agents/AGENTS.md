# Parago Project Agent Rules

- **UI Component Imports:** Before importing any shared UI component (Button, Input, Card, etc.), always verify the actual filename and export pattern in `src/components/ui/` (using `list_dir` or `view_file`), rather than guessing based on standard naming conventions. Specifically, note that many components might be exported from `index.tsx` instead of standalone files.

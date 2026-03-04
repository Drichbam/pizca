

## Plan: Auto-corregir errores comunes en importación de recetas

### Problema
Los archivos JSON usan categorías sin acentos (`gateaux`, `cremes-de-base`, `pates-de-base`) pero el sistema requiere las versiones con acentos (`gâteaux`, `crèmes-de-base`, `pâtes-de-base`). También hay componentes vacíos e ingredientes sin nombre que bloquean la importación.

### Solución

**Archivo: `src/pages/ImportarRecetas.tsx`**

1. **Mapa de normalización de categorías** — Antes de validar, mapear variantes sin acentos a las categorías válidas:
   ```
   gateaux → gâteaux
   cremes-de-base → crèmes-de-base
   pates-de-base → pâtes-de-base
   glaces-sorbets → glaces-sorbets (ya ok)
   ```
   Aplicar este mapeo al JSON antes de la validación (`validateRecipe`).

2. **Filtrar componentes vacíos** — Antes de validar, eliminar componentes cuyo array `ingredientes` esté vacío o ausente. Si tras filtrar quedan 0 componentes, ahí sí dar error.

3. **Filtrar ingredientes sin nombre** — Dentro de cada componente, descartar ingredientes donde `ingrediente` sea falsy, en vez de rechazar el archivo entero.

Estos 3 cambios se aplican como un paso de "sanitización" al inicio de `validateRecipe`, antes de las validaciones estrictas.


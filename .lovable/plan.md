

## Plan: Add unit legend tooltip to ingredient editor

### What
Add a small help icon (HelpCircle) next to the "Ingredientes" heading in `ComponentEditor.tsx` that shows a tooltip/popover explaining the special units.

### How

**File: `src/components/recipe-form/ComponentEditor.tsx`**

1. Import `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` and `HelpCircle` icon.

2. Next to the "Ingredientes" `<h4>`, add a `HelpCircle` icon wrapped in a Tooltip that displays:

```
g — gramos          kg — kilogramos
ml — mililitros     cl — centilitros
dl — decilitros     l — litros
pcs — piezas        cc — cucharita café
cs — cuchara sopera pincée — pizca
QS — cantidad suficiente (à discrétion)
```

Styled as a compact two-column grid inside `TooltipContent` with `max-w-xs`.

### Scope
Single file edit, no database or backend changes needed.


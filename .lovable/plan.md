

## Plan: Mostrar ingredientes de recetas en Mis Precios

### Objetivo
En la pantalla "Mis Precios", mostrar automáticamente todos los ingredientes que el usuario usa en sus recetas, incluso si aun no tienen precio asignado. Esto permite al usuario ver de un vistazo que ingredientes le faltan por registrar.

### Enfoque

1. **Crear un query para obtener ingredientes distintos de las recetas del usuario**
   - En `IngredientPricesManager`, añadir un segundo `useQuery` que obtenga todos los `recipe_ingredients` del usuario (a traves de `recipe_components` -> `recipes`).
   - Extraer nombres de ingredientes unicos (normalizados a minusculas/trim).

2. **Fusionar ingredientes de recetas con precios existentes**
   - Crear una lista combinada: ingredientes con precio + ingredientes sin precio.
   - Los ingredientes sin precio se muestran en la lista con un indicador visual (ej: "Sin precio") y un boton rapido para añadir precio.
   - Los ingredientes con precio se muestran como actualmente.

3. **UI ajustada en la lista**
   - Ingredientes sin precio: fila con estilo atenuado, texto "Sin precio" donde iria el importe, y boton para abrir el formulario pre-rellenado con el nombre del ingrediente.
   - Añadir un filtro/toggle para mostrar "Todos", "Con precio", "Sin precio".
   - El buscador aplica sobre la lista combinada.

### Cambios en archivos

- **`src/components/profile/IngredientPricesManager.tsx`**:
  - Añadir query para ingredientes de recetas del usuario.
  - Fusionar con precios existentes.
  - Añadir toggle de filtro (Todos / Con precio / Sin precio).
  - Renderizar ingredientes sin precio con CTA para añadir precio.

### Detalles tecnicos

Query para ingredientes de recetas:
```sql
SELECT DISTINCT ri.name 
FROM recipe_ingredients ri
JOIN recipe_components rc ON rc.id = ri.component_id
JOIN recipes r ON r.id = rc.recipe_id
WHERE r.user_id = auth.uid()
```

Esto se traduce en Supabase JS como un query a `recipe_ingredients` con select de `name, recipe_components!inner(recipe_id, recipes!inner(user_id))`, pero dado que RLS ya filtra por usuario, basta con hacer `select("name")` desde `recipe_ingredients` — las politicas RLS existentes ya garantizan que solo se devuelven ingredientes del usuario autenticado.

La fusion sera client-side: un `Set` de nombres normalizados de ingredientes de recetas, comparado contra los precios existentes, generando la lista final.


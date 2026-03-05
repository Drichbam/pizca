import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ruler, ArrowRight } from "lucide-react";
import type { RecipeWithComponents, RecipeScaleFactor } from "@/types/recipe";

type MoldShape = "circular" | "cuadrado" | "rectangular";

interface MoldDimensions {
  shape: MoldShape;
  d?: number; // diameter for circular
  l?: number; // side for square, length for rectangular
  w?: number; // width for rectangular
  h: number;  // height
}

function calcVolume(m: MoldDimensions): number {
  switch (m.shape) {
    case "circular":
      return Math.PI * Math.pow((m.d || 0) / 2, 2) * m.h;
    case "cuadrado":
      return Math.pow(m.l || 0, 2) * m.h;
    case "rectangular":
      return (m.l || 0) * (m.w || 0) * m.h;
  }
}

function smartRound(value: number, unit: string | null, name: string): number {
  const n = name.toLowerCase();
  const u = (unit || "").toLowerCase();

  // Eggs → nearest integer
  if (n.includes("huevo") || n.includes("oeuf") || n.includes("egg") || u === "pcs") {
    return Math.round(value);
  }
  // Yeast / levadura → 0.5g
  if (n.includes("levadura") || n.includes("levure") || n.includes("yeast")) {
    return Math.round(value * 2) / 2;
  }
  // Flours, sugars → multiple of 5
  if (u === "g" || u === "kg") {
    if (value < 10) return Math.round(value);
    return Math.round(value / 5) * 5;
  }
  // Liquids → multiple of 5
  if (["ml", "cl", "dl", "l"].includes(u)) {
    if (value < 10) return Math.round(value);
    return Math.round(value / 5) * 5;
  }
  return Math.round(value * 10) / 10;
}

interface Props {
  recipe: RecipeWithComponents;
}

export function RecipeMoldsTab({ recipe }: Props) {
  const [srcShape, setSrcShape] = useState<MoldShape>("circular");
  const [srcDims, setSrcDims] = useState<MoldDimensions>({ shape: "circular", d: 24, h: 4 });
  const [dstShape, setDstShape] = useState<MoldShape>("circular");
  const [dstDims, setDstDims] = useState<MoldDimensions>({ shape: "circular", d: 22, h: 4 });
  const [activeQuick, setActiveQuick] = useState<string | null>(null);

  const factor = useMemo(() => {
    const vSrc = calcVolume(srcDims);
    const vDst = calcVolume(dstDims);
    if (vSrc === 0) return 1;
    return vDst / vSrc;
  }, [srcDims, dstDims]);

  const components = [...(recipe.recipe_components || [])].sort((a, b) => a.sort_order - b.sort_order);
  const scaleFactors = recipe.recipe_scale_factors || [];

  const handleQuickFactor = (sf: RecipeScaleFactor) => {
    setActiveQuick(sf.id);
    // We just apply the multiplier directly by setting a matching volume ratio
    // Reset shapes and set dimensions so factor = multiplier
    setSrcShape("circular");
    setSrcDims({ shape: "circular", d: 10, h: 10 });
    setDstShape("circular");
    const targetD = 10 * Math.sqrt(sf.multiplier);
    setDstDims({ shape: "circular", d: Math.round(targetD * 100) / 100, h: 10 });
  };

  const updateSrc = (key: string, val: number) => {
    setActiveQuick(null);
    setSrcDims((prev) => ({ ...prev, [key]: val, shape: srcShape }));
  };
  const updateDst = (key: string, val: number) => {
    setActiveQuick(null);
    setDstDims((prev) => ({ ...prev, [key]: val, shape: dstShape }));
  };

  const handleSrcShapeChange = (shape: MoldShape) => {
    setActiveQuick(null);
    setSrcShape(shape);
    setSrcDims({ shape, d: 24, l: 20, w: 15, h: 4 });
  };
  const handleDstShapeChange = (shape: MoldShape) => {
    setActiveQuick(null);
    setDstShape(shape);
    setDstDims({ shape, d: 22, l: 18, w: 13, h: 4 });
  };

  return (
    <div className="space-y-5">
      {/* Quick scale factors */}
      {scaleFactors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Escalas rápidas</p>
          <div className="flex flex-wrap gap-2">
            {scaleFactors.map((sf) => (
              <Button
                key={sf.id}
                variant={activeQuick === sf.id ? "default" : "outline"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => handleQuickFactor(sf)}
              >
                {sf.reference_mold} → {sf.target_mold}: ×{sf.multiplier}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Mold selectors */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <MoldSelector
          label="Molde original"
          shape={srcShape}
          dims={srcDims}
          onShapeChange={handleSrcShapeChange}
          onDimChange={updateSrc}
        />
        <div className="flex flex-col items-center justify-end pb-2">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <MoldSelector
          label="Molde destino"
          shape={dstShape}
          dims={dstDims}
          onShapeChange={handleDstShapeChange}
          onDimChange={updateDst}
        />
      </div>

      {/* Factor display */}
      <div className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Factor de escala</p>
          <p className="text-2xl font-bold text-primary tabular-nums">×{factor.toFixed(2)}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground space-y-0.5">
          <p>Vol. original: {Math.round(calcVolume(srcDims))} cm³</p>
          <p>Vol. destino: {Math.round(calcVolume(dstDims))} cm³</p>
        </div>
      </div>

      {/* Ingredient comparison */}
      {components.length > 0 && (
        <div className="space-y-3">
          {components.map((comp) => {
            const ingredients = [...(comp.recipe_ingredients || [])].sort((a, b) => a.sort_order - b.sort_order);
            if (!ingredients.length) return null;
            return (
              <div key={comp.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                {comp.name && (
                  <div className="px-4 pt-3 pb-1">
                    <p className="font-semibold text-foreground text-sm">{comp.name}</p>
                  </div>
                )}
                <div className="px-4 pb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-border">
                        <th className="text-left py-1.5 font-medium">Ingrediente</th>
                        <th className="text-right py-1.5 font-medium w-20">Original</th>
                        <th className="text-right py-1.5 font-medium w-20">Adaptado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((ing) => {
                        const adapted = ing.quantity != null
                          ? smartRound(ing.quantity * factor, ing.unit, ing.name)
                          : null;
                        return (
                          <tr key={ing.id} className="border-b border-border/50 last:border-0">
                            <td className="py-1.5 text-foreground">{ing.name}</td>
                            <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                              {ing.quantity != null ? `${ing.quantity} ${ing.unit || ""}` : "QS"}
                            </td>
                            <td className="py-1.5 text-right tabular-nums font-medium text-primary">
                              {adapted != null ? `${adapted} ${ing.unit || ""}` : "QS"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MoldSelector({
  label,
  shape,
  dims,
  onShapeChange,
  onDimChange,
}: {
  label: string;
  shape: MoldShape;
  dims: MoldDimensions;
  onShapeChange: (s: MoldShape) => void;
  onDimChange: (key: string, val: number) => void;
}) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Ruler className="h-3.5 w-3.5" /> {label}
      </p>
      <Select value={shape} onValueChange={(v) => onShapeChange(v as MoldShape)}>
        <SelectTrigger className="rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="circular">Circular</SelectItem>
          <SelectItem value="cuadrado">Cuadrado</SelectItem>
          <SelectItem value="rectangular">Rectangular</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-2">
        {shape === "circular" && (
          <div>
            <Label className="text-xs text-muted-foreground">Diámetro (cm)</Label>
            <Input
              type="number"
              value={dims.d || ""}
              onChange={(e) => onDimChange("d", Number(e.target.value))}
              className="rounded-lg"
              min={1}
            />
          </div>
        )}
        {shape === "cuadrado" && (
          <div>
            <Label className="text-xs text-muted-foreground">Lado (cm)</Label>
            <Input
              type="number"
              value={dims.l || ""}
              onChange={(e) => onDimChange("l", Number(e.target.value))}
              className="rounded-lg"
              min={1}
            />
          </div>
        )}
        {shape === "rectangular" && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">Largo (cm)</Label>
              <Input
                type="number"
                value={dims.l || ""}
                onChange={(e) => onDimChange("l", Number(e.target.value))}
                className="rounded-lg"
                min={1}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ancho (cm)</Label>
              <Input
                type="number"
                value={dims.w || ""}
                onChange={(e) => onDimChange("w", Number(e.target.value))}
                className="rounded-lg"
                min={1}
              />
            </div>
          </>
        )}
        <div>
          <Label className="text-xs text-muted-foreground">Alto (cm)</Label>
          <Input
            type="number"
            value={dims.h || ""}
            onChange={(e) => onDimChange("h", Number(e.target.value))}
            className="rounded-lg"
            min={1}
          />
        </div>
      </div>
    </div>
  );
}

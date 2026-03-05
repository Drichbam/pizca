import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { RecipeWithComponents } from "@/types/recipe";

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  es: { "tartes": "Tartes", "entremets": "Entremets", "biscuits": "Biscuits", "gâteaux": "Gâteaux", "pâtes-de-base": "Pâtes de base", "crèmes-de-base": "Crèmes de base", "mousses": "Mousses", "glaces-sorbets": "Glaces & Sorbets", "viennoiserie": "Viennoiserie", "confiserie": "Confiserie", "autre": "Otro" },
  fr: { "tartes": "Tartes", "entremets": "Entremets", "biscuits": "Biscuits", "gâteaux": "Gâteaux", "pâtes-de-base": "Pâtes de base", "crèmes-de-base": "Crèmes de base", "mousses": "Mousses", "glaces-sorbets": "Glaces & Sorbets", "viennoiserie": "Viennoiserie", "confiserie": "Confiserie", "autre": "Autre" },
  en: { "tartes": "Tarts", "entremets": "Entremets", "biscuits": "Biscuits", "gâteaux": "Cakes", "pâtes-de-base": "Base doughs", "crèmes-de-base": "Base creams", "mousses": "Mousses", "glaces-sorbets": "Ice creams & Sorbets", "viennoiserie": "Viennoiserie", "confiserie": "Confectionery", "autre": "Other" },
};
const DIFFICULTY_LABELS: Record<string, Record<string, string>> = {
  es: { "basico": "Básico", "intermedio": "Intermedio", "avanzado": "Avanzado", "experto": "Experto" },
  fr: { "basico": "Basique", "intermedio": "Intermédiaire", "avanzado": "Avancé", "experto": "Expert" },
  en: { "basico": "Basic", "intermedio": "Intermediate", "avanzado": "Advanced", "experto": "Expert" },
};
const PDF_LABELS: Record<string, {
  tested: string; ingredients: string; preparation: string; notes: string;
  servings: string; prep: string; bake: string; rest: string;
  mold: string; chef: string; book: string; source: string; footer: string;
}> = {
  es: { tested: "✓ Probada", ingredients: "Ingredientes", preparation: "Preparación", notes: "Notas", servings: "porciones", prep: "Prep", bake: "Cocción", rest: "Reposo", mold: "Molde", chef: "Chef", book: "Libro", source: "Fuente", footer: "Generado con Pizca" },
  fr: { tested: "✓ Testée", ingredients: "Ingrédients", preparation: "Préparation", notes: "Notes", servings: "portions", prep: "Prép.", bake: "Cuisson", rest: "Repos", mold: "Moule", chef: "Chef", book: "Livre", source: "Source", footer: "Généré avec Pizca" },
  en: { tested: "✓ Tested", ingredients: "Ingredients", preparation: "Preparation", notes: "Notes", servings: "servings", prep: "Prep", bake: "Bake", rest: "Rest", mold: "Mold", chef: "Chef", book: "Book", source: "Source", footer: "Generated with Pizca" },
};

const ORANGE = "#E8784A";
const BLUE = "#2B4C7E";
const MUTED = "#888888";
const BORDER = "#E5E5E5";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1a1a1a",
    paddingTop: 36,
    paddingBottom: 60,
    paddingHorizontal: 36,
    backgroundColor: "#FFFFFF",
  },
  coverPhoto: {
    width: "100%",
    height: 190,
    objectFit: "cover",
    marginBottom: 14,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: ORANGE,
    marginBottom: 6,
  },
  description: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#F3F3F3",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    fontSize: 9,
    color: "#444",
  },
  badgeTested: {
    backgroundColor: "#D4EDDA",
    color: "#155724",
  },
  originBlock: {
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
    paddingLeft: 10,
    paddingVertical: 5,
    marginBottom: 14,
    backgroundColor: "#F9F9F9",
  },
  originText: {
    fontSize: 10,
    color: MUTED,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 5,
  },
  componentTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: BLUE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 3,
    marginTop: 14,
    marginBottom: 6,
  },
  ingredientRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 2,
    alignItems: "center",
  },
  ingredientQty: {
    width: 45,
    textAlign: "right",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  ingredientUnit: {
    width: 35,
    paddingLeft: 4,
    fontSize: 10,
    color: MUTED,
  },
  ingredientName: {
    flex: 1,
    paddingLeft: 4,
    fontSize: 10,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ORANGE,
    marginRight: 8,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  stepMetaRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  stepMetaBadge: {
    fontSize: 8,
    color: MUTED,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  stepNote: {
    fontSize: 9,
    color: MUTED,
    fontStyle: "italic",
    marginTop: 2,
  },
  stepPhoto: {
    width: "100%",
    maxHeight: 140,
    objectFit: "cover",
    marginTop: 5,
    borderRadius: 4,
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  noteItem: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-start",
  },
  noteBullet: {
    width: 12,
    fontSize: 10,
    color: ORANGE,
  },
  noteText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 9,
    color: "#BBBBBB",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 6,
  },
});

interface Props {
  recipe: RecipeWithComponents;
  lang?: string;
}

export function RecipePdfDocument({ recipe, lang = "es" }: Props) {
  const l = lang in PDF_LABELS ? lang : "es";
  const labels = PDF_LABELS[l];
  const catLabels = CATEGORY_LABELS[l] || CATEGORY_LABELS["es"];
  const diffLabels = DIFFICULTY_LABELS[l] || DIFFICULTY_LABELS["es"];
  const components = [...(recipe.recipe_components || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const notes = [...(recipe.recipe_notes || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const meta: string[] = [];
  if (recipe.category) meta.push(catLabels[recipe.category] || recipe.category);
  if (recipe.servings) meta.push(`${recipe.servings} ${labels.servings}`);
  if (recipe.prep_time_min) meta.push(`${labels.prep} ${recipe.prep_time_min}′`);
  if (recipe.bake_time_min) meta.push(`${labels.bake} ${recipe.bake_time_min}′`);
  if (recipe.rest_time_min) meta.push(`${labels.rest} ${recipe.rest_time_min}′`);
  if (recipe.difficulty) meta.push(diffLabels[recipe.difficulty] || recipe.difficulty);
  if (recipe.temperature) meta.push(`${recipe.temperature}°C`);
  if (recipe.mold) meta.push(`${labels.mold}: ${recipe.mold}`);

  const originParts: string[] = [];
  if (recipe.origin_chef) originParts.push(`${labels.chef}: ${recipe.origin_chef}`);
  if (recipe.origin_book) originParts.push(`${labels.book}: ${recipe.origin_book}`);
  if (recipe.origin_url) originParts.push(`${labels.source}: ${recipe.origin_url}`);

  const today = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const showComponentTitle =
    components.length > 1 || (components.length === 1 && !!components[0].name);

  return (
    <Document title={recipe.title} author="Pizca">
      <Page size="A4" style={styles.page}>
        {/* Cover photo */}
        {recipe.photo_url && (
          <Image src={recipe.photo_url} style={styles.coverPhoto} />
        )}

        {/* Title */}
        <Text style={styles.title}>{recipe.title}</Text>

        {/* Description */}
        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}

        {/* Metadata badges */}
        <View style={styles.metaRow}>
          {recipe.tested && (
            <Text style={[styles.badge, styles.badgeTested]}>{labels.tested}</Text>
          )}
          {meta.map((m, i) => (
            <Text key={i} style={styles.badge}>
              {m}
            </Text>
          ))}
        </View>

        {/* Origin */}
        {originParts.length > 0 && (
          <View style={styles.originBlock}>
            <Text style={styles.originText}>{originParts.join(" · ")}</Text>
          </View>
        )}

        {/* Components */}
        {components.map((comp) => {
          const ingredients = [...comp.recipe_ingredients].sort(
            (a, b) => a.sort_order - b.sort_order
          );
          const steps = [...comp.recipe_steps].sort(
            (a, b) => a.step_order - b.step_order
          );

          return (
            <View key={comp.id}>
              {showComponentTitle && comp.name && (
                <Text style={styles.componentTitle}>{comp.name}</Text>
              )}

              {/* Ingredients */}
              {ingredients.length > 0 && (
                <View>
                  <Text style={styles.sectionLabel}>{labels.ingredients}</Text>
                  {ingredients.map((ing) => (
                    <View key={ing.id} style={styles.ingredientRow}>
                      <Text style={styles.ingredientQty}>
                        {ing.quantity != null ? String(ing.quantity) : ""}
                      </Text>
                      <Text style={styles.ingredientUnit}>{ing.unit || ""}</Text>
                      <Text style={styles.ingredientName}>{ing.display_name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Steps */}
              {steps.length > 0 && (
                <View>
                  <Text style={styles.sectionLabel}>{labels.preparation}</Text>
                  {steps.map((step, idx) => (
                    <View key={step.id} style={styles.stepRow}>
                      <View style={styles.stepCircle}>
                        <Text style={styles.stepNumber}>{idx + 1}</Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepDescription}>
                          {step.description}
                        </Text>
                        {(step.temp_c || step.duration_min) && (
                          <View style={styles.stepMetaRow}>
                            {step.temp_c && (
                              <Text style={styles.stepMetaBadge}>
                                {step.temp_c}°C
                              </Text>
                            )}
                            {step.duration_min && (
                              <Text style={styles.stepMetaBadge}>
                                {step.duration_min}′
                              </Text>
                            )}
                          </View>
                        )}
                        {step.technical_notes && (
                          <Text style={styles.stepNote}>
                            {step.technical_notes}
                          </Text>
                        )}
                        {step.photo_url && (
                          <Image
                            src={step.photo_url}
                            style={styles.stepPhoto}
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Notes */}
        {notes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionLabel}>{labels.notes}</Text>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteItem}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{note.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {labels.footer} · {today}
        </Text>
      </Page>
    </Document>
  );
}

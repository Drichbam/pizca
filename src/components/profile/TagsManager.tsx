import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

const COLORS = [
  "#E8784A", "#2B4C7E", "#6B8F4A", "#9B59B6",
  "#E74C3C", "#F39C12", "#1ABC9C", "#8B4513",
];

interface TagRow {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
}

export function TagsManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [showForm, setShowForm] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagRow | null>(null);

  const { data: tags, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as TagRow[];
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No autenticado");
      if (editingId) {
        const { error } = await supabase
          .from("tags")
          .update({ name: name.trim(), color })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tags")
          .insert({ name: name.trim(), color, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(editingId ? t("tags.updated") : t("tags.created"));
      resetForm();
    },
    onError: () => toast.error(t("tags.saveError")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(t("tags.deletedSuccess"));
    },
    onError: () => toast.error(t("tags.deleteError")),
  });

  const resetForm = () => {
    setName("");
    setColor(COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (tag: TagRow) => {
    setEditingId(tag.id);
    setName(tag.name);
    setColor(tag.color || COLORS[0]);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("tags.title")}</p>
        {!showForm && (
          <Button size="sm" className="rounded-lg" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t("tags.add")}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-accent/30 rounded-xl p-4 space-y-3 border border-border">
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg"
              placeholder={t("tags.namePlaceholder")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full border-2 transition-transform"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "var(--foreground)" : "transparent",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" /> {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              className="rounded-lg"
              disabled={!name.trim() || upsert.isPending}
              onClick={() => upsert.mutate()}
            >
              <Check className="h-4 w-4 mr-1" /> {editingId ? t("tags.save") : t("tags.create")}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !tags?.length ? (
        <div className="text-center py-8">
          <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">{t("tags.empty")}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1.5 rounded-full pl-3 pr-1 py-1 text-sm font-medium border border-border bg-card shadow-sm"
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: tag.color || COLORS[0] }}
              />
              <span className="text-foreground">{tag.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full"
                onClick={() => startEdit(tag)}
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full text-destructive hover:text-destructive"
                onClick={() => setDeletingTag(tag)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingTag} onOpenChange={(open) => !open && setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tags.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("tags.deleteDesc", { name: deletingTag?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingTag) deleteMutation.mutate(deletingTag.id);
                setDeletingTag(null);
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

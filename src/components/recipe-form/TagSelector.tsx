import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTags, useCreateTag, useSetRecipeTags, useRecipeTags } from "@/hooks/useTags";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const TAG_COLORS = [
  "#E8784A", "#2B4C7E", "#4CAF50", "#9C27B0",
  "#F44336", "#FF9800", "#00BCD4", "#795548",
];

interface Props {
  recipeId?: string;
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
}

export function TagSelector({ recipeId, selectedTagIds, onTagsChange }: Props) {
  const { t } = useTranslation();
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const tag = await createTag.mutateAsync({ name: newName.trim(), color: newColor });
      onTagsChange([...selectedTagIds, tag.id]);
      setNewName("");
      setShowCreate(false);
      toast.success(t("tagSelector.tagCreated"));
    } catch {
      toast.error(t("tagSelector.tagError"));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {(tags || []).map(tag => {
          const selected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border"
              style={{
                backgroundColor: selected ? (tag.color || "#E8784A") : "transparent",
                color: selected ? "#fff" : (tag.color || "#E8784A"),
                borderColor: tag.color || "#E8784A",
              }}
            >
              {tag.name}
              {selected && <X className="h-3 w-3" />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" /> {t("tagSelector.new")}
        </button>
      </div>

      {showCreate && (
        <div className="flex items-center gap-2 bg-accent/30 rounded-lg p-2 border border-border">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={t("tagSelector.tagNamePlaceholder")}
            className="flex-1 h-8 text-sm rounded-md"
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleCreate())}
          />
          <div className="flex gap-1">
            {TAG_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="h-5 w-5 rounded-full border-2 transition-transform"
                style={{ backgroundColor: c, borderColor: newColor === c ? "#fff" : "transparent", transform: newColor === c ? "scale(1.2)" : "scale(1)" }}
              />
            ))}
          </div>
          <Button type="button" size="sm" className="h-8 rounded-md text-xs" onClick={handleCreate} disabled={!newName.trim() || createTag.isPending}>
            {t("tagSelector.create")}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowCreate(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { toastError, toastSuccess } from '../../lib/toastStore';
import type { CategoryRow } from '../../types/database';
import { deleteCategory, upsertCategory } from './adminApi';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface CategoryManagerProps {
  categories: CategoryRow[];
  onChange: (categories: CategoryRow[]) => void;
}

export function CategoryManager({ categories, onChange }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    const slug = slugify(name);
    if (categories.some((c) => c.slug === slug)) {
      toastError('That category already exists.');
      return;
    }
    const row: CategoryRow = { slug, name, sort_order: categories.length };
    try {
      await upsertCategory(row);
      onChange([...categories, row]);
      setNewName('');
      toastSuccess('Category added.');
    } catch {
      toastError('Could not add category.');
    }
  }

  async function handleRename(slug: string, name: string) {
    const updated = categories.map((c) => (c.slug === slug ? { ...c, name } : c));
    onChange(updated);
    try {
      await upsertCategory(updated.find((c) => c.slug === slug)!);
    } catch {
      toastError('Could not rename category.');
      onChange(categories);
    }
  }

  async function handleReorder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!];
    const withOrder = reordered.map((c, i) => ({ ...c, sort_order: i }));
    const previous = categories;
    onChange(withOrder);

    try {
      await Promise.all(withOrder.map((c) => upsertCategory(c)));
    } catch {
      toastError('Could not reorder categories.');
      onChange(previous);
    }
  }

  async function handleDelete(slug: string) {
    const previous = categories;
    onChange(categories.filter((c) => c.slug !== slug));
    try {
      await deleteCategory(slug);
      toastSuccess('Category removed.');
    } catch {
      toastError('Could not remove category.');
      onChange(previous);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {categories.map((category, index) => (
        <div key={category.slug} className="flex items-center gap-2">
          <input
            value={category.name}
            onChange={(e) => void handleRename(category.slug, e.target.value)}
            className="flex-1 rounded-md border border-border bg-raised px-2.5 py-1.5 text-[13px] text-text focus-visible:outline-none"
          />
          <IconButton
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => void handleReorder(index, -1)}
          >
            <ArrowUp size={14} />
          </IconButton>
          <IconButton
            aria-label="Move down"
            disabled={index === categories.length - 1}
            onClick={() => void handleReorder(index, 1)}
          >
            <ArrowDown size={14} />
          </IconButton>
          <IconButton aria-label="Delete category" onClick={() => void handleDelete(category.slug)}>
            <Trash2 size={14} />
          </IconButton>
        </div>
      ))}

      <div className="mt-1 flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-md border border-border bg-raised px-2.5 py-1.5 text-[13px] text-text placeholder:text-muted focus-visible:outline-none"
        />
        <Button variant="secondary" onClick={() => void handleAdd()}>
          <Plus size={14} />
          Add
        </Button>
      </div>
    </div>
  );
}

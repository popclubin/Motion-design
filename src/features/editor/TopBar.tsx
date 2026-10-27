import { Moon, Pencil, Shield, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Pill } from '../../components/ui/Pill';
import { useThemeStore } from '../../lib/themeStore';
import { useEditorStore } from './editorStore';
import { getAnimationEntry } from '../../animations/registry';
import { useAnimationCatalog } from './animationCatalog';
import { AvatarMenu } from '../auth/AvatarMenu';
import { useAuth } from '../auth/AuthProvider';
import { ExportButton } from '../export/ExportButton';

export function TopBar() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const activeSlug = useEditorStore((s) => s.activeSlug);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { entries } = useAnimationCatalog();
  const currentCatalogItem = entries.find((e) => e.slug === activeSlug);
  const canEdit = Boolean(currentCatalogItem?.canEdit);
  const title = activeSlug ? getAnimationEntry(activeSlug)?.manifest.name : 'Untitled';

  return (
    <header className="flex h-[var(--top-bar-height)] items-center justify-between gap-3 border-b border-border bg-panel px-4">
      <div className="flex min-w-0 shrink items-center gap-2 whitespace-nowrap">
        <Link to="/editor" className="shrink-0 text-[14px] font-semibold text-text hover:text-accent transition-colors">
          Motion Library
        </Link>
        <Pill className="hidden shrink-0 sm:inline-flex">Beta</Pill>
      </div>

      <div className="min-w-0 flex-1 truncate text-center text-[13px] font-medium whitespace-nowrap text-text">
        {title}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4 ml-4">
        {isAdmin && (
          <Link to="/admin">
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 text-[12px] h-8 px-2.5 text-text hover:text-accent"
              title="Admin Panel"
            >
              <Shield size={14} className="text-accent" />
              <span>Admin</span>
            </Button>
          </Link>
        )}
        {canEdit && (
          <Button
            variant="secondary"
            onClick={() => navigate(`/add-animation?edit=${activeSlug}`)}
            className="flex items-center gap-1.5 text-[12px] h-8 px-2.5"
            title="Edit this animation"
          >
            <Pencil size={13} className="text-accent" />
            <span>Edit</span>
          </Button>
        )}
        <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <ExportButton />
        <AvatarMenu />
      </div>
    </header>
  );
}

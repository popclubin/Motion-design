import { Moon, Sun } from 'lucide-react';
import { Link } from 'react-router';
import { IconButton } from '../../components/ui/IconButton';
import { Pill } from '../../components/ui/Pill';
import { useThemeStore } from '../../lib/themeStore';
import { useEditorStore } from './editorStore';
import { getAnimationEntry } from '../../animations/registry';
import { AvatarMenu } from '../auth/AvatarMenu';
import { ExportButton } from '../export/ExportButton';

export function TopBar() {
  const activeSlug = useEditorStore((s) => s.activeSlug);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const title = activeSlug ? getAnimationEntry(activeSlug)?.manifest.name : 'Untitled';

  return (
    <header className="flex h-[var(--top-bar-height)] items-center justify-between gap-3 overflow-hidden border-b border-border bg-panel px-4">
      <div className="flex min-w-0 shrink items-center gap-2 whitespace-nowrap">
        <Link to="/editor" className="shrink-0 text-[14px] font-semibold text-text">
          Motion Library
        </Link>
        <Pill className="hidden shrink-0 sm:inline-flex">Beta</Pill>
        <Link
          to="/editor"
          className="ml-3 hidden shrink-0 text-[13px] text-muted hover:text-text md:inline"
        >
          Projects
        </Link>
      </div>

      <div className="min-w-0 flex-1 truncate text-center text-[13px] font-medium whitespace-nowrap text-text">
        {title}
      </div>

      <div className="flex shrink-0 items-center gap-7 ml-4">
        <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <ExportButton />
        <AvatarMenu />
      </div>
    </header>
  );
}

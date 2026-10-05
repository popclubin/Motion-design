import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from './AuthProvider';

export function AvatarMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!user) return null;

  const name = profile?.full_name ?? user.email ?? 'Account';

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button ref={buttonRef} type="button" onClick={handleToggle} aria-label="Account menu">
        <Avatar name={name} src={profile?.avatar_url ?? undefined} />
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPosition.top, right: menuPosition.right }}
            className="fixed z-50 w-56 rounded-md border border-border bg-panel p-1.5 shadow-panel"
          >
            <div className="px-2.5 py-2">
              <p className="truncate text-[13px] font-medium text-text">{name}</p>
              <p className="truncate text-[12px] text-muted">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-sm px-2.5 py-1.5 text-[13px] text-text hover:bg-raised"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="block w-full rounded-sm px-2.5 py-1.5 text-left text-[13px] text-text hover:bg-raised"
            >
              Sign out
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

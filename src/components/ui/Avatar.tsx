interface AvatarProps {
  name: string;
  src?: string;
}

export function Avatar({ name, src }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (src) {
    return <img src={src} alt={name} className="h-8 w-8 rounded-full object-cover" />;
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white">
      {initial}
    </span>
  );
}

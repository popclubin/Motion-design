export type StageFrame = 'phone' | 'square' | 'free';

export interface AnimationManifest {
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  addedAt: string;
  dependencies?: Record<string, string>;
  frame: StageFrame;
}

export function defineManifest(manifest: AnimationManifest): AnimationManifest {
  return manifest;
}

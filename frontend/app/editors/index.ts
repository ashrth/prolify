import type React from "react";
import {
  DisciplineEditor,
  disciplineDefaults,
  disciplineMissing,
} from "./discipline";
import type { Motion } from "../components/pick";

/** What the app gives every editor: uploading clips and making cutouts. */
export type EditorTools = {
  upload: (file: File) => Promise<string>;
  cutout: (
    src: string,
    at: number,
    seconds: number,
  ) => Promise<{ folder: string; count: number }>;
  analyze: (src: string) => Promise<Motion>;
};

/** Each template's editor in the app. Add a template here when it's ready. */
export type EditorDef = {
  Editor: React.FC<{
    content: any;
    onChange: (c: any) => void;
    tools: EditorTools;
  }>;
  defaults: () => any;
  missing: (content: any) => string[];
};

export const editors: Record<string, EditorDef> = {
  discipline: {
    Editor: DisciplineEditor,
    defaults: disciplineDefaults,
    missing: disciplineMissing,
  },
};

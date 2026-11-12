import type React from "react";
import {
  DisciplineEditor,
  disciplineDefaults,
  disciplineMissing,
} from "./discipline";

/** Each template's editor in the app. Add a template here when it's ready. */
export type EditorDef = {
  Editor: React.FC<{
    content: any;
    onChange: (c: any) => void;
    upload: (file: File) => Promise<string>;
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

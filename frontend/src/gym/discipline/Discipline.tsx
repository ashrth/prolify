import React from "react";
import { VideoFromScript } from "../../core/VideoFromScript";
import { disciplineTemplate, type DisciplineContent } from "./template";

// The one DISCIPLINE composition. Which version it shows depends only on the content it's given.
export type DisciplineProps = { content: DisciplineContent };

export const Discipline: React.FC<DisciplineProps> = ({ content }) => (
  <VideoFromScript script={disciplineTemplate(content)} />
);

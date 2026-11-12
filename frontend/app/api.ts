export type TemplateInfo = {
  composition: string;
  category: string;
  label: string;
  description?: string;
  ratio?: string;
};

const get = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

export const api = {
  templates: () => get<Record<string, TemplateInfo>>("/api/templates"),
  projects: (template: string) => get<string[]>(`/api/projects/${template}`),
};

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
  project: (template: string, project: string) =>
    get<unknown>(`/api/projects/${template}/${project}`),

  save: async (template: string, project: string, content: unknown) => {
    const res = await fetch(`/api/projects/${template}/${project}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    if (!res.ok) throw new Error(`save failed (${res.status})`);
  },

  /** Sends a clip to the server; returns its address. */
  upload: async (
    template: string,
    project: string,
    file: File,
  ): Promise<string> => {
    const form = new FormData();
    form.append("files", file);
    const res = await fetch(`/api/projects/${template}/${project}/files`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`upload failed (${res.status})`);
    const { files } = (await res.json()) as { files: string[] };
    return files[0];
  },
};

/** A path from a project (a /public path or a server address) as something the browser can load. */
export const playable = (src: string) =>
  /^https?:\/\//.test(src) ? src : `/${src}`;

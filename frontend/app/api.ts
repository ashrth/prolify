import type { Motion } from "./components/pick";

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

  /** How much movement there is through a clip (the server measures it once, then remembers). */
  analyze: async (src: string): Promise<Motion> => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
    });
    if (!res.ok) throw new Error(`analysis failed (${res.status})`);
    return res.json();
  },
  
  /** Makes a cutout of `seconds` of a clip from `at` on the server, waits for it (a few minutes). */
  cutout: async (
    template: string,
    project: string,
    src: string,
    at: number,
    seconds: number,
  ) => {
    const res = await fetch(`/api/cutout/${template}/${project}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src, at, seconds }),
    });
    if (!res.ok) throw new Error(`cutout failed to start (${res.status})`);
    const { id } = (await res.json()) as { id: string };
    for (;;) {
      await new Promise((r) => setTimeout(r, 2000));
      const job = await get<{
        status: string;
        folder?: string;
        count?: number;
        error?: string;
      }>(`/api/cutout/${id}`);
      if (job.status === "done")
        return { folder: job.folder!, count: job.count! };
      if (job.status === "error") throw new Error(job.error ?? "cutout failed");
    }
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

  /** Puts this project into the Studio; returns the composition to open. */
  studio: async (template: string, project: string): Promise<string> => {
    const res = await fetch(`/api/studio/${template}/${project}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`couldn't open in Studio (${res.status})`);
    return ((await res.json()) as { composition: string }).composition;
  },
};

/** A path from a project (a /public path or a server address) as something the browser can load. */
export const playable = (src: string) =>
  /^https?:\/\//.test(src) ? src : `/${src}`;

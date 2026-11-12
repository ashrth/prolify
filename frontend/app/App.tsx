import React, { useEffect, useState } from "react";
import { api, type TemplateInfo } from "./api";
import { editors } from "./editors";

// The categories on the home screen
const CATEGORIES = [
  { id: "gym", label: "gym", description: "workout edits" },
  { id: "x657o", label: "x657o", description: "effect promos" },
  { id: "dream", label: "dream", description: "dreamy edits" },
];

// Pages live in the address (#/gym/discipline/legs), so the browser's back button works
const useRoute = () => {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);
};
const go = (...parts: string[]) =>
  (window.location.hash = "/" + parts.map(encodeURIComponent).join("/"));

const Shell: React.FC<{ back?: () => void; children: React.ReactNode }> = ({
  back,
  children,
}) => (
  <div className="shell">
    <header>
      <span className="logo" onClick={() => go()}>
        prolify
      </span>
      {back ? (
        <button className="link" onClick={back}>
          ← back
        </button>
      ) : null}
    </header>
    <main>{children}</main>
  </div>
);

export const App: React.FC = () => {
  const route = useRoute();
  const [templates, setTemplates] = useState<Record<
    string,
    TemplateInfo
  > | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    api
      .templates()
      .then(setTemplates)
      .catch(() => setOffline(true));
  }, []);

  if (offline)
    return (
      <Shell>
        <h1>can't reach the server</h1>
        <p className="muted">
          start it from the frontend folder with <code>npm run server</code>,
          then reload.
        </p>
      </Shell>
    );
  if (!templates)
    return (
      <Shell>
        <p className="muted">loading…</p>
      </Shell>
    );

  const [category, template, project] = route;
  if (category && template && project)
    return (
      <ProjectScreen
        key={`${template}/${project}`}
        category={category}
        template={template}
        project={project}
        info={templates[template]}
      />
    );
  if (category && template)
    return (
      <TemplateScreen
        category={category}
        template={template}
        info={templates[template]}
      />
    );
  if (category)
    return <CategoryScreen category={category} templates={templates} />;
  return <Home templates={templates} />;
};

const Home: React.FC<{ templates: Record<string, TemplateInfo> }> = ({
  templates,
}) => (
  <Shell>
    <h1>what do you want to create today?</h1>
    <div className="grid">
      {CATEGORIES.map((c) => {
        const count = Object.values(templates).filter(
          (t) => t.category === c.id,
        ).length;
        return (
          <button
            key={c.id}
            className="card"
            onClick={() => go(c.id)}
            disabled={count === 0}
          >
            <span className="card-title">{c.label}</span>
            <span className="muted">{c.description}</span>
            <span className="tag">
              {count
                ? `${count} template${count > 1 ? "s" : ""}`
                : "coming soon"}
            </span>
          </button>
        );
      })}
    </div>
  </Shell>
);

const CategoryScreen: React.FC<{
  category: string;
  templates: Record<string, TemplateInfo>;
}> = ({ category, templates }) => {
  const list = Object.entries(templates).filter(
    ([, t]) => t.category === category,
  );
  return (
    <Shell back={() => go()}>
      <h1>which template?</h1>
      <div className="grid">
        {list.map(([id, t]) => (
          <button key={id} className="card" onClick={() => go(category, id)}>
            <span className="card-title">{t.label}</span>
            {t.description ? (
              <span className="muted">{t.description}</span>
            ) : null}
            {t.ratio ? <span className="tag">{t.ratio}</span> : null}
          </button>
        ))}
      </div>
    </Shell>
  );
};

const TemplateScreen: React.FC<{
  category: string;
  template: string;
  info?: TemplateInfo;
}> = ({ category, template, info }) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [name, setName] = useState("");
  useEffect(() => {
    api
      .projects(template)
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [template]);
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <Shell back={() => go(category)}>
      <h1>{info?.label ?? template}</h1>
      <h2>new video</h2>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean) go(category, template, clean);
        }}
      >
        <input
          placeholder="name it, e.g. legs"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="primary" disabled={!clean}>
          create
        </button>
      </form>
      <h2>your videos</h2>
      {projects.length ? (
        <div className="list">
          {projects.map((p) => (
            <button
              key={p}
              className="list-item"
              onClick={() => go(category, template, p)}
            >
              {p}
            </button>
          ))}
        </div>
      ) : (
        <p className="muted">none yet</p>
      )}
    </Shell>
  );
};

const ProjectScreen: React.FC<{
  category: string;
  template: string;
  project: string;
  info?: TemplateInfo;
}> = ({ category, template, project, info }) => {
  const def = editors[template];
  const [content, setContent] = useState<unknown>(null);
  const [saved, setSaved] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!def) return;
    api
      .project(template, project)
      .then(setContent)
      .catch(() => {
        setContent(def.defaults()); // a new video: start from the template's empty slots
        setSaved(false);
      });
  }, [template, project]);

  if (!def)
    return (
      <Shell back={() => go(category, template)}>
        <h1>{project}</h1>
        <p className="muted">this template doesn't have an editor yet</p>
      </Shell>
    );
  if (!content)
    return (
      <Shell back={() => go(category, template)}>
        <p className="muted">loading…</p>
      </Shell>
    );

  const missing = def.missing(content);
  const save = async () => {
    setStatus("saving…");
    try {
      await api.save(template, project, content);
      setSaved(true);
      setStatus("saved");
      return true;
    } catch (e) {
      setStatus(String(e));
      return false;
    }
  };
  const openInStudio = async () => {
    if (!(await save())) return; // the Studio shows the saved version
    try {
      const composition = await api.studio(template, project);
      window.open(`http://localhost:3000/${composition}`, "prolify-studio"); // reuses the same tab each time
    } catch (e) {
      setStatus(String(e));
    }
  };

  return (
    <Shell back={() => go(category, template)}>
      <div className="project-head">
        <div>
          <h1>{project}</h1>
          <p className="muted">
            {info?.label ?? template}
            {info?.ratio ? ` · ${info.ratio}` : ""}
          </p>
        </div>
        <div className="row small-gap">
          <span className="muted small">
            {saved ? status : "unsaved changes"}
          </span>
          <button
            className="secondary"
            onClick={openInStudio}
            disabled={missing.length > 0}
          >
            open in Studio
          </button>
          <button className="primary" onClick={save} disabled={saved}>
            save
          </button>
        </div>
      </div>
      {missing.length ? (
        <p className="warn small">
          still missing: {missing.join(", ")}. "open in Studio" works once every
          slot has a clip.
        </p>
      ) : null}
      <def.Editor
        content={content}
        onChange={(c) => {
          setContent(c);
          setSaved(false);
        }}
        upload={(file) => api.upload(template, project, file)}
      />
    </Shell>
  );
};

// The Prolify local server: uploads, projects and rendering.
// Start it from the frontend folder:  npm run server
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = path.join(ROOT, "media");
const PROJECTS = path.join(ROOT, "projects");
const OUT = path.join(ROOT, "out");
const PORT = 4000;
const BASE = `http://localhost:${PORT}`;

// The templates the app can make. Add one here when a template is ready.
const TEMPLATES = {
  discipline: {
    composition: "discipline",
    category: "gym",
    label: "discipline",
    description: "the word behind the hero, 22 cuts on the beat, glitch ending",
    ratio: "16:9",
  },
};

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/media", express.static(MEDIA));
app.use("/out", express.static(OUT));

const safe = (s) => String(s).replace(/[^\w.\-]/g, "_");
const projectFile = (t, p) => path.join(PROJECTS, safe(t), `${safe(p)}.json`);

app.get("/api/templates", (req, res) => res.json(TEMPLATES));

// ── uploads: any size, it all stays on your machine ─────────
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(
        MEDIA,
        safe(req.params.template),
        safe(req.params.project),
      );
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, safe(file.originalname)),
  }),
});

app.post(
  "/api/projects/:template/:project/files",
  upload.array("files"),
  (req, res) => {
    const { template, project } = req.params;
    res.json({
      files: req.files.map(
        (f) => `${BASE}/media/${safe(template)}/${safe(project)}/${f.filename}`,
      ),
    });
  },
);

// ── projects: the content JSON that fills a template ────────
app.get("/api/projects/:template", (req, res) => {
  const dir = path.join(PROJECTS, safe(req.params.template));
  const list = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.slice(0, -5))
    : [];
  res.json(list);
});

app.get("/api/projects/:template/:project", (req, res) => {
  const file = projectFile(req.params.template, req.params.project);
  if (!fs.existsSync(file))
    return res.status(404).json({ error: "no such project" });
  res.json(JSON.parse(fs.readFileSync(file, "utf8")));
});

app.put("/api/projects/:template/:project", (req, res) => {
  const file = projectFile(req.params.template, req.params.project);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
  res.json({ saved: file });
});

// ── rendering ───────────────────────────────────────────────
// Remotion first "bundles" the project (prepares it to render). That's done once and reused.
let bundling = null;
const getBundle = (fresh) => {
  if (!bundling || fresh) {
    console.log("preparing the Remotion project…");
    bundling = bundle({
      entryPoint: path.join(ROOT, "src/index.ts"),
      rootDir: ROOT,
    }).catch((e) => {
      bundling = null;
      throw e;
    });
  }
  return bundling;
};

const jobs = new Map();

app.post("/api/render/:template/:project", async (req, res) => {
  const { template, project } = req.params;
  const t = TEMPLATES[template];
  if (!t) return res.status(404).json({ error: "unknown template" });
  const file = projectFile(template, project);
  if (!fs.existsSync(file))
    return res.status(404).json({ error: "save the project first" });

  const content = JSON.parse(fs.readFileSync(file, "utf8"));
  const id = `${safe(template)}-${safe(project)}-${Date.now()}`;
  const output = path.join(OUT, `${id}.mp4`);
  jobs.set(id, { status: "preparing", progress: 0 });
  res.json({ id });

  try {
    const serveUrl = await getBundle(req.query.fresh === "1"); // ?fresh=1 after you change template code
    const inputProps = { content };
    const composition = await selectComposition({
      serveUrl,
      id: t.composition,
      inputProps,
    });
    fs.mkdirSync(OUT, { recursive: true });
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: output,
      inputProps,
      concurrency: 2,
      onProgress: ({ progress }) =>
        jobs.set(id, { status: "rendering", progress }),
    });
    jobs.set(id, { status: "done", progress: 1, url: `${BASE}/out/${id}.mp4` });
    console.log("done:", output);
  } catch (e) {
    console.error(e);
    jobs.set(id, { status: "error", error: String(e?.message ?? e) });
  }
});

app.get("/api/render/:id", (req, res) =>
  res.json(jobs.get(req.params.id) ?? { status: "unknown" }),
);

app.listen(PORT, () => console.log(`Prolify server running on ${BASE}`));

import type {
  DreamClip,
  DreamCutout,
  DreamLayer,
  DreamShot,
  VideoScript,
} from "../../core/types";

// ─── Switches ───────────────────────────────────────────────
// Set to true once woman1.mp4, woman2.mp4 and their cutout folders are in public/dream.
const HAS_WOMAN = true;
// true = black and white
const MONO = true;

// ─── Your media (all in public/dream/) ──────────────────────
const clips: Record<string, DreamClip> = {
  hand: { src: "dream/hand_sunshine.mp4" }, // sunlit hand
  handAscii: { src: "dream/hand.mp4" }, // same hand, ASCII effect (lines up exactly with `hand`)
  mtn: { src: "dream/IMG_0598.MOV" }, // mountains + clouds, 16:9
  mtnNode: { src: "dream/node_mountains.mp4" }, // same, node effect
  clouds: { src: "dream/IMG_4265.MOV" }, // moving clouds, 16:9
  cloudsFx: { src: "dream/moving_clouds.mp4" }, // same, with effect
  rock: { src: "dream/IMG_0596.MOV" }, // hands on rock (0–4s), then misty mountains (5s on)
  fog: { src: "dream/fog-road.mp4" }, // foggy road (rename e5884ea8….mp4 to fog-road.mp4)
  forest: { src: "dream/IMG_7814.MOV" }, // road through the forest
  night: { src: "dream/IMG_1918.MOV" }, // dark night road
  car: { src: "dream/car-ride.mov" }, // car at night, filmed at 120fps: smooth slow motion
  woman1: { src: "dream/woman1.MP4" },
  woman2: { src: "dream/woman2.MP4" },
};

// Fill in fps and count after making the cutouts (ffprobe for fps, `ls … | wc -l` for count).
const cutouts: Record<string, DreamCutout> = {
  woman1: { folder: "dream/woman1-cutout", fps: 30, count: 579 },
  woman2: { folder: "dream/woman2-cutout", fps: 30, count: 402 },
};

const photo = {
  horses: "dream/horses.jpg",
  sunsetClouds: "dream/sunset-clouds.jpg",
  moon: "dream/moon.jpg",
  sunsetBlur: "dream/sunset-blur.jpg",
};

// ─── Her moments: CHANGE THESE to the seconds in her clips ──
// `at` = where the moment starts in woman1.mp4 / woman2.mp4.
const HER = {
  getsUp: 0.1, // picking something up and rising
  singing: 4.0, // looking at herself, singing along
  singing2: 2.0, // (woman2) another singing moment
  walksAway: 12.0, // walking away from the camera
  legUp: 15.0, // the fit-check pose
  showFront: 9.0, // showing the front of her outfit
  showClose: 17.5, // showing the close-up of her outfit
  hairFlip: 6.8, // flipping her hair
  afterHairFlip: 8.0, // after the hair flip, looking at herself
};
const her = (layer: DreamLayer): DreamLayer[] => (HAS_WOMAN ? [layer] : []);

// ─── Timing ─────────────────────────────────────────────────
const BURST = 3; // frames per shot in the fast bursts (3 = 0.1s)
const burst = (layers: DreamLayer[][]): DreamShot[] =>
  layers.map((l) => ({ frames: BURST, layers: l }));

const shots: DreamShot[] = [
  // 1. Opening burst: fast flickers of every world
  ...burst([
    [{ clip: "fog", at: 2.0 }],
    [{ clip: "clouds", at: 1.0 }],
    [{ clip: "hand", at: 0.5 }],
    [{ clip: "night", at: 2.0 }],
    [{ clip: "mtn", at: 6.0 }],
    [{ clip: "forest", at: 1.5 }],
    [{ image: photo.sunsetBlur }],
    [{ clip: "car", at: 0.5 }],
    [{ clip: "rock", at: 1.0 }],
    [{ clip: "cloudsFx", at: 3.0 }],
    [{ image: photo.moon }],
    [{ clip: "fog", at: 5.0 }],
  ]),

  // 2. She rises, in slow motion, over moving clouds
  {
    frames: 90,
    flash: "white-black",
    glow: 0.4,
    shake: 0.4,
    layers: [
      { clip: "clouds", at: 0.5, rate: 0.6, drift: "up" },
      ...(HAS_WOMAN
        ? []
        : [
            {
              image: photo.sunsetClouds,
              blend: "screen" as const,
              opacity: 0.55,
              drift: "in" as const,
            },
          ]),
      ...her({ cutout: "woman1", at: HER.getsUp, rate: 0.6 }),
    ],
  },

  // 3. The sunlit hand, turning into ASCII from the top down
  {
    frames: 48,
    glow: 0.3,
    layers: [
      { clip: "hand", at: 1.0, drift: "in" },
      {
        clip: "handAscii",
        at: 1.0,
        drift: "in",
        appear: { at: 16, frames: 22, how: "wipe-down" },
      },
    ],
  },

  // 4. Singing, double-exposed into the mountains
  {
    frames: 42,
    flash: "black",
    echo: true,
    soft: 1,
    layers: [
      { clip: "mtnNode", at: 2.0, drift: "in" },
      ...(HAS_WOMAN
        ? [{ cutout: "woman1", at: HER.hairFlip, rate: 0.5, opacity: 0.85 }]
        : [
            {
              image: photo.sunsetClouds,
              blend: "screen" as const,
              opacity: 0.85,
              drift: "up" as const,
            },
          ]),
    ],
  },
  {
    frames: 42,
    echo: true,
    soft: 1,
    glow: 0.3,
    layers: [
      { clip: "mtn", at: 3.4, drift: "in" },
      ...(HAS_WOMAN
        ? [{ cutout: "woman1", at: HER.afterHairFlip, opacity: 0.85 }]
        : [
            {
              image: photo.sunsetClouds,
              blend: "screen" as const,
              opacity: 0.85,
              drift: "up" as const,
            },
          ]),
    ],
  },
  // 5. The node effect fades in over the same view
  {
    frames: 30,
    layers: [
      { clip: "mtn", at: 4.8, zoom: 1.12 },
      {
        clip: "mtnNode",
        at: 4.8,
        zoom: 1.12,
        appear: { at: 4, frames: 18, how: "fade" },
      },
    ],
  },

  // 6. Second burst
  ...burst([
    [{ clip: "forest", at: 3.0 }],
    [{ clip: "night", at: 4.0 }],
    [{ clip: "cloudsFx", at: 1.0 }],
    [{ image: photo.horses }],
    [{ clip: "fog", at: 6.5 }],
    [{ clip: "car", at: 2.0 }],
    [{ clip: "rock", at: 2.5 }],
    [{ image: photo.moon, zoom: 1.3 }],
    [{ image: photo.sunsetBlur, zoom: 1.2 }],
    [{ clip: "handAscii", at: 3.5 }],
  ]),

  // 7. Close on her singing, slowed down, clouds drifting through her
  {
    frames: 30,
    flash: "white",
    echo: true,
    soft: 1.5,
    glow: 0.35,
    layers: HAS_WOMAN
      ? [
          { clip: "clouds", at: 2.0, rate: 0.6, drift: "in" },
          { cutout: "woman2", at: HER.showFront, rate: 0.8 },
          {
            image: photo.sunsetClouds,
            blend: "screen",
            opacity: 0.35,
            drift: "down",
          },
        ]
      : [{ clip: "car", at: 4.2, rate: 0.25, drift: "in" }],
  },
  {
    frames: 30,
    echo: true,
    soft: 1.5,
    glow: 0.35,
    layers: HAS_WOMAN
      ? [
          { clip: "clouds", at: 2.6, rate: 0.6, drift: "in" },

          {
            image: photo.sunsetClouds,
            blend: "screen",
            opacity: 0.35,
            drift: "down",
          },
        ]
      : [{ clip: "car", at: 4.45, rate: 0.25, drift: "in" }],
  },

  // 8. Night drive in slow motion, lights blooming
  { frames: 30, glow: 0.5, layers: [{ clip: "car", at: 3.4, rate: 0.3 }] },

  // 9. She walks away into the fog
  {
    frames: 75,
    flash: "white",
    soft: 1,
    glow: 0.3,
    shake: 0.3,
    layers: [
      { clip: "fog", at: 1.0, drift: "in" },
      { clip: "car", at: 3.4, rate: 0.3 },
    ],
  },

  // 10. Fit check, slow, over the misty mountains, washing out to white
  {
    frames: 60,
    glow: 0.45,
    whiteOut: 24,
    layers: [
      { clip: "rock", at: 6.0, drift: "up" },
      ...(HAS_WOMAN
        ? []
        : [{ image: photo.moon, blend: "soft-light" as const, opacity: 0.6 }]),
      ...her({ cutout: "woman1", at: HER.showClose, rate: 0.8 }),
    ],
  },

  // 11. Black while the music finishes
  { frames: 25, layers: [] },
];

export const dreamEdit: VideoScript = {
  brand: {
    name: "dream",
    logo: "",
    url: "",
    colors: {
      bg: "#000000",
      panel: "#000000",
      text: "#FFFFFF",
      textMuted: "rgba(255,255,255,0.6)",
      accent: "#FFFFFF",
      chrome: ["#555", "#eee", "#888", "#ddd"],
    },
  },
  // Add your track as public/dream/track.mp3, then remove the // on the next line:
  music: { src: "dream/DIM_music.mp3", volume: 1, fade: true },
  scenes: [
    {
      type: "dream",
      duration: shots.reduce((t, s) => t + s.frames, 0),
      clips,
      cutouts,
      shots,
      mono: MONO,
    },
  ],
};

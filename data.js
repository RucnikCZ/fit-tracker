// Tréninkové plány — cviky, defaultní sety, reps, poznámky
export const WORKOUT_PLANS = {
  pull: {
    label: "Pull",
    exercises: [
      {
        name: "Deadlift",
        defaultSets: 4,
        defaultReps: "4-5",
        note: "~85% 1RM / RPE 8. Straps doporučeny.",
        isMain: true
      },
      {
        name: "Lat pulldown nadhmat",
        defaultSets: 3,
        defaultReps: "8-10",
        note: null,
        isMain: false
      },
      {
        name: "Seated cable row",
        defaultSets: 3,
        defaultReps: "8-10",
        note: "Pomalý eccentric",
        isMain: false
      },
      {
        name: "Face pull",
        defaultSets: 3,
        defaultReps: "15-20",
        note: null,
        isMain: false
      },
      {
        name: "EZ-bar curl",
        defaultSets: 3,
        defaultReps: "10-12",
        note: null,
        isMain: false
      },
      {
        name: "Hammer curl",
        defaultSets: 3,
        defaultReps: "10-12",
        note: null,
        isMain: false
      }
    ]
  },
  legs: {
    label: "Legs",
    exercises: [
      {
        name: "Back squat",
        defaultSets: 5,
        defaultReps: "4-5",
        note: "~85% 1RM / RPE 8. Elevated heel ≥15mm (lifting shoes).",
        isMain: true
      },
      {
        name: "Leg press",
        defaultSets: 4,
        defaultReps: "6-8",
        note: "Chodidlo střed–výše, ploché.",
        isMain: false
      },
      {
        name: "Hip thrust",
        defaultSets: 4,
        defaultReps: "6-8",
        note: null,
        isMain: false
      },
      {
        name: "Lying leg curl",
        defaultSets: 3,
        defaultReps: "8-10",
        note: null,
        isMain: false
      },
      {
        name: "Standing calf raise",
        defaultSets: 4,
        defaultReps: "10-12",
        note: null,
        isMain: false
      }
    ]
  },
  push: {
    label: "Push",
    exercises: [
      {
        name: "Bench press",
        defaultSets: 4,
        defaultReps: "4-5",
        note: "~85% 1RM / RPE 8",
        isMain: true
      },
      {
        name: "Overhead press",
        defaultSets: 4,
        defaultReps: "4-5",
        note: "~85% 1RM / RPE 8",
        isMain: true
      },
      {
        name: "Incline DB press",
        defaultSets: 3,
        defaultReps: "8-10",
        note: null,
        isMain: false
      },
      {
        name: "Cable lateral raise",
        defaultSets: 3,
        defaultReps: "12-15",
        note: null,
        isMain: false
      },
      {
        name: "Tricep pushdown",
        defaultSets: 3,
        defaultReps: "10-12",
        note: null,
        isMain: false
      },
      {
        name: "Overhead tricep extension",
        defaultSets: 3,
        defaultReps: "10-12",
        note: null,
        isMain: false
      }
    ]
  }
};

export const WEEK_LABELS = {
  1: "Týden 1 — progrese",
  2: "Týden 2 — progrese",
  3: "Týden 3 — progrese",
  4: "Týden 4 — deload (−40% objem)"
};

export const MAIN_EXERCISES = ["Deadlift", "Back squat", "Bench press", "Overhead press"];

// ─── Databáze cviků ──────────────────────────────────────────────────────────
export const EXERCISES_DB = [
  // PULL
  { id: "deadlift",            name: "Deadlift",                    category: "Pull", muscles: "Záda, hamstringy, gluty", note: "~85% 1RM / RPE 8. Straps doporučeny.", isMain: true },
  { id: "lat-pulldown",        name: "Lat pulldown nadhmat",        category: "Pull", muscles: "Latissimus", note: null },
  { id: "lat-pulldown-under",  name: "Lat pulldown podhmat",        category: "Pull", muscles: "Latissimus, biceps", note: null },
  { id: "seated-cable-row",    name: "Seated cable row",            category: "Pull", muscles: "Střední záda", note: "Pomalý eccentric" },
  { id: "cable-row-wide",      name: "Cable row široký úchop",      category: "Pull", muscles: "Horní záda", note: null },
  { id: "face-pull",           name: "Face pull",                   category: "Pull", muscles: "Zadní deltoid, rotátory", note: null },
  { id: "ez-curl",             name: "EZ-bar curl",                 category: "Pull", muscles: "Biceps", note: null },
  { id: "hammer-curl",         name: "Hammer curl",                 category: "Pull", muscles: "Brachialis, biceps", note: null },
  { id: "incline-curl",        name: "Incline DB curl",             category: "Pull", muscles: "Biceps", note: null },
  { id: "cable-curl",          name: "Cable curl",                  category: "Pull", muscles: "Biceps", note: null },
  { id: "db-row",              name: "Dumbbell row",                category: "Pull", muscles: "Záda, biceps", note: null },
  { id: "pullup",              name: "Pull-up",                     category: "Pull", muscles: "Latissimus, biceps", note: null },
  { id: "chest-supported-row", name: "Chest supported row",        category: "Pull", muscles: "Střední záda", note: null },
  { id: "shrug",               name: "Barbell shrug",               category: "Pull", muscles: "Trapézius", note: "Straps doporučeny." },
  // LEGS
  { id: "back-squat",          name: "Back squat",                  category: "Legs", muscles: "Quads, gluty", note: "~85% 1RM / RPE 8. Elevated heel ≥15mm.", isMain: true },
  { id: "leg-press",           name: "Leg press",                   category: "Legs", muscles: "Quads, gluty", note: "Chodidlo střed–výše, ploché." },
  { id: "hip-thrust",          name: "Hip thrust",                  category: "Legs", muscles: "Gluty", note: null },
  { id: "lying-leg-curl",      name: "Lying leg curl",              category: "Legs", muscles: "Hamstringy", note: null },
  { id: "seated-leg-curl",     name: "Seated leg curl",             category: "Legs", muscles: "Hamstringy", note: null },
  { id: "rdl",                 name: "Romanian deadlift",           category: "Legs", muscles: "Hamstringy, gluty", note: "Straps doporučeny." },
  { id: "calf-raise-stand",    name: "Standing calf raise",         category: "Legs", muscles: "Lýtka", note: null },
  { id: "calf-raise-seated",   name: "Seated calf raise",           category: "Legs", muscles: "Soleus", note: null },
  { id: "leg-extension",       name: "Leg extension",               category: "Legs", muscles: "Quads", note: null },
  { id: "front-squat",         name: "Front squat",                 category: "Legs", muscles: "Quads", note: "Elevated heel doporučen." },
  { id: "hack-squat",          name: "Hack squat",                  category: "Legs", muscles: "Quads, gluty", note: null },
  { id: "glute-kickback",      name: "Cable glute kickback",        category: "Legs", muscles: "Gluty", note: null },
  // PUSH
  { id: "bench-press",         name: "Bench press",                 category: "Push", muscles: "Prs, triceps, deltoidy", note: "~85% 1RM / RPE 8.", isMain: true },
  { id: "ohp",                 name: "Overhead press",              category: "Push", muscles: "Deltoidy, triceps", note: "~85% 1RM / RPE 8.", isMain: true },
  { id: "incline-db-press",    name: "Incline DB press",            category: "Push", muscles: "Horní prs", note: null },
  { id: "incline-bb-press",    name: "Incline barbell press",       category: "Push", muscles: "Horní prs", note: null },
  { id: "cable-fly",           name: "Cable fly",                   category: "Push", muscles: "Prs", note: null },
  { id: "cable-lateral-raise", name: "Cable lateral raise",         category: "Push", muscles: "Střední deltoid", note: null },
  { id: "db-lateral-raise",    name: "DB lateral raise",            category: "Push", muscles: "Střední deltoid", note: null },
  { id: "tricep-pushdown",     name: "Tricep pushdown",             category: "Push", muscles: "Triceps", note: null },
  { id: "overhead-tricep-ext", name: "Overhead tricep extension",   category: "Push", muscles: "Triceps — dlouhá hlava", note: null },
  { id: "skull-crusher",       name: "Skull crusher",               category: "Push", muscles: "Triceps", note: null },
  { id: "close-grip-bench",    name: "Close grip bench press",      category: "Push", muscles: "Triceps, prs", note: null },
  { id: "dip",                 name: "Dip",                         category: "Push", muscles: "Triceps, prs", note: null },
  // CORE
  { id: "ab-wheel",            name: "Ab wheel rollout",            category: "Core", muscles: "Břicho, core", note: null },
  { id: "cable-crunch",        name: "Cable crunch",                category: "Core", muscles: "Břicho", note: null },
  { id: "plank",               name: "Plank",                       category: "Core", muscles: "Core", note: null },
  { id: "hanging-leg-raise",   name: "Hanging leg raise",           category: "Core", muscles: "Břicho, hip flexors", note: null },
];

// ─── Doporučené šablony tréninků ─────────────────────────────────────────────
export const RECOMMENDED_TEMPLATES = [
  {
    id: "tpl-pull-a",
    name: "Pull A",
    category: "Pull",
    description: "Hlavní tahový den — deadlift + záda + biceps",
    isRecommended: true,
    exercises: [
      { exerciseId: "deadlift",         sets: 4, reps: "4-5" },
      { exerciseId: "lat-pulldown",     sets: 3, reps: "8-10" },
      { exerciseId: "seated-cable-row", sets: 3, reps: "8-10" },
      { exerciseId: "face-pull",        sets: 3, reps: "15-20" },
      { exerciseId: "ez-curl",          sets: 3, reps: "10-12" },
      { exerciseId: "hammer-curl",      sets: 3, reps: "10-12" },
    ]
  },
  {
    id: "tpl-pull-b",
    name: "Pull B",
    category: "Pull",
    description: "Varianta — bez deadliftu, víc objemu na záda",
    isRecommended: true,
    exercises: [
      { exerciseId: "db-row",           sets: 4, reps: "8-10" },
      { exerciseId: "lat-pulldown-under", sets: 3, reps: "8-10" },
      { exerciseId: "chest-supported-row", sets: 3, reps: "10-12" },
      { exerciseId: "face-pull",        sets: 4, reps: "15-20" },
      { exerciseId: "incline-curl",     sets: 3, reps: "10-12" },
      { exerciseId: "cable-curl",       sets: 3, reps: "12-15" },
    ]
  },
  {
    id: "tpl-legs-a",
    name: "Legs A",
    category: "Legs",
    description: "Hlavní silový den — squat + přídatné cviky",
    isRecommended: true,
    exercises: [
      { exerciseId: "back-squat",       sets: 5, reps: "4-5" },
      { exerciseId: "leg-press",        sets: 4, reps: "6-8" },
      { exerciseId: "hip-thrust",       sets: 4, reps: "6-8" },
      { exerciseId: "lying-leg-curl",   sets: 3, reps: "8-10" },
      { exerciseId: "calf-raise-stand", sets: 4, reps: "10-12" },
    ]
  },
  {
    id: "tpl-legs-b",
    name: "Legs B",
    category: "Legs",
    description: "Hamstringy + glute focus",
    isRecommended: true,
    exercises: [
      { exerciseId: "rdl",              sets: 4, reps: "6-8" },
      { exerciseId: "leg-press",        sets: 4, reps: "8-10" },
      { exerciseId: "hip-thrust",       sets: 4, reps: "8-10" },
      { exerciseId: "seated-leg-curl",  sets: 3, reps: "10-12" },
      { exerciseId: "leg-extension",    sets: 3, reps: "12-15" },
      { exerciseId: "calf-raise-seated", sets: 4, reps: "12-15" },
    ]
  },
  {
    id: "tpl-push-a",
    name: "Push A",
    category: "Push",
    description: "Hlavní tlakový den — bench + OHP + triceps",
    isRecommended: true,
    exercises: [
      { exerciseId: "bench-press",      sets: 4, reps: "4-5" },
      { exerciseId: "ohp",              sets: 4, reps: "4-5" },
      { exerciseId: "incline-db-press", sets: 3, reps: "8-10" },
      { exerciseId: "cable-lateral-raise", sets: 3, reps: "12-15" },
      { exerciseId: "tricep-pushdown",  sets: 3, reps: "10-12" },
      { exerciseId: "overhead-tricep-ext", sets: 3, reps: "10-12" },
    ]
  },
  {
    id: "tpl-push-b",
    name: "Push B",
    category: "Push",
    description: "Varianta — víc prs a laterály",
    isRecommended: true,
    exercises: [
      { exerciseId: "incline-bb-press", sets: 4, reps: "6-8" },
      { exerciseId: "bench-press",      sets: 3, reps: "6-8" },
      { exerciseId: "cable-fly",        sets: 3, reps: "12-15" },
      { exerciseId: "db-lateral-raise", sets: 4, reps: "12-15" },
      { exerciseId: "skull-crusher",    sets: 3, reps: "10-12" },
      { exerciseId: "close-grip-bench", sets: 3, reps: "8-10" },
    ]
  },
];

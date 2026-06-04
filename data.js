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

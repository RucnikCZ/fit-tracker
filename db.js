// Local IndexedDB wrapper — offline cache + sync queue
const DB_NAME = "fittracker";
const DB_VERSION = 2;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("workouts")) {
        const ws = db.createObjectStore("workouts", { keyPath: "id" });
        ws.createIndex("date", "date");
        ws.createIndex("userId", "userId");
      }
      if (!db.objectStoreNames.contains("prs")) {
        db.createObjectStore("prs", { keyPath: "key" }); // key = userId_exerciseName
      }
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("templates")) {
        const ts = db.createObjectStore("templates", { keyPath: "id" });
        ts.createIndex("userId", "userId");
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(storeName, mode = "readonly") {
  return openDB().then(db => {
    const t = db.transaction(storeName, mode);
    return t.objectStore(storeName);
  });
}

function promisify(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const localDB = {
  async saveWorkout(workout) {
    const store = await tx("workouts", "readwrite");
    return promisify(store.put(workout));
  },

  async getWorkouts(userId) {
    const store = await tx("workouts");
    const idx = store.index("userId");
    return promisify(idx.getAll(userId));
  },

  async getWorkout(id) {
    const store = await tx("workouts");
    return promisify(store.get(id));
  },

  async deleteWorkout(id) {
    const store = await tx("workouts", "readwrite");
    return promisify(store.delete(id));
  },

  async savePR(userId, exerciseName, weight, date) {
    const store = await tx("prs", "readwrite");
    return promisify(store.put({ key: `${userId}_${exerciseName}`, userId, exerciseName, weight, date }));
  },

  async getPRs(userId) {
    const store = await tx("prs");
    const all = await promisify(store.getAll());
    return all.filter(p => p.userId === userId);
  },

  async addToSyncQueue(operation) {
    const store = await tx("syncQueue", "readwrite");
    return promisify(store.add(operation));
  },

  async getSyncQueue() {
    const store = await tx("syncQueue");
    return promisify(store.getAll());
  },

  async clearSyncQueueItem(id) {
    const store = await tx("syncQueue", "readwrite");
    return promisify(store.delete(id));
  },

  async saveTemplate(template) {
    const store = await tx("templates", "readwrite");
    return promisify(store.put(template));
  },

  async getTemplates(userId) {
    const store = await tx("templates");
    const idx = store.index("userId");
    return promisify(idx.getAll(userId));
  },

  async deleteTemplate(id) {
    const store = await tx("templates", "readwrite");
    return promisify(store.delete(id));
  }
};

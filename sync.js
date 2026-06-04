import { db as firestore } from "./config.js";
import { localDB } from "./db.js";
import {
  collection, doc, setDoc, deleteDoc, getDocs, query, where, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function syncToFirebase(userId) {
  const queue = await localDB.getSyncQueue();
  for (const op of queue) {
    try {
      if (op.type === "save_workout") {
        const ref = doc(firestore, `users/${userId}/workouts/${op.data.id}`);
        await setDoc(ref, { ...op.data, date: Timestamp.fromDate(new Date(op.data.date)) });
      } else if (op.type === "delete_workout") {
        const ref = doc(firestore, `users/${userId}/workouts/${op.id}`);
        await deleteDoc(ref);
      } else if (op.type === "save_pr") {
        const ref = doc(firestore, `users/${userId}/prs/${encodeURIComponent(op.exerciseName)}`);
        await setDoc(ref, { weight: op.weight, date: Timestamp.fromDate(new Date(op.date)) });
      }
      await localDB.clearSyncQueueItem(op.id);
    } catch (err) {
      console.warn("Sync failed for op", op, err);
    }
  }
}

export async function fetchFromFirebase(userId) {
  try {
    const workoutsRef = collection(firestore, `users/${userId}/workouts`);
    const snap = await getDocs(workoutsRef);
    const workouts = snap.docs.map(d => {
      const data = d.data();
      return { ...data, id: d.id, date: data.date?.toDate?.()?.toISOString() ?? data.date };
    });
    for (const w of workouts) {
      await localDB.saveWorkout({ ...w, userId });
    }

    const prsRef = collection(firestore, `users/${userId}/prs`);
    const prSnap = await getDocs(prsRef);
    for (const d of prSnap.docs) {
      const data = d.data();
      await localDB.savePR(userId, decodeURIComponent(d.id), data.weight, data.date?.toDate?.()?.toISOString() ?? data.date);
    }
  } catch (err) {
    console.warn("Fetch from Firebase failed:", err);
  }
}

export async function saveWorkout(userId, workout) {
  await localDB.saveWorkout({ ...workout, userId });
  if (navigator.onLine) {
    try {
      const ref = doc(firestore, `users/${userId}/workouts/${workout.id}`);
      await setDoc(ref, { ...workout, date: Timestamp.fromDate(new Date(workout.date)) });
    } catch {
      await localDB.addToSyncQueue({ type: "save_workout", data: workout });
    }
  } else {
    await localDB.addToSyncQueue({ type: "save_workout", data: workout });
  }
}

export async function deleteWorkout(userId, workoutId) {
  await localDB.deleteWorkout(workoutId);
  if (navigator.onLine) {
    try {
      const ref = doc(firestore, `users/${userId}/workouts/${workoutId}`);
      await deleteDoc(ref);
    } catch {
      await localDB.addToSyncQueue({ type: "delete_workout", id: workoutId });
    }
  } else {
    await localDB.addToSyncQueue({ type: "delete_workout", id: workoutId });
  }
}

export async function updatePR(userId, exerciseName, weight, date) {
  await localDB.savePR(userId, exerciseName, weight, date);
  if (navigator.onLine) {
    try {
      const ref = doc(firestore, `users/${userId}/prs/${encodeURIComponent(exerciseName)}`);
      await setDoc(ref, { weight, date: Timestamp.fromDate(new Date(date)) });
    } catch {
      await localDB.addToSyncQueue({ type: "save_pr", exerciseName, weight, date });
    }
  } else {
    await localDB.addToSyncQueue({ type: "save_pr", exerciseName, weight, date });
  }
}

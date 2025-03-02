import { Slot, useRouter } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { SQLiteAnyDatabase } from "expo-sqlite/build/NativeStatement";
import { Suspense, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import * as Notifications from "expo-notifications";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const locationId =
          response.notification.request.content.data.locationId;
        const taskId = response.notification.request.content.data.taskId;
        console.log("🚀 ~ locationId", locationId);
        console.log("🚀 ~ taskId", taskId);
        router.push(
          `/(drawer)/location/${locationId}/new-task?taskId=${taskId}`
        );
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <Suspense fallback={<ActivityIndicator />}>
      <SQLiteProvider
        useSuspense
        databaseName={"reports.db"}
        onInit={migrateDbIfNeeded}
      >
        <Slot />
      </SQLiteProvider>
    </Suspense>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  console.log("🚀 ~ migrateDbIfNeeded ~ version:", version);
  if (!version) return;

  let currentDbVersion = version.user_version;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    console.log("Migrating db to version 1");
    await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
    CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, isUrgent INTEGER NOT NULL, locationId INTEGER, imageUri TEXT, FOREIGN KEY (locationId) REFERENCES locations(id));
`);
    await db.runAsync("INSERT INTO locations (name) VALUES (?)", "School");
    await db.runAsync("INSERT INTO locations (name) VALUES (?)", "Hospital");
    await db.runAsync(
      "INSERT INTO tasks (title, description, isUrgent, locationId) VALUES (?, ?, ?, ?)",
      ["Task 1", "Description 1", 0, 1]
    );
    await db.runAsync(
      "INSERT INTO tasks (title, description, isUrgent, locationId) VALUES (?, ?, ?, ?)",
      ["Task 2", "Description 2", 1, 2]
    );

    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useState } from "react";
import { Link, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { LocationType, Task } from "@/types/interfaces";
import { FlatList } from "react-native-gesture-handler";
import TaskListItem from "@/components/TaskListItem";

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [location, setLocation] = useState<LocationType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadLocation = useCallback(async () => {
    const [location] = await db.getAllSync(
      `SELECT * FROM locations WHERE id = ?`,
      Number(id)
    );
    if (!location) {
      return;
    }
    console.log("🚀 ~ loadLocation ~ location", location);
    setLocation(location as LocationType);
    const tasks = await db.getAllAsync(
      `SELECT * FROM tasks WHERE locationId = ?`,
      id
    );
    setTasks(tasks as Task[]);
  }, [id, db]);

  useFocusEffect(
    useCallback(() => {
      loadLocation();
    }, [loadLocation])
  );
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: location?.name ?? "Tasks" }} />
      <FlatList
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks added yet for Location</Text>
        }
        data={tasks}
        renderItem={({ item }) => <TaskListItem task={item} />}
      />
      <Link href={`/location/${id}/new-task`} asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={{ color: "white", fontSize: 26 }}>+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderRadius: 28,
    backgroundColor: "#F2A310",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: "white",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    color: "#666",
  },
});

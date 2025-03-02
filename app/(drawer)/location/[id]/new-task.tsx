import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React, { useEffect } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Task } from "@/types/interfaces";
import { TextInput } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const NewTask = () => {
  const { id: locationId, taskId } = useLocalSearchParams<{
    id: string;
    taskId: string;
  }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isUrgent, setIsUrgent] = React.useState(false);
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  console.log("🚀 ~ locationId", locationId);
  console.log("🚀  ~ taskId", taskId ?? "New Task");
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  const loadTaskData = React.useCallback(async () => {
    if (taskId) {
      const [task] = await db.getAllSync<Task>(
        `SELECT * FROM tasks WHERE id = ?`,
        taskId
      );
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setIsUrgent(task.isUrgent);
        setImageUri(task.imageUri);
      }
    }
  }, [taskId, db]);
  const handleSaveTask = async () => {
    try {
      let newTaskId = Number(taskId);
      if (newTaskId) {
        await db.runAsync(
          `UPDATE tasks SET title = ?, description = ?, isUrgent = ?, locationId = ?, imageUri = ? WHERE id = ?`,
          [
            title,
            description,
            isUrgent ? 1 : 0,
            Number(locationId),
            imageUri,
            newTaskId,
          ]
        );
      } else {
        const result = await db.runAsync(
          `INSERT INTO tasks (title, description, isUrgent, locationId, imageUri) VALUES (?, ?, ?, ?, ?)`,
          [title, description, isUrgent ? 1 : 0, Number(locationId), imageUri]
        );
        newTaskId = result.lastInsertRowId;
      }
      if (isUrgent) {
        console.log("🚀 ~ handleSaveTask ~ isUrgent", isUrgent);
        scheduleNotification(newTaskId, title);
      }
    } catch (e) {
      console.log(e);
    }

    router.back();
  };
  const handleCompleteTask = async () => {
    Alert.alert("Finish Task", "Are you sure you want to finish this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          await db.runAsync(`DELETE FROM tasks WHERE id = ?`, taskId);
          router.back();
        },
      },
    ]);
  };
  useFocusEffect(
    React.useCallback(() => {
      loadTaskData();
    }, [loadTaskData])
  );

  const scheduleNotification = async (taskId: number, title: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Urgent Task Reminder",
        body: `Dont forget about your task: ${title}`,
        data: { taskId, locationId },
      },
      trigger: {
        seconds: 10,
      },
    });
  };
  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
        />
        <TextInput
          style={[styles.input, styles.multiLineInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 8,
          }}
        >
          <Text>Urgent</Text>
          <Switch
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: "#767577", true: "#F2A310" }}
          />
        </View>
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>
        {imageUri && (
          <View
            style={{
              width: "100%",
              height: 200,
              backgroundColor: "#ccc",
              marginBottom: 16,
            }}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        )}
      </View>
      <View>
        <TouchableOpacity onPress={handleSaveTask} style={styles.button}>
          <Text style={styles.buttonText}>
            {taskId ? "Update Task" : "Save Task"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCompleteTask}
          style={[styles.button, styles.completeButton]}
        >
          <Text style={styles.buttonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  input: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  multiLineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#F2A310",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  imageButton: {
    backgroundColor: "#3498db",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
});
export default NewTask;

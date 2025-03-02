import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { LocationType } from "@/types/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";

type LocationListItemProps = {
  location: LocationType;
  onDelete: () => void;
};
const LocationListItem = ({
  location: { name, id },
  onDelete,
}: LocationListItemProps) => {
  const db = useSQLiteContext();
  const handleDelete = async () => {
    try {
      await db.runAsync(`DELETE FROM locations where id = ?`, [id]);
    } catch (e) {
      console.log(e);
    }
    onDelete();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

export default LocationListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 8,
    marginBottom: 4,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  deleteButton: {
    padding: 8,
  },
});

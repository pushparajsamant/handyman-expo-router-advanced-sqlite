import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import LocationForm from "@/components/LocationForm";
import { LocationType } from "@/types/interfaces";
import LocationListItem from "@/components/LocationListItem";

const Page = () => {
  const db = useSQLiteContext();
  const [locations, setLocations] = useState<LocationType[]>([]);
  useEffect(() => {
    console.log("Loading");
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const locations = await db.getAllAsync(`SELECT * FROM locations`);
      setLocations(locations as LocationType[]);
      console.log("🚀 ~ loadLocations ~ locations:", locations);
    } catch (e) {
      console.log(e);
    }
  };
  const addLocation = async (name: string) => {
    await db.runAsync(`INSERT INTO locations (name) VALUES (?)`, name);
    loadLocations();
  };
  return (
    <View style={styles.container}>
      <LocationForm onSubmit={addLocation} />
      <FlatList
        data={locations}
        renderItem={({ item }) => (
          <LocationListItem location={item} onDelete={loadLocations} />
        )}
        ListEmptyComponent={<Text>No Locations added yet</Text>}
      />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
});

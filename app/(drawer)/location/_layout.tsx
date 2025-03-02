import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Slot, Stack } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";

const LocationLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerLeft: () => (
            <View style={{ marginLeft: -16 }}>
              <DrawerToggleButton tintColor="#000" />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="[id]/new-task"
        options={{
          title: "New Task",
          headerBackTitle: "Back",
          headerTintColor: "#000",
        }}
      />
    </Stack>
  );
};

export default LocationLayout;

const styles = StyleSheet.create({});

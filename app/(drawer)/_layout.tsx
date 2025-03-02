import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Drawer from "expo-router/drawer";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationType } from "@/types/interfaces";
// const LOGO_IMAGE = Image.resolveAssetSource(
//   require("@/assets/images/logo.png")
// ).uri;
import Logo from "@/assets/images/logo.png";
const LOGO_IMAGE = Image.resolveAssetSource(Logo).uri;
const dbDebug = SQLite.openDatabaseSync("reports.db");
const CustomDrawer = (props: any) => {
  const router = useRouter();
  const pathName = usePathname();
  const { bottom } = useSafeAreaInsets();
  const db = SQLite.useSQLiteContext();
  const [locations, setLocations] = useState<LocationType[]>([]);
  const isDrawerOpen = useDrawerStatus() === "open";
  useEffect(() => {
    if (isDrawerOpen) {
      console.log("Loading locations");
      loadLocations();
    }
  }, [isDrawerOpen]);

  const loadLocations = async () => {
    try {
      const locations = await db.getAllAsync(`SELECT * FROM locations`);
      setLocations(locations as LocationType[]);
      console.log("🚀 ~ loadLocations ~ locations:", locations);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView>
        <Image
          source={{ uri: LOGO_IMAGE }}
          style={{ width: 100, height: 100, alignSelf: "center", margin: 16 }}
        />
        <View style={styles.locationsContainer}>
          <DrawerItemList {...props} />
          <Text style={styles.title}>Locations</Text>
          {locations.map((location) => {
            const isActive = pathName === `/location/${location.id}`;
            return (
              <DrawerItem
                key={location.id}
                label={location.name}
                onPress={() => {
                  router.navigate(`/location/${location.id}`);
                }}
                activeTintColor="#F2A310"
                inactiveTintColor="#333"
                focused={isActive}
              />
            );
          })}
        </View>
      </DrawerContentScrollView>
      <View
        style={{
          padding: 16,
          paddingBottom: 20 + bottom,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
        }}
      >
        <Text style={{ color: "#a6a6a6" }}>Copyright Raj Samant 2025</Text>
      </View>
    </View>
  );
};
const DrawerLayout = () => {
  useDrizzleStudio(dbDebug);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          drawerHideStatusBarOnOpen: true,
          drawerActiveTintColor: "#F2A310",
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Manage Locations",
          }}
        />
        <Drawer.Screen
          name="location"
          options={{
            title: "Location",
            headerShown: false,
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;

const styles = StyleSheet.create({
  locationsContainer: {
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a6a6a6",
    padding: 16,
    paddingTop: 24,
  },
});

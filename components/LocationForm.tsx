import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
type LocationFormProps = {
  onSubmit: (name: string) => void;
};
const LocationForm = ({ onSubmit }: LocationFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name);
      setName("");
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.inputStyle}
      />
      <TouchableOpacity style={styles.buttonStyle} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Location</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationForm;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  inputStyle: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 5,
    flex: 1,
  },
  buttonStyle: {
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

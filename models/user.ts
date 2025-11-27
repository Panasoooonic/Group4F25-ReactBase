import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginSuccessResponse {
  message: string;
  result: User;
}

export const getUser = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("user");
    // Chuyển đổi chuỗi JSON trở lại thành đối tượng JavaScript
    return jsonValue != null ? JSON.parse(jsonValue) as User : null;
  } catch (e) {
    console.error("Error reading user data:", e);
    return null;
  }
};

// Store user info
export const storeUser = async (user: User) => {
  try {
    const jsonValue = JSON.stringify(user);
    await AsyncStorage.setItem("user", jsonValue);
    console.log("User data stored successfully!");
  } catch (e) {
    console.error("Error saving user data:", e);
  }
};

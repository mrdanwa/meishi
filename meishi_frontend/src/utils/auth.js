import api from "../config/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/constants";

export const checkUserType = async (expectedType) => {
  try {
    const response = await api.get("/api/user/");
    if (response.data.user_type !== expectedType) {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      return false;
    }
    return true;
  } catch (error) {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    return false;
  }
};
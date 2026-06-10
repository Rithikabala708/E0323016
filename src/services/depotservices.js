import axios from "axios";
import { getToken } from "./auth.js";

export const getDepots = async () => {
  try {
    const token = getToken();
    const response = await axios.get(process.env.DEPOT_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Depots fetched successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch depots:", error.response?.data || error.message);
    throw error;
  }
};

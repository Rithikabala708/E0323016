import axios from "axios";
import { getToken } from "./auth.js";

export const getVehicles = async () => {
  try {
    const token = getToken();
    const response = await axios.get(process.env.VEHICLES_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Vehicles fetched successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch vehicles:", error.response?.data || error.message);
    throw error;
  }
};

import axios from "axios";

export const Log = async (
  stack,
  level,
  packageName,
  message,
  token
) => {
  try {
    console.log("Sending log with token:", token ? "Token present" : "No token");
    console.log("Log payload:", { stack, level, package: packageName, message });
    
    const response = await axios.post(
      process.env.LOG_API_URL,
      {
        stack,
        level,
        package: packageName,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("Log sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Logging Failed:", error.response?.data || error.message);
    console.error("Error details:", error.response?.status, error.response?.statusText);
  }
};
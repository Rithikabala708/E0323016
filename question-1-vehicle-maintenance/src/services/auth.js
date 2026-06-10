import axios from "axios";

let accessToken = "";

export const authenticate = async () => {
  try {
    console.log("Attempting authentication...");
    const response = await axios.post(
      process.env.AUTH_API_URL,
      {
        email: process.env.AUTH_EMAIL,
        name: process.env.AUTH_NAME,
        rollNo: process.env.AUTH_ROLL_NO,
        accessCode: process.env.AUTH_ACCESS_CODE,
        clientID: process.env.AUTH_CLIENT_ID,
        clientSecret: process.env.AUTH_CLIENT_SECRET
      }
    );

    accessToken = response.data.access_token;
    console.log("Authentication Successful");
    console.log("Token Received:", accessToken ? "Yes" : "No");
    return accessToken;
  } catch (err) {
    console.error("Authentication Failed:", err.response?.data || err.message);
    console.error("Status:", err.response?.status);
    throw err; // Throw error so server doesn't start without auth
  }
};

export const getToken = () => accessToken;
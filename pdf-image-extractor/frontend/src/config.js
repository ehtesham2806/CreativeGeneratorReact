const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:5000"
    : "https://creative-generator-react-api.vercel.app";

export default API_BASE_URL;
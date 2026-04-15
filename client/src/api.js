import axios from "axios";

export const sendMessage = async (message, provider = "openai") => {
  const res = await axios.post("http://localhost:5001/chat", { message, provider });
  return res.data.reply;
};

export const getAvailableModels = async () => {
  const res = await axios.get("http://localhost:5001/chat/models");
  return res.data.models;
};
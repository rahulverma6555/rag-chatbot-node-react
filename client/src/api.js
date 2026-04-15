import axios from "axios";
export const sendMessage = async (message) => {
  const res = await axios.post("http://localhost:5001/chat", { message });
  return res.data.reply;
};
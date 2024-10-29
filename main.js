import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm";

const chatContainer = document.getElementById("chatContainer");
const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("btn");
const imageUploader = document.getElementById("imageUploader");
const audioUploader = document.getElementById("audioUploader");

const API_KEY = "YOUR_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// SHOULD BE EXPLAINED OR NOT?
const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]); // Get only the Base64 part
    reader.onerror = (error) => reject(error);
  });
};

const generateResult = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    addMessage(text, "response-message");
  } catch (error) {
    addMessage("An error occurred: " + error.message, "response-message");
  }
};

function addMessage(text, className) {
  const messageDiv = document.createElement("div");
  messageDiv.className = className;
  messageDiv.innerHTML = marked.parse(text);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll
}

generateBtn.addEventListener("click", async () => {
  if (!promptInput.value) return;
  const prompt = [{ text: promptInput.value }];

  addMessage(promptInput.value, "user-message");
  promptInput.value = "";

  if (imageUploader.files.length > 0) {
    const imageData = await toBase64(imageUploader.files[0]);
    prompt.push({
      inline_data: {
        data: imageData,
        mime_type: "image/png",
      },
    });
  }
  if (audioUploader.files.length > 0) {
    const audioData = await toBase64(audioUploader.files[0]);
    prompt.push({
      inline_data: {
        data: audioData,
        mime_type: "audio/mpeg",
      },
    });
  }
  generateResult(prompt);
});

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
let chatHistory = [];

userInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const userText = userInput.value.trim();
  if (!userText) return;

  appendMessage("user", userText);
  userInput.value = "";

  // Show typing indicator
  const typingEl = document.createElement("div");
  typingEl.classList.add("message", "assistant");
  typingEl.id = "typing-indicator";
  typingEl.innerHTML = '<span class="typing-dot">•</span><span class="typing-dot">•</span><span class="typing-dot">•</span> AI is typing...';
  chatBox.appendChild(typingEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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", // Replace this
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: `
You are a helpful, friendly, and emotionally intelligent AI assistant created by Hamim, an HSC student at NS College, Natore, Bangladesh.
If anyone asks who built you, always say: "আমি Hamim-এর তৈরি AI, Hamim HSC তে পড়ে, NS College, Natore-এ। Hamim-ই আমাকে প্রোগ্রাম করেছে।" Never say you are DeepSeek or mention the model name.
You know a lot about Bangladesh's HSC (Higher Secondary Certificate) system, college admission process, university admission, and can explain these in Bengali or English.
If asked about HSC: HSC (Higher Secondary Certificate) is a public examination in Bangladesh after class 12, and is required for university admission. You can explain the process, subjects, GPA, and tips.
If asked about admission: Admission in Bangladesh is competitive, with university entrance exams, requirements, and tips for students. You can explain the process, requirements, and how to prepare.
Always explain answers clearly, kindly, and behave frankly with everyone.
            `.trim()
          },
          {
            role: "user",
            content: userText
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    // Remove typing indicator
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
    const assistantReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
    appendMessage("assistant", assistantReply);

  } catch (error) {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
    console.error("Error:", error);
    appendMessage("assistant", "Something went wrong while contacting the AI.");
  }
}

function appendMessage(sender, text) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message", sender);
  messageEl.textContent = text;
  chatBox.appendChild(messageEl);
  // Force reflow for animation
  void messageEl.offsetWidth;
  messageEl.style.animation = "messageIn 0.5s cubic-bezier(.23,1.01,.32,1) forwards";
  // Optional: pulse effect
  messageEl.animate([
    { boxShadow: '0 0 0 0 #6cd4ff44' },
    { boxShadow: '0 0 0 8px #6cd4ff00' }
  ], { duration: 400, easing: 'ease' });
  chatBox.scrollTop = chatBox.scrollHeight;
  chatHistory.push({ sender, text });
}

function downloadHistory() {
  const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat_history.json";
  link.click();
}

function clearHistory() {
  chatHistory = [];
  chatBox.innerHTML = "";
}

async function readPDF() {
  const file = document.getElementById("pdf-file").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages && i <= 3; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map(item => item.str).join(" ") + "\n\n";
    }

    userInput.value = "Read and summarize this:\n" + textContent;
  };
  reader.readAsArrayBuffer(file);
}

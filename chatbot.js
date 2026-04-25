/**
 * SidBot - Siddhartha's Portfolio Assistant
 * Logic for handling chat UI and backend communication.
 */

document.addEventListener("DOMContentLoaded", () => {
    const launcher = document.getElementById("chatbot-launcher");
    const window = document.getElementById("chatbot-window");
    const closeBtn = document.querySelector(".chatbot-close");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");
    const messagesContainer = document.querySelector(".chatbot-messages");
    const typingIndicator = document.querySelector(".typing-indicator");

    let chatHistory = JSON.parse(localStorage.getItem("sarathi_history")) || [];

    // Toggle Chat Window
    launcher.addEventListener("click", () => {
        window.classList.add("active");
        if (messagesContainer.children.length === 1) { // Only initial welcome
            loadHistory();
        }
        chatInput.focus();
    });

    closeBtn.addEventListener("click", () => {
        window.classList.remove("active");
    });

    // Send Message with Retry Logic
    const sendMessage = async (text, retryCount = 0) => {
        if (!text.trim()) return;

        if (retryCount === 0) {
            appendMessage("user", text);
            chatInput.value = "";
        }
        showTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, history: chatHistory })
            });

            console.log("Sarathi Response Status:", response.status);
            
            if (response.status === 503 && retryCount < 2) {
                console.log(`Service busy, retrying... (${retryCount + 1})`);
                setTimeout(() => sendMessage(text, retryCount + 1), 2000);
                return;
            }

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            showTyping(false);
            appendMessage("bot", data.text);

            // Update local history
            chatHistory.push({ role: "user", parts: [{ text }] });
            chatHistory.push({ role: "model", parts: [{ text: data.text }] });
            
            if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);
            localStorage.setItem("sarathi_history", JSON.stringify(chatHistory));

        } catch (error) {
            console.error("Sarathi Chat Error:", error);
            showTyping(false);
            
            let errorMsg = "Oops! I encountered an error. Please try again later.";
            
            if (error.message.includes("503") || error.message.includes("high demand")) {
                errorMsg = "I'm currently busy assisting a few other visitors! 😅 Please wait just a moment and try sending your message again. I'd love to help you!";
            } else if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
                errorMsg = "Local Connection Error: The chatbot requires a server to work. Please run 'npm start' and open http://localhost:3000";
            }

            appendMessage("bot", errorMsg);
        }
    };

    // UI Helpers
    function appendMessage(role, text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${role}-message`;
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping(show) {
        typingIndicator.style.display = show ? "flex" : "none";
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function loadHistory() {
        chatHistory.forEach(msg => {
            const role = msg.role === "model" ? "bot" : "user";
            appendMessage(role, msg.parts[0].text);
        });
    }

    // Event Listeners
    sendBtn.addEventListener("click", () => sendMessage(chatInput.value));

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage(chatInput.value);
    });
});

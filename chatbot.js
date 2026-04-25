/**
 * Sarathi - Siddhartha's Portfolio Assistant
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
    const suggestedBtns = document.querySelectorAll(".suggested-btn");

    // Toggle Chat Window
    launcher.addEventListener("click", () => {
        window.classList.add("active");
        chatInput.focus();
    });

    closeBtn.addEventListener("click", () => {
        window.classList.remove("active");
    });

    // Send Message
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        appendMessage("user", text);
        chatInput.value = "";
        showTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, history: [] }) // Always send empty history
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            showTyping(false);
            appendMessage("bot", data.text);

        } catch (error) {
            console.error("Chat Error:", error);
            showTyping(false);
            appendMessage("bot", "Oops! I encountered an error. Please try again later or reach out to Siddhartha directly.");
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

    // Event Listeners
    sendBtn.addEventListener("click", () => sendMessage(chatInput.value));

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage(chatInput.value);
    });

    suggestedBtns.forEach(btn => {
        btn.addEventListener("click", () => sendMessage(btn.textContent));
    });
});

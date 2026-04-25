/**
 * SidBot - Siddhartha's Portfolio Assistant
 * Logic for handling chat UI, suggested questions, and backend communication.
 */

document.addEventListener("DOMContentLoaded", () => {
    const launcher = document.getElementById("chatbot-launcher");
    const chatbotWindow = document.getElementById("chatbot-window");
    const closeBtn = document.querySelector(".chatbot-close");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");
    const messagesContainer = document.querySelector(".chatbot-messages");
    const typingIndicator = document.querySelector(".typing-indicator");
    const suggestBtns = document.querySelectorAll(".suggest-btn");

    let chatHistory = JSON.parse(localStorage.getItem("sarathi_history")) || [];

    // Toggle Chat Window
    launcher.addEventListener("click", () => {
        chatbotWindow.classList.add("active");
        if (messagesContainer.children.length === 1 && chatHistory.length === 0) {
            // Optional: Add a small delay for the welcome message to feel more natural
        } else if (messagesContainer.children.length === 1 && chatHistory.length > 0) {
            loadHistory();
        }
        chatInput.focus();
    });

    closeBtn.addEventListener("click", () => {
        chatbotWindow.classList.remove("active");
    });

    // Suggested Questions Logic
    suggestBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const question = btn.textContent;
            sendMessage(question);
            // Hide suggestions after first interaction to keep UI clean
            document.getElementById("suggested-questions-container").style.display = "none";
        });
    });

    // Dynamic Placeholder Effect
    const placeholders = [
        "Ask about my skills...",
        "Tell me about your projects...",
        "Where did you study?",
        "How can I hire you?",
        "What technologies do you use?"
    ];
    let placeholderIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function typePlaceholder() {
        const current = placeholders[placeholderIdx];
        if (isDeleting) {
            chatInput.placeholder = current.substring(0, charIdx--);
            if (charIdx < 0) {
                isDeleting = false;
                placeholderIdx = (placeholderIdx + 1) % placeholders.length;
                setTimeout(typePlaceholder, 500);
                return;
            }
        } else {
            chatInput.placeholder = current.substring(0, charIdx++);
            if (charIdx > current.length) {
                isDeleting = true;
                setTimeout(typePlaceholder, 2000);
                return;
            }
        }
        setTimeout(typePlaceholder, isDeleting ? 50 : 100);
    }
    typePlaceholder();

    // Send Message with Retry Logic
    const sendMessage = async (text, retryCount = 0) => {
        if (!text.trim()) return;

        if (retryCount === 0) {
            appendMessage("user", text);
            chatInput.value = "";
            // Hide suggestions if they are still visible
            document.getElementById("suggested-questions-container").style.display = "none";
        }
        showTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, history: chatHistory })
            });
            
            if (response.status === 503 && retryCount < 2) {
                setTimeout(() => sendMessage(text, retryCount + 1), 2000);
                return;
            }

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                console.error("JSON Parse Error:", jsonErr);
                throw new Error(`Invalid response from server (Status: ${response.status})`);
            }

            if (response.status !== 200 || data.error) {
                throw new Error(data.error || `Server returned ${response.status}`);
            }

            showTyping(false);
            appendMessage("bot", data.text);

            // Update local history
            chatHistory.push({ role: "user", parts: [{ text }] });
            chatHistory.push({ role: "model", parts: [{ text: data.text }] });
            
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
            localStorage.setItem("sarathi_history", JSON.stringify(chatHistory));

        } catch (error) {
            console.error("Sarathi Chat Error:", error);
            showTyping(false);
            
            let errorMsg = "Oops! I encountered an error. Please try again later.";
            
            // Safe access to window.location properties
            const hostname = window?.location?.hostname || "";
            const port = window?.location?.port || "";
            const protocol = window?.location?.protocol || "";

            if (error.message.includes("503") || error.message.includes("high demand")) {
                errorMsg = "I'm currently busy assisting a few other visitors! 😅 Please wait just a moment and try sending your message again.";
            } else if (hostname === "127.0.0.1" && port === "5500") {
                errorMsg = "Connection Error: You are using Live Server (port 5500). Please open the project via <strong>http://localhost:3000</strong> to use the chatbot.";
            } else if (protocol === "file:") {
                errorMsg = "Local Connection Error: Please run the server to use the chatbot.";
            } else if (error.message.includes("Status: 404")) {
                errorMsg = "API Error: The chat service was not found. Are you running the backend server?";
            } else if (error.message.includes("GEMINI_API_KEY")) {
                errorMsg = "Configuration Error: The AI service is not configured correctly on the server.";
            } else {
                // If it's a specific error from the backend, show it
                errorMsg = error.message;
            }

            appendMessage("bot", errorMsg);
        }
    };

    // UI Helpers
    function formatMarkdown(text) {
        if (!text) return "";
        
        // 1. Handle Bold: **text**
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 2. Handle Lists: Lines starting with * or -
        const lines = formatted.split('\n');
        let inList = false;
        let finalHtml = '';
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            const listMatch = trimmedLine.match(/^[\*\-]\s+(.*)/);
            
            if (listMatch) {
                if (!inList) {
                    finalHtml += '<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">';
                    inList = true;
                }
                finalHtml += `<li style="margin-bottom: 4px;">${listMatch[1]}</li>`;
            } else {
                if (inList) {
                    finalHtml += '</ul>';
                    inList = false;
                }
                if (trimmedLine) {
                    finalHtml += line + '<br>';
                } else {
                    finalHtml += '<br>';
                }
            }
        });
        
        if (inList) finalHtml += '</ul>';
        
        return finalHtml.replace(/(<br>)+$/, ''); // Remove trailing breaks
    }

    function appendMessage(role, text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${role}-message`;
        
        if (role === "bot") {
            msgDiv.innerHTML = formatMarkdown(text);
        } else {
            msgDiv.textContent = text;
        }
        
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

/**
 * AI Healthcare Assistant - Client Interaction Controller
 * Handles conversation state, Markdown parsing, real-time message streaming UI,
 * typing indicators, error recovery, and emergency detection.
 */

document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chatBox");
    const chatForm = document.getElementById("chatForm");
    const messageInput = document.getElementById("message");
    const sendButton = document.getElementById("sendButton");
    const typingIndicator = document.getElementById("typingIndicator");
    const clearChatBtn = document.getElementById("clearChatBtn");
    const chipButtons = document.querySelectorAll(".chip-btn");

    // In-memory conversation context for multi-turn dialogues
    let conversationHistory = [];

    // Detect API base URL
    const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "5000"
        ? "http://localhost:5000/api/ai/chat"
        : (window.location.protocol === "file:" ? "http://localhost:5000/api/ai/chat" : "/api/ai/chat");

    /**
     * Converts markdown syntax (bold, headings, bullet lists, links) into clean HTML
     */
    function formatMarkdown(text) {
        if (!text) return "";

        // Escape raw HTML first to prevent XSS
        let safe = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Format Headers (### Heading)
        safe = safe.replace(/^### (.*$)/gim, "<h4>$1</h4>");
        safe = safe.replace(/^## (.*$)/gim, "<h3>$1</h3>");

        // Format Bold (**bold**)
        safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Format Italics (*italic*)
        safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");

        // Format Markdown Links ([text](url))
        safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Format Bullet points (* or - )
        const lines = safe.split("\n");
        let inList = false;
        const formattedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                if (!inList) {
                    formattedLines.push("<ul>");
                    inList = true;
                }
                formattedLines.push(`<li>${trimmed.substring(2)}</li>`);
            } else {
                if (inList) {
                    formattedLines.push("</ul>");
                    inList = false;
                }
                formattedLines.push(line);
            }
        }

        if (inList) {
            formattedLines.push("</ul>");
        }

        let output = formattedLines.join("\n");

        // Replace remaining single newlines with <br> (except adjacent to block elements)
        output = output.replace(/\n(?!(?:<\/ul>|<\/h3>|<\/h4>|<ul>))/g, "<br>");
        return output;
    }

    /**
     * Returns formatted local timestamp (e.g. 10:15 AM)
     */
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    /**
     * Appends a styled message bubble to the chat container
     */
    function appendMessage(role, text, isEmergency = false, provider = null) {
        const isUser = role === "user";
        const messageRow = document.createElement("div");
        messageRow.className = `message-row ${isUser ? "user" : "assistant"}`;

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.innerHTML = isUser ? "👤" : "🩺";

        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content-wrapper";

        const bubble = document.createElement("div");
        bubble.className = `message-bubble ${isEmergency ? "emergency-highlight" : ""}`;
        bubble.innerHTML = isUser ? text : formatMarkdown(text);

        const meta = document.createElement("div");
        meta.className = "message-meta";

        const timeSpan = document.createElement("span");
        timeSpan.innerText = getCurrentTime();
        meta.appendChild(timeSpan);

        if (!isUser && provider) {
            const providerTag = document.createElement("span");
            providerTag.className = "provider-tag";
            providerTag.innerText = provider === "openai" ? "Live Cloud AI" : "Verified Clinical Guide";
            meta.appendChild(providerTag);
        }

        contentWrapper.appendChild(bubble);
        contentWrapper.appendChild(meta);

        messageRow.appendChild(avatar);
        messageRow.appendChild(contentWrapper);

        chatBox.appendChild(messageRow);
        scrollToBottom();
    }

    /**
     * Smoothly scroll chat box to the latest message
     */
    function scrollToBottom() {
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: "smooth"
        });
    }

    /**
     * Show/Hide animated typing indicator
     */
    function setTyping(isTyping) {
        if (isTyping) {
            typingIndicator.style.display = "flex";
            sendButton.disabled = true;
            messageInput.disabled = true;
            chatBox.appendChild(typingIndicator);
            scrollToBottom();
        } else {
            typingIndicator.style.display = "none";
            sendButton.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
        }
    }

    /**
     * Initialize initial greeting message
     */
    function showInitialGreeting() {
        chatBox.innerHTML = "";
        conversationHistory = [];

        appendMessage(
            "assistant",
            `👋 **Welcome to AI Healthcare! I am Dr. Nova.**

I can assist you with:
- Evaluating general symptoms *(fever, headaches, cold, digestive issues)*
- First aid instructions for minor emergencies *(burns, sprains, cuts)*
- Blood donation guidelines and connecting with local donors
- Nutrition, hydration, and everyday wellness habits

*What questions or symptoms can I help you explore today?*`,
            false,
            "healthcare-engine"
        );
    }

    /**
     * Core handler to send user message to the backend
     */
    async function handleSendMessage(messageText) {
        const text = (messageText || messageInput.value).trim();
        if (!text) return;

        // Render user message immediately
        appendMessage("user", text);
        messageInput.value = "";

        // Add to history
        conversationHistory.push({ role: "user", content: text });

        // Show typing indicator
        setTyping(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: text,
                    history: conversationHistory.slice(-6)
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.reply || `Server responded with status ${response.status}`);
            }

            const data = await response.json();
            const replyText = data.reply || "I am currently unable to generate a response. Please try again.";
            const isEmergency = Boolean(data.isEmergency);
            const provider = data.provider || "healthcare-engine";

            // Append assistant message
            appendMessage("assistant", replyText, isEmergency, provider);

            // Record to conversation context
            conversationHistory.push({ role: "assistant", content: replyText });

        } catch (err) {
            console.error("AI Chat Service Error:", err);

            appendMessage(
                "assistant",
                `⚠️ **Connection Notice**: I was unable to connect to the healthcare backend service.

**Troubleshooting Steps:**
1. Ensure the backend server is running: \`node backend/server.js\` on port 5000.
2. Check your network or firewall connection.

*For urgent medical needs, dial **112** / **911** or visit our [Emergency Support](emergency.html) section.*`,
                false,
                "offline-notice"
            );
        } finally {
            setTyping(false);
        }
    }

    // ==================== EVENT LISTENERS ====================

    // Form submission (Clicking send or pressing Enter inside form)
    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        handleSendMessage();
    });

    // Enter key triggers submit
    messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Quick suggestions click handler
    chipButtons.forEach(button => {
        button.addEventListener("click", function () {
            const query = this.getAttribute("data-query");
            if (query) {
                handleSendMessage(query);
            }
        });
    });

    // Reset / Clear chat button
    clearChatBtn.addEventListener("click", function () {
        if (confirm("Reset conversation and clear chat history?")) {
            showInitialGreeting();
        }
    });

    // Initial greeting load
    showInitialGreeting();
});
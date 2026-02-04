/**
 * Premium Chatbot Widget
 * A self-contained, embeddable chat widget with no external dependencies
 * @version 1.0.0
 */

(function () {
  "use strict";

  // SVG Icons as strings
  const ICONS = {
    bot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    close:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    messageCircle:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    book: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    sparkles:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  };

  class ChatbotWidget {
    constructor(config) {
      // Configuration
      this.config = {
        chatbotId: config.chatbotId || "",
        apiUrl: config.apiUrl || "http://localhost:5000/api",
        position: config.position || "bottom-right", // bottom-right, bottom-left
        primaryColor: config.primaryColor || "#10b981",
        botName: config.botName || "AI Assistant",
        welcomeMessage:
          config.welcomeMessage || "Hi! How can I help you today?",
        placeholder: config.placeholder || "Type your message...",
        showBranding: config.showBranding !== false,
        autoOpen: config.autoOpen || false,
        ...config,
      };

      // State
      this.isOpen = false;
      this.messages = [];
      this.isLoading = false;
      this.visitorId = this.getOrCreateVisitorId();

      // DOM elements
      this.elements = {};

      // Initialize
      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
      this.loadChatHistory();

      if (this.config.autoOpen) {
        setTimeout(() => this.toggleChat(), 500);
      }
    }

    getOrCreateVisitorId() {
      const key = "chatbot_visitor_id";
      let visitorId = localStorage.getItem(key);

      if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(key, visitorId);
      }

      return visitorId;
    }

    injectStyles() {
      // Check if styles are already injected
      if (document.getElementById("chatbot-widget-styles")) return;

      const link = document.createElement("link");
      link.id = "chatbot-widget-styles";
      link.rel = "stylesheet";
      link.href = this.getStylesheetUrl();
      document.head.appendChild(link);

      // Apply custom primary color if provided
      if (this.config.primaryColor !== "#10b981") {
        const style = document.createElement("style");
        style.textContent = `
          :root {
            --chatbot-primary: ${this.config.primaryColor};
            --chatbot-primary-hover: ${this.adjustColor(this.config.primaryColor, -20)};
          }
        `;
        document.head.appendChild(style);
      }
    }

    getStylesheetUrl() {
      // Try to find the script tag to get the base URL
      const scripts = document.getElementsByTagName("script");
      for (let script of scripts) {
        if (script.src && script.src.includes("chatbot-widget")) {
          return script.src
            .replace(".js", ".css")
            .replace(".min.js", ".min.css");
        }
      }
      // Fallback to relative path
      return "./chatbot-widget.css";
    }

    adjustColor(color, amount) {
      const clamp = (val) => Math.min(Math.max(val, 0), 255);
      const num = parseInt(color.replace("#", ""), 16);
      const r = clamp((num >> 16) + amount);
      const g = clamp(((num >> 8) & 0x00ff) + amount);
      const b = clamp((num & 0x0000ff) + amount);
      return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
    }

    createWidget() {
      const container = document.createElement("div");
      container.className = "chatbot-widget";
      container.innerHTML = `
        <!-- Chat Bubble -->
        <button class="chatbot-bubble" aria-label="Open chat" id="chatbot-bubble">
          ${ICONS.messageCircle}
        </button>

        <!-- Chat Window -->
        <div class="chatbot-window" id="chatbot-window">
          <!-- Header -->
          <div class="chatbot-header">
            <div class="chatbot-avatar">
              ${ICONS.bot}
            </div>
            <div class="chatbot-header-text">
              <div class="chatbot-title">${this.escapeHtml(this.config.botName)}</div>
              <div class="chatbot-status">
                <span class="chatbot-status-dot"></span>
                Online
              </div>
            </div>
            <button class="chatbot-close" aria-label="Close chat" id="chatbot-close">
              ${ICONS.close}
            </button>
          </div>

          <!-- Messages -->
          <div class="chatbot-messages" id="chatbot-messages">
            <div class="chatbot-empty">
              <div class="chatbot-empty-icon">
                ${ICONS.bot}
              </div>
              <div class="chatbot-empty-title">Start a conversation</div>
              <div class="chatbot-empty-text">
                ${this.escapeHtml(this.config.welcomeMessage)}
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="chatbot-input-container">
            <div class="chatbot-input-wrapper">
              <textarea 
                class="chatbot-input" 
                id="chatbot-input"
                placeholder="${this.escapeHtml(this.config.placeholder)}"
                rows="1"
                aria-label="Message input"
              ></textarea>
              <button class="chatbot-send" id="chatbot-send" aria-label="Send message">
                ${ICONS.send}
              </button>
            </div>
          </div>

          ${
            this.config.showBranding
              ? `
          <!-- Footer -->
          <div class="chatbot-footer">
            Powered by <a href="#" target="_blank">YourChatbot</a>
          </div>
          `
              : ""
          }
        </div>
      `;

      document.body.appendChild(container);

      // Store element references
      this.elements = {
        bubble: container.querySelector("#chatbot-bubble"),
        window: container.querySelector("#chatbot-window"),
        close: container.querySelector("#chatbot-close"),
        messages: container.querySelector("#chatbot-messages"),
        input: container.querySelector("#chatbot-input"),
        send: container.querySelector("#chatbot-send"),
      };

      // Apply position
      this.applyPosition();
    }

    applyPosition() {
      if (this.config.position === "bottom-left") {
        this.elements.bubble.style.left = "24px";
        this.elements.bubble.style.right = "auto";
        this.elements.window.style.left = "24px";
        this.elements.window.style.right = "auto";
      }
    }

    attachEventListeners() {
      // Toggle chat
      this.elements.bubble.addEventListener("click", () => this.toggleChat());
      this.elements.close.addEventListener("click", () => this.toggleChat());

      // Send message
      this.elements.send.addEventListener("click", () => this.sendMessage());
      this.elements.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      this.elements.input.addEventListener("input", (e) => {
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.elements.window.classList.toggle("open", this.isOpen);
      this.elements.bubble.classList.toggle("open", this.isOpen);

      if (this.isOpen) {
        this.elements.input.focus();
        this.scrollToBottom();
      }
    }

    async loadChatHistory() {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/chat/history/${this.config.chatbotId}/${this.visitorId}`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            this.messages = data.messages;
            this.renderMessages();
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }

    async sendMessage() {
      const text = this.elements.input.value.trim();
      if (!text || this.isLoading) return;

      // Clear input
      this.elements.input.value = "";
      this.elements.input.style.height = "auto";

      // Add user message
      const userMessage = {
        role: "user",
        text: text,
        createdAt: new Date().toISOString(),
      };
      this.messages.push(userMessage);
      this.renderMessages();

      // Show loading
      this.isLoading = true;
      this.showTypingIndicator();

      try {
        const response = await fetch(
          `${this.config.apiUrl}/chat/${this.config.chatbotId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: text,
              visitorId: this.visitorId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();

        // Add bot response
        const botMessage = {
          role: "assistant",
          text: data.response.text,
          source: data.response.source,
          createdAt: data.response.timestamp || new Date().toISOString(),
        };
        this.messages.push(botMessage);
      } catch (error) {
        console.error("Error sending message:", error);

        // Add error message
        const errorMessage = {
          role: "assistant",
          text: "Sorry, I encountered an error. Please try again.",
          createdAt: new Date().toISOString(),
        };
        this.messages.push(errorMessage);
      } finally {
        this.isLoading = false;
        this.hideTypingIndicator();
        this.renderMessages();
      }
    }

    renderMessages() {
      if (this.messages.length === 0) {
        this.elements.messages.innerHTML = `
          <div class="chatbot-empty">
            <div class="chatbot-empty-icon">
              ${ICONS.bot}
            </div>
            <div class="chatbot-empty-title">Start a conversation</div>
            <div class="chatbot-empty-text">
              ${this.escapeHtml(this.config.welcomeMessage)}
            </div>
          </div>
        `;
        return;
      }

      this.elements.messages.innerHTML = this.messages
        .map((msg) => {
          const isUser = msg.role === "user";
          const avatar = isUser ? ICONS.user : ICONS.bot;

          let sourceHtml = "";
          if (msg.source && !isUser) {
            const sourceConfig = {
              knowledge: {
                icon: ICONS.book,
                label: "Knowledge Base",
                class: "knowledge",
              },
              "knowledge-refined": {
                icon: ICONS.sparkles,
                label: "KB + AI Enhanced",
                class: "enhanced",
              },
              gemini: { icon: ICONS.sparkles, label: "Gemini AI", class: "ai" },
              system: { icon: ICONS.book, label: "System", class: "knowledge" },
            };

            const config = sourceConfig[msg.source] || sourceConfig["gemini"];
            sourceHtml = `
            <div class="chatbot-message-source ${config.class}">
              ${config.icon}
              <span>${config.label}</span>
            </div>
          `;
          }

          return `
          <div class="chatbot-message ${isUser ? "user" : "bot"}">
            <div class="chatbot-message-avatar">
              ${avatar}
            </div>
            <div class="chatbot-message-content">
              <div class="chatbot-message-bubble">
                ${this.escapeHtml(msg.text)}
              </div>
              ${sourceHtml}
            </div>
          </div>
        `;
        })
        .join("");

      this.scrollToBottom();
    }

    showTypingIndicator() {
      const indicator = document.createElement("div");
      indicator.className = "chatbot-typing";
      indicator.id = "chatbot-typing-indicator";
      indicator.innerHTML = `
        <div class="chatbot-message-avatar">
          ${ICONS.bot}
        </div>
        <div class="chatbot-typing-bubble">
          <div class="chatbot-typing-dot"></div>
          <div class="chatbot-typing-dot"></div>
          <div class="chatbot-typing-dot"></div>
        </div>
      `;
      this.elements.messages.appendChild(indicator);
      this.scrollToBottom();
    }

    hideTypingIndicator() {
      const indicator = document.getElementById("chatbot-typing-indicator");
      if (indicator) {
        indicator.remove();
      }
    }

    scrollToBottom() {
      setTimeout(() => {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      }, 100);
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Public API
    open() {
      if (!this.isOpen) this.toggleChat();
    }

    close() {
      if (this.isOpen) this.toggleChat();
    }

    destroy() {
      const widget = document.querySelector(".chatbot-widget");
      if (widget) widget.remove();

      const styles = document.getElementById("chatbot-widget-styles");
      if (styles) styles.remove();
    }
  }

  // Expose to global scope
  window.ChatbotWidget = ChatbotWidget;

  // Auto-initialize if config is provided
  if (window.chatbotConfig) {
    window.chatbot = new ChatbotWidget(window.chatbotConfig);
  }
})();

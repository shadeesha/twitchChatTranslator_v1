const DEFAULT_SETTINGS = {
  enabled: true,
  targetLanguage: "en",
  sourceLanguage: "auto",
  endpoint: "https://libretranslate.com/translate",
  apiKey: ""
};

let currentSettings = { ...DEFAULT_SETTINGS };
let chatObserver = null;
const pendingQueue = [];
let isProcessing = false;

function loadSettings() {
  return chrome.storage.sync.get(DEFAULT_SETTINGS).then((settings) => {
    currentSettings = settings;
    return settings;
  });
}

function extractMessageText(line) {
  const messageNodes = line.querySelectorAll('[data-a-target="chat-message-text"]');
  if (messageNodes.length) {
    return Array.from(messageNodes)
      .map((node) => node.textContent)
      .join("")
      .trim();
  }

  const fragmentNodes = line.querySelectorAll(".text-fragment");
  if (fragmentNodes.length) {
    return Array.from(fragmentNodes)
      .map((node) => node.textContent)
      .join("")
      .trim();
  }

  return "";
}

function ensureTranslationElement(line) {
  let translation = line.querySelector(".tct-translation");
  if (!translation) {
    translation = document.createElement("span");
    translation.className = "tct-translation";
    line.appendChild(translation);
  }
  return translation;
}

function enqueueTranslation(line, text) {
  pendingQueue.push({ line, text });
  processQueue();
}

function updateTranslation(line, text, status) {
  const translation = ensureTranslationElement(line);
  translation.textContent = text;
  if (status) {
    translation.setAttribute("data-status", status);
  } else {
    translation.removeAttribute("data-status");
  }
}

async function translateText(text) {
  const payload = {
    q: text,
    source: currentSettings.sourceLanguage || "auto",
    target: currentSettings.targetLanguage || "en",
    format: "text"
  };

  if (currentSettings.apiKey) {
    payload.api_key = currentSettings.apiKey;
  }

  const response = await fetch(currentSettings.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Translation request failed (${response.status})`);
  }

  const data = await response.json();
  return data.translatedText || "";
}

async function processQueue() {
  if (isProcessing || pendingQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const { line, text } = pendingQueue.shift();

  if (!currentSettings.enabled) {
    isProcessing = false;
    processQueue();
    return;
  }

  try {
    updateTranslation(line, "Translating...");
    const translatedText = await translateText(text);
    if (translatedText) {
      updateTranslation(line, translatedText);
    } else {
      updateTranslation(line, "Translation unavailable", "error");
    }
  } catch (error) {
    updateTranslation(line, "Translation error", "error");
  } finally {
    isProcessing = false;
    processQueue();
  }
}

function handleNewMessage(line) {
  if (!currentSettings.enabled) {
    return;
  }

  if (line.dataset.tctProcessed === "true") {
    return;
  }
  line.dataset.tctProcessed = "true";

  const messageText = extractMessageText(line);
  if (!messageText) {
    return;
  }

  enqueueTranslation(line, messageText);
}

function observeChatMessages(chatContainer) {
  if (chatObserver) {
    chatObserver.disconnect();
  }

  chatObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }

        if (node.matches && node.matches(".chat-line__message")) {
          handleNewMessage(node);
          return;
        }

        const nestedMessages = node.querySelectorAll
          ? node.querySelectorAll(".chat-line__message")
          : [];
        nestedMessages.forEach((messageNode) => handleNewMessage(messageNode));
      });
    });
  });

  chatObserver.observe(chatContainer, {
    childList: true,
    subtree: true
  });
}

function findChatContainer() {
  return (
    document.querySelector(".chat-scrollable-area__message-container") ||
    document.querySelector("[data-test-selector='chat-scrollable-area__message-container']")
  );
}

function startWatching() {
  const container = findChatContainer();
  if (container) {
    observeChatMessages(container);
    container.querySelectorAll(".chat-line__message").forEach((line) => {
      handleNewMessage(line);
    });
    return;
  }

  const retryObserver = new MutationObserver(() => {
    const chatContainer = findChatContainer();
    if (chatContainer) {
      observeChatMessages(chatContainer);
      retryObserver.disconnect();
    }
  });

  retryObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

chrome.storage.onChanged.addListener((changes) => {
  Object.keys(changes).forEach((key) => {
    currentSettings[key] = changes[key].newValue;
  });
});

loadSettings().then(startWatching);

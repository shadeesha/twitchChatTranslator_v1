const DEFAULT_SETTINGS = {
  endpoint: "https://libretranslate.com/translate",
  apiKey: ""
};

const endpointInput = document.getElementById("endpoint");
const apiKeyInput = document.getElementById("apiKey");

function setValues(settings) {
  endpointInput.value = settings.endpoint;
  apiKeyInput.value = settings.apiKey;
}

function saveSetting(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

chrome.storage.sync.get(DEFAULT_SETTINGS).then(setValues);

endpointInput.addEventListener("input", (event) => {
  saveSetting("endpoint", event.target.value.trim());
});

apiKeyInput.addEventListener("input", (event) => {
  saveSetting("apiKey", event.target.value.trim());
});

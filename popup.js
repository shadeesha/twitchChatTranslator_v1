const DEFAULT_SETTINGS = {
  enabled: true,
  targetLanguage: "en",
  sourceLanguage: "auto"
};

const elements = {
  enabled: document.getElementById("enabled"),
  targetLanguage: document.getElementById("targetLanguage"),
  sourceLanguage: document.getElementById("sourceLanguage"),
  openOptions: document.getElementById("openOptions")
};

function setValues(settings) {
  elements.enabled.checked = settings.enabled;
  elements.targetLanguage.value = settings.targetLanguage;
  elements.sourceLanguage.value = settings.sourceLanguage;
}

function saveSetting(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

chrome.storage.sync.get(DEFAULT_SETTINGS).then(setValues);

elements.enabled.addEventListener("change", (event) => {
  saveSetting("enabled", event.target.checked);
});

elements.targetLanguage.addEventListener("input", (event) => {
  saveSetting("targetLanguage", event.target.value.trim());
});

elements.sourceLanguage.addEventListener("input", (event) => {
  saveSetting("sourceLanguage", event.target.value.trim() || "auto");
});

elements.openOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

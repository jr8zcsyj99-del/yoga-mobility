const categories = ["Alle", "Yoga", "Mobility", "Kraft", "Recovery", "Radsport"];
const search = document.querySelector("#search");
const channelsNode = document.querySelector("#channels");
const status = document.querySelector("#results");
const filterGroup = document.querySelector("#filters");

let catalog = [];
let category = "Alle";

function el(tag, cls, value) {
  const element = document.createElement(tag);
  if (cls) element.className = cls;
  if (value) element.textContent = value;
  return element;
}

function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function renderChannel([handle, name, channelCategory, description, channelId]) {
  const link = el("a", "channel");
  const channelPath = channelId ? "channel/" + encodeURIComponent(channelId) : "@" + encodeURIComponent(handle);
  link.href = "https://www.youtube.com/" + channelPath;
  link.target = "_blank";
  link.rel = "noopener";
  link.dataset.category = channelCategory;

  const initials = name.split(/\s+/).slice(0, 2).map(word => [...word][0]).join("").toLocaleUpperCase("de");
  const avatar = el("span", "channel-avatar", initials);
  avatar.setAttribute("aria-hidden", "true");
  const caption = el("span");
  caption.append(el("span", "channel-name", name), el("span", "channel-meta", description));
  link.append(avatar, caption);
  return link;
}

function renderChannels() {
  const query = normalize(search.value.trim());
  const cards = catalog
    .filter(([, name, channelCategory, description]) =>
      (category === "Alle" || channelCategory === category) &&
      normalize(name + " " + description + " " + channelCategory).includes(query)
    )
    .map(renderChannel);
  channelsNode.replaceChildren(...cards);
  status.textContent = cards.length
    ? cards.length + (cards.length === 1 ? " Kanal" : " Kanäle")
    : "Keine passenden Kanäle gefunden.";
}

async function start() {
  const response = await fetch("./channels.json");
  if (!response.ok) throw new Error("Kanalliste nicht verfügbar.");
  catalog = await response.json();

  for (const label of categories) {
    const button = el("button", "", label);
    button.dataset.category = label;
    button.setAttribute("aria-pressed", String(label === category));
    button.addEventListener("click", () => {
      category = label;
      for (const item of filterGroup.children) item.setAttribute("aria-pressed", String(item === button));
      renderChannels();
    });
    filterGroup.append(button);
  }
  search.addEventListener("input", renderChannels);
  renderChannels();
}

start().catch(() => {
  status.textContent = "Die Kanalliste konnte nicht geladen werden. Bitte lade die Seite neu.";
});

// PixelPulse — live image search
// Data source: Wikimedia Commons API (no API key required, CORS-enabled)
// https://commons.wikimedia.org/w/api.php

const API = "https://commons.wikimedia.org/w/api.php";
const PAGE_SIZE = 20;

// Grab the elements we'll work with
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const statusLine = document.getElementById("status");
const results = document.getElementById("results");

// Build the request URL for a given query
function buildUrl(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6", // 6 = File namespace (images live here)
    gsrlimit: PAGE_SIZE,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "400", // ask for a 400px-wide thumbnail
    format: "json",
    origin: "*", // enables cross-origin (CORS) requests from the browser
  });
  return `${API}?${params.toString()}`;
}

// Tidy up a Commons file title: "File:Cat November.jpg" -> "Cat November"
function cleanTitle(title) {
  return title.replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, "");
}

// Strip HTML tags out of the artist field
function stripTags(html) {
  return html.replace(/<[^>]*>/g, "").trim();
}

// Show placeholder "skeleton" cards while we wait
function showSkeletons(count) {
  results.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const box = document.createElement("div");
    box.className = "skeleton";
    results.appendChild(box);
  }
}

// Turn one API result into a card element
function makeCard(page) {
  const info = page.imageinfo[0];

  const card = document.createElement("article");
  card.className = "card";

  const img = document.createElement("img");
  img.src = info.thumburl;
  img.alt = cleanTitle(page.title);
  img.loading = "lazy";
  // If an image fails to load, hide just the broken image — keep the card + title
  img.addEventListener("error", () => {
    img.remove();
    card.classList.add("no-image");
  });

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = cleanTitle(page.title);

  const creator = document.createElement("p");
  creator.className = "card-creator";
  const artist =
    info.extmetadata && info.extmetadata.Artist
      ? stripTags(info.extmetadata.Artist.value)
      : "";
  creator.textContent = artist ? `by ${artist}` : "Wikimedia Commons";

  body.append(title, creator);
  card.append(img, body);
  return card;
}

// Render an array of pages into the grid
function render(pages) {
  results.innerHTML = "";
  const fragment = document.createDocumentFragment();
  pages.forEach((page) => fragment.appendChild(makeCard(page)));
  results.appendChild(fragment);
}

// The main search routine
async function search(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    statusLine.textContent = "Type something to search for.";
    statusLine.classList.remove("error");
    results.innerHTML = "";
    return;
  }

  statusLine.textContent = `Searching for “${trimmed}”…`;
  statusLine.classList.remove("error");
  showSkeletons(8);

  try {
    const response = await fetch(buildUrl(trimmed));
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    const data = await response.json();
    // Commons returns results as an object; turn it into a sorted array
    const pages = data.query && data.query.pages ? Object.values(data.query.pages) : [];
    const images = pages
      .filter((page) => page.imageinfo && page.imageinfo[0] && page.imageinfo[0].thumburl)
      .sort((a, b) => a.index - b.index);

    if (images.length === 0) {
      statusLine.textContent = `No results for “${trimmed}”. Try another word.`;
      results.innerHTML = "";
      return;
    }

    statusLine.textContent = `Showing ${images.length} results for “${trimmed}”.`;
    render(images);
  } catch (error) {
    statusLine.textContent = "Something went wrong. Check your connection and try again.";
    statusLine.classList.add("error");
    results.innerHTML = "";
    console.error(error);
  }
}

// Search when the form is submitted (Enter key or button click)
form.addEventListener("submit", (event) => {
  event.preventDefault();
  search(input.value);
});

// A friendly first search so the page isn't empty on load
window.addEventListener("DOMContentLoaded", () => {
  input.value = "sunflowers";
  search("sunflowers");
});

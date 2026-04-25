const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger?.addEventListener('click', () => {
  mobileMenu.classList.toggle('show');
  const icon = hamburger.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-xmark');
});

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('show');
    const icon = hamburger.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-xmark');
  });
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.menu-bar a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 110;
    const height = section.clientHeight;
    if (scrollY >= top && scrollY < top + height) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
}, { passive: true });

const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObserver.observe(el));

const themeBtn = document.getElementById('theme-toggle');

const lightStyle = document.createElement('style');
lightStyle.id = 'light-overrides';
lightStyle.textContent = `
  :root {
    --clr-bg:      #f4f6fb;
    --clr-surface: #e8ecf5;
    --clr-card:    #ffffff;
    --clr-border:  rgba(99,102,241,.18);
    --clr-text:    #1e1e35;
    --clr-muted:   #5a6282;
    --clr-white:   #1e1e35;
  }
  .navbar, .navbar-menu { background: rgba(244,246,251,.9) !important; }
  .project-img-placeholder { background: linear-gradient(135deg,rgba(99,102,241,.08),rgba(168,85,247,.08)); }
`;

let isLight = false;

themeBtn?.addEventListener('click', () => {
  isLight = !isLight;
  if (isLight) {
    document.head.appendChild(lightStyle);
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.getElementById('light-overrides')?.remove();
    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});

/* --- Chatbot Logic --- */
/* --- Agentic SidBot Logic (Gemini Integration) --- */
const botToggle = document.getElementById('sid-bot-toggle');
const botWindow = document.getElementById('sid-bot-window');
const botClose = document.getElementById('sid-bot-close');
const botMessages = document.getElementById('sid-bot-messages');
const botSuggestions = document.getElementById('sid-bot-suggestions');
const botInput = document.getElementById('sid-bot-input');
const botSend = document.getElementById('sid-bot-send');
const settingsPanel = document.getElementById('sid-bot-settings');
const apiKeyInput = document.getElementById('sid-bot-api-key');
const saveKeyBtn = document.getElementById('sid-bot-save-key');
const botHeader = document.querySelector('.sid-bot-header');

// Load local key for developer mode
let LOCAL_API_KEY = localStorage.getItem('sid_bot_api_key') || '';
if (LOCAL_API_KEY) {
  apiKeyInput.value = LOCAL_API_KEY;
}

// Scrape portfolio context from the page
function getPortfolioContext() {
  const education = Array.from(document.querySelectorAll('#about .timeline-item')).map(item => {
    const title = item.querySelector('.timeline-title')?.textContent;
    const inst = item.querySelector('.timeline-inst')?.textContent;
    const date = item.querySelector('.timeline-date')?.textContent;
    return `${title} at ${inst} (${date})`;
  }).join('\n');

  const skills = Array.from(document.querySelectorAll('#skills .skill-card')).map(card => {
    const category = card.querySelector('.skill-card-title')?.textContent;
    const items = Array.from(card.querySelectorAll('.skill-item')).map(i => {
      return `${i.querySelector('.skill-name')?.textContent} (${i.querySelector('.skill-level')?.textContent})`;
    }).join(', ');
    return `${category}: ${items}`;
  }).join('\n');

  const projects = Array.from(document.querySelectorAll('#projects .project-card')).map(card => {
    const name = card.querySelector('.project-name')?.textContent;
    const desc = card.querySelector('.project-desc')?.textContent;
    const tags = Array.from(card.querySelectorAll('.project-tag')).map(t => t.textContent).join(', ');
    return `Project: ${name}\nDescription: ${desc}\nTech: ${tags}`;
  }).join('\n\n');

  return `
    ABOUT/BIO: Siddhartha Gummadi is an Aspiring Software Developer and CSE (AI & ML) student focused on building intelligent systems.
    
    EDUCATION:
    ${education}
    
    SKILLS:
    ${skills}
    
    PROJECTS:
    ${projects}
    
    CONTACT INFO:
    Email: siddharthagummadi1605@gmail.com
    GitHub: https://github.com/siddharthagummadi
    LinkedIn: https://linkedin.com/in/siddhartha-gummadi-7951042b8
  `;
}

async function callGemini(prompt) {
  const context = getPortfolioContext();
  
  // 1. If we have a local key (Developer Mode), call Gemini directly
  if (LOCAL_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${LOCAL_API_KEY}`;
    const body = {
      contents: [{ parts: [{ text: `SYSTEM: You are SidBot. Context:\n${context}\n\nUSER: ${prompt}` }] }]
    };
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI Error (Direct Call)";
    } catch (err) { console.error("Direct API Error:", err); }
  }

  // 2. Otherwise, use the Secure Backend Proxy (Production Mode)
  try {
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context })
    });
    const data = await response.json();
    return data.answer || "Back-end Error or Offline";
  } catch (err) {
    console.error("AI Proxy Error:", err);
    return "SidBot is currently offline in local mode. Tip: Triple-click the 'SidBot' header to enter your API key for local testing!";
  }
}

let isBotOpen = false;

function toggleBot() {
  isBotOpen = !isBotOpen;
  botWindow.classList.toggle('hidden', !isBotOpen);
  if (isBotOpen) {
    if (botMessages.children.length === 0) {
      showWelcome();
    }
    setTimeout(() => botInput.focus(), 400);
  }
}

function showWelcome() {
  const welcomeText = "Hi! I'm SidBot, Siddhartha's Agentic AI assistant. 👋 I have been dynamically 'trained' on everything in this portfolio. What would you like to know?";
  addBotMessage(welcomeText);
  renderSuggestions();
}

function showBotResponse(text) {
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  botMessages.appendChild(typing);
  botMessages.scrollTop = botMessages.scrollHeight;

  callGemini(text).then(response => {
    typing.remove();
    addBotMessage(response);
    renderSuggestions();
  });
}

function addBotMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'bot-msg reveal visible';
  msg.textContent = text;
  botMessages.appendChild(msg);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'user-msg';
  msg.textContent = text;
  botMessages.appendChild(msg);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function renderSuggestions() {
  botSuggestions.innerHTML = '';
  const initialSuggestions = ["Who are you?", "What are your skills?", "Tell me about SmartClass", "Can I hire you?"];
  initialSuggestions.forEach(text => {
    const chip = document.createElement('div');
    chip.className = 'suggestion-chip';
    chip.textContent = text;
    chip.onclick = () => {
      addUserMessage(text);
      botSuggestions.innerHTML = '';
      showBotResponse(text);
    };
    botSuggestions.appendChild(chip);
  });
}

function handleManualInput() {
  const text = botInput.value.trim();
  if (!text) return;
  addUserMessage(text);
  botInput.value = '';
  botSuggestions.innerHTML = '';
  showBotResponse(text);
}

// Triple-click backdoor detection
let clickCount = 0;
let clickTimer;
botHeader?.addEventListener('click', () => {
  clickCount++;
  clearTimeout(clickTimer);
  if (clickCount === 3) {
    settingsPanel.classList.toggle('hidden');
    clickCount = 0;
  } else {
    clickTimer = setTimeout(() => { clickCount = 0; }, 500);
  }
});

saveKeyBtn?.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem('sid_bot_api_key', key);
    LOCAL_API_KEY = key;
    alert("API Key saved locally for dev testing!");
    settingsPanel.classList.add('hidden');
  }
});

// Navigation and Send logic
botToggle?.addEventListener('click', toggleBot);
botClose?.addEventListener('click', toggleBot);
botSend?.addEventListener('click', handleManualInput);
botInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleManualInput();
});






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
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

reveals.forEach(el => revealObserver.observe(el));

const themeBtn = document.getElementById('theme-toggle');

const lightStyle = document.createElement('style');
lightStyle.id = 'light-overrides';
lightStyle.textContent = `
  :root {
    --clr-bg:      #fdfdff;
    --clr-surface: #f0f4f9;
    --clr-card:    #ffffff;
    --clr-border:  rgba(0, 0, 0, 0.06);
    --clr-text:    #1a1f36;
    --clr-muted:   #4f566b;
    --clr-white:   #000000;
    --glow: 0 10px 30px rgba(99, 102, 241, 0.08);
  }
  
  body { background: var(--clr-bg); }
  .star-background { opacity: 0.05; pointer-events: none; }
  
  .navbar, .navbar-menu { 
    background: rgba(253, 253, 255, 0.8) !important; 
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .section-navy { background: #f8fafc; }
  
  .timeline-content, .skill-card, .project-card {
    background: #ffffff !important;
    border: 1px solid rgba(0, 0, 0, 0.05) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
    backdrop-filter: none !important;
  }

  .timeline-content:hover, .skill-card:hover, .project-card:hover {
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.12) !important;
    border-color: var(--clr-primary) !important;
  }

  .timeline-dot { background: #fff !important; }
  .timeline::before { opacity: 0.2; }

  .project-tag {
    background: #f1f5f9;
    border-color: rgba(0,0,0,0.05);
    color: #475569;
  }

  .project-link.gh {
    background: #f8fafc;
    border-color: rgba(0,0,0,0.1);
  }

  .contact-chip {
    background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .hero-greeting { background: #f1f5f9; padding: 4px 12px; border-radius: 20px; }
  .logo-text { background: linear-gradient(135deg, #4f46e5, #7c3aed); -webkit-background-clip: text; }
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

// --- Dynamic Portfolio Rendering ---
async function loadPortfolioData() {
  try {
    const response = await fetch('assets/data/portfolio.json');
    if (!response.ok) throw new Error("Failed to load portfolio data");
    const data = await response.json();

    // Render Education (Timeline)
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      timeline.innerHTML = data.education.map((edu, index) => `
        <div class="timeline-item reveal" style="transition-delay: ${index * 0.1}s">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="timeline-date">${edu.year}</span>
            <h3 class="timeline-title">${edu.degree}</h3>
            <p class="timeline-inst">${edu.institution}</p>
          </div>
        </div>
      `).join('');
    }

    // Render Skills
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
      skillsGrid.innerHTML = data.skills.map((skill, index) => `
        <div class="skill-card reveal" style="transition-delay:${index * 0.1}s">
          <div class="skill-card-header">
            <div class="skill-card-icon"><i class="fa-solid ${skill.icon}"></i></div>
            <p class="skill-card-title">${skill.category}</p>
          </div>
          <div class="skill-list">
            ${skill.items.map(item => `
              <div class="skill-item">
                <div class="skill-item-info">
                  <i class="${item.icon} skill-item-icon"></i>
                  <span class="skill-name">${item.name}</span>
                </div>
                <span class="skill-level">${item.level}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }

    // Render Projects
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
      projectsGrid.innerHTML = data.projects.map((project, index) => `
        <article class="project-card reveal">
          <div class="project-body">
            <div class="project-tags">
              ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
            <h3 class="project-name">${project.name}</h3>
            <p class="project-desc">${project.description}</p>
            <div class="project-links">
              <a class="project-link gh" href="${project.github}" target="_blank" rel="noopener">
                <i class="fa-brands fa-github"></i> GitHub
              </a>
              <a class="project-link live" href="${project.live}" target="_blank" rel="noopener">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Live
              </a>
            </div>
          </div>
        </article>
      `).join('');
    }

    // Render Certifications
    const certGrid = document.querySelector('.cert-grid');
    if (certGrid) {
      certGrid.innerHTML = data.certifications.map(cert => `
        <article class="project-card reveal">
          <div class="project-body">
            <div class="project-tags">
              <span class="project-tag">${cert.org}</span>
            </div>
            <h3 class="project-name">${cert.title}</h3>
            <div class="project-links">
              <a class="project-link live" href="${cert.link}" target="_blank" rel="noopener">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> View Certificate
              </a>
            </div>
          </div>
        </article>
      `).join('');
    }

    // Re-initialize reveals after rendering
    const newReveals = document.querySelectorAll('.reveal');
    newReveals.forEach(el => revealObserver.observe(el));

  } catch (err) {
    console.error("Error loading portfolio data:", err);
  }
}

// Start loading
loadPortfolioData();

// --- Splash Screen Logic ---
window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    // Minimum time to show splash (3s for a snappier experience)
    const minDisplayTime = 3000;
    const startTime = Date.now();

    const hideSplash = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        splash.classList.add('fade-out');
        // Remove from DOM after fade animation (0.8s in CSS)
        setTimeout(() => {
          splash.remove();
        }, 800);
      }, remainingTime);
    };

    // If page is fully loaded before minDisplayTime, hide after minDisplayTime
    // If it takes longer, hide as soon as it's loaded
    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash);
    }
  }
});

// --- Card Glow Effect Logic ---
document.addEventListener('mousemove', (e) => {
  const cards = document.querySelectorAll('.skill-card, .project-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--glow-x', `${x}px`);
    card.style.setProperty('--glow-y', `${y}px`);
  });
});








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
              ${project.demo ? `
                <a class="project-link live" href="${project.demo}" target="_blank" rel="noopener">
                  <i class="fa-solid fa-play"></i> View Demo
                </a>
              ` : `
                <a class="project-link live" href="${project.live}" target="_blank" rel="noopener">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Live
                </a>
              `}
            </div>
          </div>
        </article>
      `).join('');
    }

    // Render Certifications
    const certGrid = document.querySelector('.cert-grid');
    if (certGrid) {
      certGrid.innerHTML = data.certifications.map(cert => `
        <article class="project-card reveal cert-card">
          <a href="${cert.link}" target="_blank" rel="noopener" class="card-link-overlay" aria-label="View ${cert.title} certificate"></a>
          <div class="project-body">
            <div class="project-tags">
              <span class="project-tag">${cert.org}</span>
            </div>
            <h3 class="project-name">${cert.title}</h3>
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

// --- High-End Splash Background Engine ---
class SplashBackground {
  constructor() {
    this.canvas = document.getElementById('splash-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numberOfParticles = window.innerWidth < 768 ? 150 : 350;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.layers = [
      { count: this.numberOfParticles * 0.6, speed: 0.2, depth: 0.1, size: [0.5, 1.5], color: 'rgba(255, 255, 255, 0.3)' }, // Far
      { count: this.numberOfParticles * 0.3, speed: 0.5, depth: 0.4, size: [1.5, 3], color: 'rgba(6, 182, 212, 0.5)' },  // Mid
      { count: this.numberOfParticles * 0.1, speed: 1.2, depth: 1.2, size: [40, 80], color: 'rgba(99, 102, 241, 0.05)', blur: 40 } // Near
    ];
    this.streams = [];
    this.init();
    this.animate();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  init() {
    this.resize();
    this.particles = [];
    this.layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * layer.speed,
          vy: (Math.random() - 0.5) * layer.speed,
          size: Math.random() * (layer.size[1] - layer.size[0]) + layer.size[0],
          color: layer.color,
          depth: layer.depth,
          blur: layer.blur || 0,
          layerIndex
        });
      }
    });

    // Initialize Energy Streams
    this.streams = [];
    for (let i = 0; i < 5; i++) {
      this.createStream();
    }
  }

  createStream() {
    this.streams.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      length: Math.random() * 200 + 100,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.2 + 0.05
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  handleMouseMove(e) {
    this.mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.05;
    this.mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.05;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Smooth mouse follow
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Draw Particles
    this.particles.forEach(p => {
      const offsetX = this.mouse.x * p.depth;
      const offsetY = this.mouse.y * p.depth;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -100) p.x = this.canvas.width + 100;
      if (p.x > this.canvas.width + 100) p.x = -100;
      if (p.y < -100) p.y = this.canvas.height + 100;
      if (p.y > this.canvas.height + 100) p.y = -100;

      this.ctx.beginPath();
      if (p.blur > 0) {
        this.ctx.filter = `blur(${p.blur}px)`;
      } else {
        this.ctx.filter = 'none';
      }
      this.ctx.arc(p.x + offsetX, p.y + offsetY, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    });

    // Draw Energy Streams
    this.ctx.filter = 'none';
    this.streams.forEach((s, index) => {
      s.x -= s.speed;
      s.y += s.speed * 0.5;

      if (s.x < -s.length || s.y > this.canvas.height + s.length) {
        this.streams.splice(index, 1);
        this.createStream();
        // Reset position to top/right
        const newStream = this.streams[this.streams.length - 1];
        newStream.x = this.canvas.width + Math.random() * 200;
        newStream.y = Math.random() * this.canvas.height - 200;
      }

      const gradient = this.ctx.createLinearGradient(s.x, s.y, s.x + s.length, s.y - s.length * 0.5);
      gradient.addColorStop(0, `rgba(6, 182, 212, ${s.opacity})`);
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

      this.ctx.beginPath();
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x + s.length, s.y - s.length * 0.5);
      this.ctx.stroke();
    });

    requestAnimationFrame(() => this.animate());
  }
}

// --- Splash Screen Logic ---
window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    // Initialize High-End Background
    new SplashBackground();

    const minDisplayTime = 1500; // Increased for better impact
    const startTime = Date.now();

    const hideSplash = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.remove();
        }, 1000); // Match CSS transition
      }, remainingTime);
    };

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








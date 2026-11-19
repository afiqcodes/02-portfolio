'use strict';

const profile = window.portfolioProfile || {};
const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.menu-button');
const themeButton = document.querySelector('.theme-toggle');
const dialog = document.querySelector('.project-dialog');

function setMenu(open) {
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101513' : '#f6f8f4';
}

try {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') applyTheme(savedTheme);
} catch { /* Theme switching still works when browser storage is unavailable. */ }

themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem('portfolio-theme', theme); } catch { /* Optional persistence. */ }
});

document.getElementById('year').textContent = new Date().getFullYear();

const nodeDescriptions = {
  browser: 'It starts here. Your browser brings the code to life.',
  web: 'HTML gives it structure. CSS sets the style. JavaScript adds interaction.',
  server: 'Nginx serves the website files when your browser asks for them.',
  container: 'Docker packages the website and Nginx into a portable environment.'
};

document.querySelectorAll('[data-node]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-node]').forEach(node => {
      const selected = node === button;
      node.classList.toggle('selected', selected);
      node.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('node-description').textContent = nodeDescriptions[button.dataset.node];
  });
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visible = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) visible++;
    });
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.getElementById('filter-status').textContent = `Showing ${visible} ${visible === 1 ? 'project' : 'projects'}.`;
  });
});

const projects = {
  web: {
    title: 'Docker Web Server', category: 'WEB DEVELOPMENT / CONTAINERS',
    paragraphs: [
      'This portfolio brings the frontend and its web server together in a Docker image. HTML, CSS, and JavaScript provide the interface; Nginx serves the static files.',
      'The Dockerfile starts with nginx:alpine and copies the website into the server’s document directory. It is a practical way to explore how a website moves from local files to a hosted environment.'
    ],
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Docker', 'Nginx', 'Alpine Linux'],
    note: 'This is the website you are browsing. Its visual preview is an illustration of the project.'
  },
  network: {
    title: 'Network Simulation', category: 'NETWORKING / LEARNING EXPLORATION',
    paragraphs: [
      'An exploration of routing protocols and network performance using ns-3, a network simulator.',
      'The focus is understanding how devices communicate and how network behaviour can be studied through experiments. Project results and supporting materials will be added as they are documented.'
    ],
    tags: ['ns-3', 'Networking', 'Routing protocols'],
    note: 'The topology shown on the card is conceptual. It does not represent measured simulation results.'
  },
  lab: {
    title: 'Home Server Lab', category: 'LINUX / LEARNING EXPLORATION',
    paragraphs: [
      'A personal environment for exploring Linux, self-hosting, storage, containers, and infrastructure.',
      'The lab is a space to connect ideas from different parts of computing and learn through practical experiments. Setup notes and documented experiments will be added over time.'
    ],
    tags: ['Linux', 'Containers', 'Storage', 'Self-hosting'],
    note: 'The terminal and server artwork is illustrative. Hardware details and project resources have not been published yet.'
  }
};

function webUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function externalLink(label, value, className = 'text-link') {
  const href = webUrl(value);
  if (!href) return null;
  const link = document.createElement('a');
  link.textContent = label;
  link.href = href;
  link.className = className;
  if (new URL(href).origin !== window.location.origin) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${label} (opens in a new tab)`);
  }
  return link;
}

document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.project;
    const project = projects[key];
    document.getElementById('dialog-title').textContent = project.title;
    document.getElementById('dialog-category').textContent = project.category;
    document.getElementById('dialog-description').replaceChildren(...project.paragraphs.map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
    document.getElementById('dialog-tags').replaceChildren(...project.tags.map(text => {
      const tag = document.createElement('li');
      tag.textContent = text;
      return tag;
    }));
    const resources = profile.projects?.[key] || {};
    const links = [externalLink('View source', resources.source), externalLink('Visit project', resources.demo)].filter(Boolean);
    document.getElementById('dialog-links').replaceChildren(...links);
    document.getElementById('dialog-note').textContent = project.note;
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

const email = typeof profile.email === 'string' ? profile.email.trim() : '';
if (/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) {
  const emailLink = document.querySelector('.contact-email');
  emailLink.href = `mailto:${encodeURIComponent(email).replace('%40', '@')}`;
  emailLink.hidden = false;
  document.querySelector('.contact-pending').hidden = true;
  const copyButton = document.querySelector('.copy-email');
  if (navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.getElementById('copy-status');
      try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Email address copied.';
      } catch { status.textContent = `Copy this address: ${email}`; }
    });
  }
}

const socialLinks = [externalLink('GitHub', profile.github), externalLink('LinkedIn', profile.linkedin)].filter(Boolean);
if (socialLinks.length) {
  const socials = document.querySelector('.social-links');
  socials.replaceChildren(...socialLinks);
  socials.hidden = false;
}
const resumeUrl = webUrl(profile.resume);
if (resumeUrl) {
  const resumeLink = document.querySelector('.resume-link');
  resumeLink.href = resumeUrl;
  resumeLink.hidden = false;
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const current = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    nav.querySelectorAll('a').forEach(link => {
      if (link.hash === `#${current.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-10% 0px -35% 0px', threshold: [0, .2, .5] });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

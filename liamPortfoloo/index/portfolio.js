(() => {
  const STORAGE = {
    messages: 'liamPortfolioMessages',
    visits: 'liamPortfolioVisits',
    lastVisit: 'liamPortfolioLastVisit'
  };

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Storage unavailable:', error);
    }
  }

  function initTicker() {
    const hero = document.querySelector('.hero');
    if (!hero || document.querySelector('.portfolio-ticker')) return;

    const skills = ['Web Development', 'HTML · CSS · JavaScript', 'Python', 'Graphic Design', 'Networking', 'IT Support'];
    const ticker = document.createElement('aside');
    ticker.className = 'portfolio-ticker';
    ticker.setAttribute('aria-label', 'Career focus areas');
    const track = document.createElement('div');
    track.className = 'portfolio-ticker__track';

    for (let copy = 0; copy < 2; copy += 1) {
      const group = document.createElement('div');
      group.className = 'portfolio-ticker__group';
      skills.forEach((skill) => {
        const item = document.createElement('span');
        item.className = 'portfolio-ticker__item';
        item.textContent = skill;
        group.appendChild(item);

        const dot = document.createElement('span');
        dot.className = 'portfolio-ticker__dot';
        dot.textContent = '✦';
        group.appendChild(dot);
      });
      track.appendChild(group);
    }

    ticker.appendChild(track);
    hero.insertAdjacentElement('afterend', ticker);
  }

  function initReveal() {
    const revealTargets = document.querySelectorAll('main > section:not(.hero), .contact-section');
    if (!revealTargets.length || !('IntersectionObserver' in window)) {
      revealTargets.forEach((section) => section.classList.add('is-visible'));
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealTargets.forEach((section) => section.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((section) => {
      section.classList.add('js-reveal');
      observer.observe(section);
    });
  }

  function initFooter() {
    if (document.querySelector('.portfolio-footer')) return;

    const footer = document.createElement('footer');
    footer.className = 'portfolio-footer';
    footer.innerHTML = `<p>© ${new Date().getFullYear()} Liam Mckeever Odhiambo · Crafted for digital impact.</p>`;
    document.body.appendChild(footer);
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const status = document.getElementById('formStatus');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      status.textContent = 'Sending your message…';
      status.dataset.state = 'pending';
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';

      const payload = Object.fromEntries(new FormData(form).entries());
      delete payload._honey;

      try {
        const response = await fetch('https://formsubmit.co/ajax/mckeeverliam45@gmail.com', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...payload,
            _captcha: 'false',
            _template: 'table'
          })
        });

        if (!response.ok) {
          throw new Error('Unable to send message.');
        }

        const saved = readStorage(STORAGE.messages, []);
        saved.unshift({
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          createdAt: new Date().toISOString()
        });
        writeStorage(STORAGE.messages, saved.slice(0, 12));

        form.reset();
        status.textContent = 'Thanks — your message has been sent successfully.';
        status.dataset.state = 'success';
      } catch (error) {
        console.error(error);
        status.textContent = 'Sending failed. Please email mckeeverliam45@gmail.com directly.';
        status.dataset.state = 'error';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }
    });
  }

  function initAdminDashboard() {
    const adminBody = document.body.classList.contains('admin-body');
    if (!adminBody) return;

    const tableBody = document.getElementById('messagesTableBody');
    const statVisitors = document.getElementById('statVisitors');
    const statMessages = document.getElementById('statMessages');
    const statProjects = document.getElementById('statProjects');
    const statResponse = document.getElementById('statResponse');

    const messageData = readStorage(STORAGE.messages, [
      { name: 'Jane Wambui', email: 'jane@email.com', subject: 'Website Inquiry', createdAt: new Date().toISOString() },
      { name: 'Kevin Otieno', email: 'kevin@email.com', subject: 'Project Collaboration', createdAt: new Date().toISOString() },
      { name: 'Mary Atieno', email: 'mary@email.com', subject: 'Freelance Offer', createdAt: new Date().toISOString() },
      { name: 'John Mwai', email: 'john@email.com', subject: 'IT Support', createdAt: new Date().toISOString() }
    ]);

    if (tableBody) {
      tableBody.innerHTML = messageData.slice(0, 5).map((message, index) => {
        const tag = index === 0 ? 'New' : index === 1 ? 'Replied' : 'Review';
        return `
          <tr>
            <td>${message.name}</td>
            <td>${message.email}</td>
            <td>${message.subject}</td>
            <td><span class="status ${index === 0 ? 'status-new' : index === 1 ? 'status-replied' : 'status-review'}">${tag}</span></td>
          </tr>
        `;
      }).join('');
    }

    if (statVisitors) statVisitors.textContent = String(2480 + Math.min(messageData.length * 24, 180));
    if (statMessages) statMessages.textContent = String(messageData.length + 64);
    if (statProjects) statProjects.textContent = '12';
    if (statResponse) statResponse.textContent = '92%';

    const logoutBtn = document.querySelector('.primary-btn');
    if (logoutBtn && logoutBtn.textContent.toLowerCase().includes('logout')) {
      logoutBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }

  function trackVisit() {
    if (!document.body) return;

    const visits = readStorage(STORAGE.visits, 0);
    writeStorage(STORAGE.visits, visits + 1);
    writeStorage(STORAGE.lastVisit, new Date().toISOString());
  }

  trackVisit();
  initTicker();
  initReveal();
  initFooter();
  initContactForm();
  initAdminDashboard();
})();

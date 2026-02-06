/* global gsap, ScrollTrigger */

gsap.registerPlugin(ScrollTrigger);

const sections = gsap.utils.toArray('.section, .hero');
sections.forEach((section) => {
  const elements = section.querySelectorAll('h2, h3, .card, .panel, .step, .time-item, .planning div, .commitments div');
  gsap.from(elements, {
    opacity: 0,
    y: 24,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
    },
  });
});

gsap.from('.hero-inner', {
  opacity: 0,
  y: 30,
  duration: 1.2,
  ease: 'power3.out',
});

// Animation réseau sous la section Vision & Approche
(function () {
  const canvas = document.getElementById('network-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  const isMobile = window.innerWidth < 720;
  const HUB_COUNT = isMobile ? 4 : 5;
  const POINT_COUNT = isMobile ? 18 : 30;
  const FLOW_COUNT = isMobile ? 6 : 10;

  let hubs = [];
  let points = [];
  let flows = [];
  const icons = {};
  const iconKeys = [
    'apartment',
    'factory',
    'local_convenience_store',
    'store',
    'warehouse',
  ];

  function loadIcons() {
    iconKeys.forEach((key) => {
      const img = new Image();
      img.src = `static/${key}-blue.svg`;
      icons[key] = img;
    });
  }

  function resize() {
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const radius = Math.min(width, height) * 0.32;
    hubs = Array.from({ length: HUB_COUNT }).map((_, i) => {
      const angle = (i / HUB_COUNT) * Math.PI * 2 - Math.PI / 2;
      return {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        type: iconKeys[i % iconKeys.length],
      };
    });

    points = Array.from({ length: POINT_COUNT }).map(() => {
      const hub = Math.floor(Math.random() * hubs.length);
      return {
        hub,
        angle: Math.random() * Math.PI * 2,
        radius: 26 + Math.random() * 70,
        speed: 0.002 + Math.random() * 0.004,
        r: 1.8 + Math.random() * 1.4,
      };
    });

    flows = Array.from({ length: FLOW_COUNT }).map((_, index) => {
      const start = index % hubs.length;
      const end = (index + 2) % hubs.length;
      return {
        start,
        end,
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
      };
    });
  }

  function drawLinks() {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#1f3564';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        ctx.beginPath();
        ctx.moveTo(hubs[i].x, hubs[i].y);
        ctx.lineTo(hubs[j].x, hubs[j].y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawFlows() {
    flows.forEach((flow) => {
      const a = hubs[flow.start];
      const b = hubs[flow.end];
      const x = a.x + (b.x - a.x) * flow.t;
      const y = a.y + (b.y - a.y) * flow.t;
      ctx.beginPath();
      ctx.arc(x, y, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#f4b63a';
      ctx.shadowColor = '#f4b63a';
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawPoints() {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#1f3564';
    points.forEach((p) => {
      const hub = hubs[p.hub];
      const x = hub.x + Math.cos(p.angle) * p.radius;
      const y = hub.y + Math.sin(p.angle) * p.radius;
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawHubs() {
    hubs.forEach((hub) => {
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#1f3564';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(31, 53, 100, 0.18)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const icon = icons[hub.type];
      if (icon && icon.complete) {
        ctx.drawImage(icon, hub.x - 18, hub.y - 18, 36, 36);
      }
    });
  }

  function update() {
    flows.forEach((flow) => {
      flow.t += flow.speed;
      if (flow.t > 1) flow.t = 0;
    });
    points.forEach((p) => {
      p.angle += p.speed;
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawLinks();
    drawFlows();
    drawPoints();
    drawHubs();
    update();
    requestAnimationFrame(animate);
  }

  loadIcons();
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
})();

const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('upsm_access');
    window.location.replace('login.html');
  });
}

const pdfBtn = document.getElementById('downloadPdf');
if (pdfBtn) {
  pdfBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.print();
  });
}

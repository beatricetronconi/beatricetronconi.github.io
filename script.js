// Highlights the index entry of the section currently in view.
(function () {
  var links = {};
  document.querySelectorAll('.index a[data-go]').forEach(function (a) {
    links[a.dataset.go] = a;
  });
  var current = null;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var link = links[entry.target.id];
      if (!link || link === current) return;
      if (current) current.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'true');
      current = link;
      // keep the active entry visible inside the scrolling index
      var nav = link.closest('.index');
      if (nav.scrollHeight > nav.clientHeight) {
        var top = link.offsetTop, bottom = top + link.offsetHeight;
        if (top < nav.scrollTop || bottom > nav.scrollTop + nav.clientHeight) {
          nav.scrollTop = top - nav.clientHeight / 2;
        }
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { observer.observe(s); });
})();

// Touch screens: tap a long text to show only its keywords, tap again to show it all.
(function () {
  if (window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.hl').forEach(function (p) {
    p.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      p.classList.toggle('show-kw');
    });
  });
})();

// Lightbox: click a photo to open its gallery full screen, then scroll sideways.
(function () {
  var shots = document.querySelectorAll('main .shot img, main .shot video');
  if (!shots.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Gallery');
  box.hidden = true;
  box.innerHTML =
    '<div class="lb-bar"><span class="lb-title"></span><span class="lb-count"></span>' +
    '<button type="button" class="lb-close">Close</button></div>' +
    '<div class="lb-track" tabindex="0"></div>';
  document.body.appendChild(box);

  var track = box.querySelector('.lb-track');
  var title = box.querySelector('.lb-title');
  var count = box.querySelector('.lb-count');
  var closeBtn = box.querySelector('.lb-close');
  var opener = null;
  var total = 0;

  function current() {
    return Math.round(track.scrollLeft / track.clientWidth);
  }
  // swap in the high-resolution file for the photo on screen and its neighbours
  function loadSharp(i) {
    [i - 1, i, i + 1].forEach(function (k) {
      var slide = track.children[k];
      var im = slide && slide.querySelector('img[data-full]');
      if (!im) return;
      var hi = new Image();
      hi.onload = function () { im.src = hi.src; };
      hi.src = im.dataset.full;
      im.removeAttribute('data-full');
    });
  }
  function updateCount() {
    count.textContent = (current() + 1) + ' / ' + total;
    loadSharp(current());
  }
  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }

  function open(img) {
    var gallery = img.closest('.gallery, .photo-grid');
    var section = img.closest('section');
    var imgs = Array.prototype.slice.call(gallery.querySelectorAll('.shot img, .shot video'));
    total = imgs.length;
    track.innerHTML = '';
    imgs.forEach(function (im) {
      var fig = document.createElement('figure');
      fig.className = 'lb-slide';
      var big;
      if (im.tagName === 'VIDEO') {
        big = im.cloneNode(true);
        big.removeAttribute('class');
        big.removeAttribute('tabindex');
        big.muted = true;
      } else {
        big = document.createElement('img');
        big.src = im.currentSrc || im.src;
        if (im.dataset.full) big.dataset.full = im.dataset.full;
        big.alt = im.alt;
      }
      fig.appendChild(big);
      var cap = im.parentNode.querySelector('figcaption');
      if (cap) {
        var c = document.createElement('figcaption');
        c.textContent = cap.textContent;
        fig.appendChild(c);
      }
      track.appendChild(fig);
    });
    var h = section && section.querySelector('.section-title h2');
    title.textContent = h ? h.textContent : '';
    opener = img;
    box.hidden = false;
    document.documentElement.classList.add('lb-open');
    track.scrollLeft = imgs.indexOf(img) * track.clientWidth;
    updateCount();
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    document.documentElement.classList.remove('lb-open');
    track.innerHTML = '';
    if (opener) opener.focus({ preventScroll: true });
  }

  shots.forEach(function (img) {
    img.tabIndex = 0;
    img.addEventListener('click', function () { open(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
    });
  });

  closeBtn.addEventListener('click', close);
  track.addEventListener('scroll', updateCount, { passive: true });
  // click on the empty space around a photo closes it
  track.addEventListener('click', function (e) {
    if (e.target.classList.contains('lb-slide')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
  });
  // turn vertical mouse-wheel scrolling into sideways scrolling
  track.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }
  }, { passive: false });
  window.addEventListener('resize', function () {
    if (!box.hidden) track.scrollLeft = current() * track.clientWidth;
  });
})();


// In-page links without href (so the browser shows no link preview at the bottom):
// [data-go] scrolls to a section, [data-href] opens mail or phone.
(function () {
  function activate(el) {
    if (el.dataset.href) { window.location.href = el.dataset.href; return; }
    var id = el.dataset.go;
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', location.pathname);
      return;
    }
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + id);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-go], [data-href]');
    if (!el || e.defaultPrevented) return;
    e.preventDefault();
    activate(el);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var el = e.target.closest && e.target.closest('[data-go], [data-href]');
    if (el) { e.preventDefault(); activate(el); }
  });
})();

// Home reel: scrolls by itself; hover stops it; drag with the mouse (or finger)
// or swipe sideways on a trackpad to move it faster, with a little inertia.
(function () {
  var reel = document.querySelector('.reel');
  var track = reel && reel.querySelector('.reel-track');
  if (!track) return;
  var set = track.querySelector('.reel-set');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speed = reduce ? 0 : 70;          // px per second, automatic
  var x = 0, v = 0, hover = false;
  var drag = null, moved = false, last = performance.now();

  function width() { return set.offsetWidth; }
  function wrap() {
    var w = width();
    if (!w) return;
    while (x <= -w) x += w;
    while (x > 0) x -= w;
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!drag) {
      if (!hover && !document.hidden) x -= speed * dt;
      x += v * dt;
      v *= Math.pow(0.04, dt);           // inertia fades out in about a second
      if (Math.abs(v) < 2) v = 0;
    }
    wrap();
    track.style.transform = 'translate3d(' + x + 'px,0,0)';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  reel.addEventListener('mouseenter', function () { hover = true; });
  reel.addEventListener('mouseleave', function () { hover = false; });

  // trackpad: horizontal swipe moves the strip, vertical scroll still scrolls the page
  reel.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      x -= e.deltaX;
    }
  }, { passive: false });

  reel.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    drag = { startX: e.clientX, lastX: e.clientX, lastT: performance.now(), vel: 0, id: e.pointerId };
    moved = false;
    v = 0;
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.lastX;
    if (!moved && Math.abs(e.clientX - drag.startX) > 6) {
      moved = true;
      reel.classList.add('dragging');
      try { reel.setPointerCapture(e.pointerId); } catch (err) {}
    }
    if (!moved) return;
    var now = performance.now();
    x += dx;
    drag.vel = dx / Math.max(1, now - drag.lastT) * 1000;
    drag.lastX = e.clientX;
    drag.lastT = now;
  });
  function end(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (moved) v = Math.max(-4000, Math.min(4000, drag.vel));
    drag = null;
    reel.classList.remove('dragging');
  }
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  // a drag is not a click: don't open the project after dragging
  reel.addEventListener('click', function (e) {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
})();

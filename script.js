// Highlights the index entry of the section currently in view.
(function () {
  var links = {};
  document.querySelectorAll('.index a').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
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
  var shots = document.querySelectorAll('main .shot img');
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
  function updateCount() {
    count.textContent = (current() + 1) + ' / ' + total;
  }
  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }

  function open(img) {
    var gallery = img.closest('.gallery, .photo-grid');
    var section = img.closest('section');
    var imgs = Array.prototype.slice.call(gallery.querySelectorAll('.shot img'));
    total = imgs.length;
    track.innerHTML = '';
    imgs.forEach(function (im) {
      var fig = document.createElement('figure');
      fig.className = 'lb-slide';
      var big = document.createElement('img');
      big.src = im.currentSrc || im.src;
      big.alt = im.alt;
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

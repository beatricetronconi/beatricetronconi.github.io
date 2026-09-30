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

(function () {
  var stage = document.querySelector('[data-intro-stage]');
  var assets = window.__INTRO_ASSETS__ || [];

  if (!stage || !assets.length) return;

  var palette = [
    'rgba(0, 0, 0, 0.18)',
    'rgba(173, 176, 186, 0.20)',
    'rgba(213, 183, 152, 0.18)',
    'rgba(166, 197, 226, 0.18)',
    'rgba(214, 170, 198, 0.16)',
    'rgba(175, 214, 188, 0.18)',
    'rgba(0, 0, 0, 0.12)'
  ];

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = assets.map(function (src) {
    var figure = document.createElement('figure');
    figure.className = 'intro-float-item';

    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'eager';
    img.decoding = 'async';

    figure.appendChild(img);
    stage.appendChild(figure);

    return {
      el: figure
    };
  });

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rectsOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function layout() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var isMobile = vw < 640;
    var isTablet = vw < 1024;
    var baseSize = isMobile ? 58 : isTablet ? 76 : 96;
    var copy = document.querySelector('.intro-copy');
    var copyRect = copy ? copy.getBoundingClientRect() : null;
    var copyMargin = isMobile ? 42 : 68;
    var zonePadding = isMobile ? 14 : 22;
    var zoneGap = isMobile ? 22 : 36;
    var minGap = isMobile ? 30 : 44;
    var placedRects = [];

    var zones = shuffle([
      { left: vw * 0.05, top: vh * 0.06, right: vw * 0.27, bottom: vh * 0.24 },
      { left: vw * 0.365, top: vh * 0.06, right: vw * 0.635, bottom: vh * 0.24 },
      { left: vw * 0.73, top: vh * 0.06, right: vw * 0.95, bottom: vh * 0.24 },
      { left: vw * 0.05, top: vh * 0.36, right: vw * 0.24, bottom: vh * 0.62 },
      { left: vw * 0.76, top: vh * 0.36, right: vw * 0.95, bottom: vh * 0.62 },
      { left: vw * 0.05, top: vh * 0.74, right: vw * 0.27, bottom: vh * 0.94 },
      { left: vw * 0.365, top: vh * 0.74, right: vw * 0.635, bottom: vh * 0.94 },
      { left: vw * 0.73, top: vh * 0.74, right: vw * 0.95, bottom: vh * 0.94 }
    ]);

    items.forEach(function (item, position) {
      var zone = zones[position % zones.length];
      var zoneWidth = zone.right - zone.left;
      var zoneHeight = zone.bottom - zone.top;
      var sizeMin = isMobile ? 44 : 60;
      var sizeMax = Math.max(sizeMin, Math.min(zoneWidth, zoneHeight) - zonePadding * 2);
      var size = clamp(baseSize + rand(-8, 14) + (position % 4) * (isMobile ? 3 : 6), sizeMin, sizeMax);
      var rotation = rand(-12, 12);
      var dropDelay = rand(0.12, 0.92) + position * rand(0.11, 0.22);
      var dropDuration = rand(1.55, 2.3);
      var floatDuration = rand(7.2, 12.4);
      var dropStart = rand(vh * 0.18, vh * 0.56);
      var floatRange = rand(8, isMobile ? 16 : 22);
      var shadowColor = palette[position % palette.length];
      var rect = null;
      var tries = 0;

      while (tries < 100) {
        tries += 1;

        var xMin = zone.left + zoneGap;
        var xMax = Math.max(xMin, zone.right - zoneGap - size);
        var yMin = zone.top + zoneGap;
        var yMax = Math.max(yMin, zone.bottom - zoneGap - size);

        var x = rand(xMin, xMax);
        var y = rand(yMin, yMax);

        rect = {
          left: x,
          top: y,
          right: x + size,
          bottom: y + size
        };

        if (copyRect) {
          var copyBounds = {
            left: copyRect.left - copyMargin,
            right: copyRect.right + copyMargin,
            top: copyRect.top - copyMargin,
            bottom: copyRect.bottom + copyMargin
          };

          if (rectsOverlap(rect, copyBounds)) {
            continue;
          }
        }

        var collides = placedRects.some(function (otherRect) {
          return rectsOverlap(rect, {
            left: otherRect.left - minGap,
            right: otherRect.right + minGap,
            top: otherRect.top - minGap,
            bottom: otherRect.bottom + minGap
          });
        });

        if (!collides) {
          break;
        }
      }

      if (!rect) {
        rect = {
          left: zone.left + zoneGap,
          top: zone.top + zoneGap,
          right: zone.left + zoneGap + size,
          bottom: zone.top + zoneGap + size
        };
      }

      placedRects.push(rect);

      item.el.style.setProperty('--x', Math.round(rect.left) + 'px');
      item.el.style.setProperty('--y', Math.round(rect.top) + 'px');
      item.el.style.setProperty('--size', Math.round(size) + 'px');
      item.el.style.setProperty('--rotation', rotation.toFixed(2) + 'deg');
      item.el.style.setProperty('--drop-delay', dropDelay.toFixed(2) + 's');
      item.el.style.setProperty('--drop-duration', dropDuration.toFixed(2) + 's');
      item.el.style.setProperty('--float-duration', floatDuration.toFixed(2) + 's');
      item.el.style.setProperty('--drop-start', Math.round(dropStart) + 'px');
      item.el.style.setProperty('--float-range', Math.round(floatRange) + 'px');
      item.el.style.setProperty('--shadow-color', shadowColor);
    });
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  }

  layout();

  if (!reducedMotion) {
    window.addEventListener('resize', onResize, { passive: true });
  }
})();

// https://github.com/tboronczyk/JavaScript-Experiments/blob/master/Creepy/index.html
function recMouseScroll(cfn) {
  var mX = 0,  mY = 0,
      sX = 0,  sY = 0,
      interval = 100,
      recIntv = null,
      b = document.body,
      de = document.documentElement;

  function addEvent(evt, fn) {
    if (document.addEventListener){
      document.addEventListener(evt, fn, false);
    }
    // dont have to worry about IE. Chrome only.
    //  else if (document.attachEvent){
    //   document.attachEvent('on' + evt, fn);
    // }
  }

  function mousePos(e) {
    e = e || window.event;
    if (e.pageX || e.pageY) {
      mX = e.pageX;
      mY = e.pageY;
    } else {
      mX = e.clientX + (de.scrollLeft || b.scrollLeft) -
        (de.clientLeft || 0);
      mY = e.clientY + (de.scrollTop || b.scrollTop) -
        (de.clientTop || 0);
    }
  }

  function onScroll() {
    if (window.pageXOffset || window.pageYOffset) {
      sX = window.pageXOffset;
      sY = window.pageYOffset;
    } else {
      sX = de.scrollLeft || b.scrollLeft;
      sY = de.scrollTop || b.scrollTop;
    }
  };

  window.onmousemove = mousePos;
  window.onscroll = onScroll;
  // addEvent('mousemove', mousePos);
  // addEvent('scroll', onScroll);

  // mousemove, scroll, click, doubleclick, selection?

  // start recording. Send mousemove and scroll on regular
  // intervals.
  if (recIntv === null) {
    recIntv = setInterval(function () {
      cfn([mX, mY, sX, sY, false]);
    }, interval);
  }

  function sendClick(e) {
    mousePos(e);
    cfn([mX, mY, sX, sY, true]);
  }

  addEvent('click', sendClick);
};

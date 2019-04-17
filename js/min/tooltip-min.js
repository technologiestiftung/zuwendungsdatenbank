"use strict";

var tooltip = function tooltip() {
  var module = {},
      direction = 'horizontal',
      tip = d3.select('body').append('div').attr('id', 'tooltip').html('<table><tr><td class="tp-tl"></td><td class="tp-tm tooltip-title"></td><td class="tp-tr"></td></tr><tr><td class="tp-ml"></td><td class="tp-mm tooltip-body"></td><td class="tp-mr"></td></tr><tr><td class="tp-bl"></td><td class="tp-bm"></td><td class="tp-br"></td></tr></table>'),
      title = tip.select('.tooltip-title'),
      body = tip.select('.tooltip-body');
  title.text('TITLE');
  body.text('Hello World! Was geht hier. Kann man hier noch mehr schreiben, oder was?');

  module.hide = function () {
    tip.style('display', 'none');
  };

  module.direction = function (_direction) {
    direction = _direction;
  };

  module.show = function (obj) {
    title.html(obj.title);
    body.html(obj.body);
    tip.style('display', 'block');
    module.move(obj);
  };

  module.move = function (obj) {
    var bb = tip.node().getBoundingClientRect();

    if (direction == 'horizontal') {
      tip.classed('mirror', obj.x > window.innerWidth / 2 ? true : false).classed('top', false).classed('bottom', false);

      if (obj.x > window.innerWidth / 2) {
        tip.style("left", obj.x - bb.width - 5 + "px").style("top", obj.y - 20 + "px");
      } else {
        tip.style("left", obj.x + 3 + "px").style("top", obj.y - 20 + "px");
      }
    } else {
      tip.classed('mirror', false).classed('top', false).classed('bottom', false);

      if (obj.y - window.scrollY > window.innerHeight / 2) {
        tip.classed('bottom', true).style("left", obj.x - bb.width / 2 + "px").style("top", obj.y - bb.height - 20 + "px");
      } else {
        tip.classed('top', true).style("left", obj.x - bb.width / 2 + "px").style("top", obj.y + 20 + "px");
      }
    }
  };

  return module;
};

//# sourceMappingURL=tooltip-min.js.map

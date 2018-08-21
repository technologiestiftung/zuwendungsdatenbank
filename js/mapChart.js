var mapChart = function(_container, _geojson, _data, _dict, _filterFunction, _filterKey){

  var module = {},
    container = _container,
    data = _data,
    filters = [],
    filterFunction = _filterFunction,
    filterKey = _filterKey,
    dict = _dict,
    dict_keys = {},
    width = 500,
    height = 400,
    geojson = _geojson,
    geokeys = {},
    svg = container.append('svg')
      .classed('mapChart',true)
      .attr('width',width)
      .attr('height', height)
      .attr("viewBox", "0 0 "+width+" "+height)
      .attr("preserveAspectRatio", "xMidYMid meet"),
    defs = svg.append('defs').html('<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">'+
      '<stop offset="0%" style="stop-color:rgba(0,0,0,0.1);stop-opacity:1" />'+
      '<stop offset="100%" style="stop-color:rgba(0,0,0,1);stop-opacity:1" />'+
    '</linearGradient>'),
    map = svg.append('g'),
    mapOverlay = svg.append('g'),
    legend = svg.append('g'),
    legend_rect = legend.append('rect')
      .style('fill', 'url(#grad1)')
      .attr('height',10),
    legend_txt1 = legend.append('text')
      .text('0 €')
      .attr('dy',20)
      .style('font-size',10),
    legend_txt2 = legend.append('text')
      .text(currency(data.top(1)[0].value).replace('&nbsp;',' '))
      .attr('dy',20)
      .style('font-size',10)
      .attr('text-anchor', 'end'),
    polygons = null,
    overlays = null,
    init = true,
    root = 1/4,
    projection = d3.geoMercator()
          .center([13.41, 52.51])
          .scale(35000)
          .translate([width/2, height/2]),
    color = d3.scaleLinear().domain([0, Math.pow(data.top(1)[0].value, root)]).range(['rgba(0,0,0,0.1)','rgba(0,0,0,1)']),
    path = d3.geoPath().projection(projection);

  module.init = function(){
    geojson.features.forEach(function(f){
      geokeys[f.properties.PLZ99] = f;
    });

    dict.forEach(function(d){
      dict_keys[d.id] = d.label;
    });

    polygons = map.selectAll('path').data(data.all()).enter().append('path')
      .attr('d', function(d){
        if(dict_keys[d.key] in geokeys){
          return path(geokeys[dict_keys[d.key]]);
        }
        return '';
      })
      .style('stroke-width', 0.5)
      .style('stroke','rgba(255,255,255,1)');

    overlays = mapOverlay.selectAll('path').data(data.all()).enter().append('path')
      .style('fill','transparent')
      .style('stroke-width','2')
      .classed('overlays', true)
      .attr('d', function(d){
        if(dict_keys[d.key] in geokeys){
          return path(geokeys[dict_keys[d.key]]);
        }
        return '';
      }).on('click', function(d){
        filterFunction(filterKey, d.key);
      });

      module.resize();
  };

  module.update = function(){
    polygons.transition()
      .duration((init)?0:500)
      .style('fill', function(d){
        return color(Math.pow(d.value, root));
      });

    overlays.classed('selected', function(d){
      if(filters.indexOf(d.key)>-1){
        return true;
      }
      return false;
    });

    init = false;

    legend_txt2.text(currency(data.top(1)[0].value).replace('&nbsp;',' '))
  };

  module.resize = function(){
    //width = container.node().offsetWidth;

    console.log(width, height)

    legend.attr('transform', `translate(${width*0.25},${height-50})`)

    legend_rect
      .attr('width', width*0.5)

    legend_txt2.attr('dx', width*0.5)

    module.update();
  };

  module.data = function(_data, _filters){
    data = _data;
    filters = _filters;
    color.domain([0, Math.pow(data.top(1)[0].value, root)]);
    module.update();
  };

  return module;
};
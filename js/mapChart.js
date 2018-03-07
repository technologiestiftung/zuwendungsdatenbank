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
    map = svg.append('g'),
    mapOverlay = svg.append('g'),
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

    module.update();
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
  };

  module.resize = function(){
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
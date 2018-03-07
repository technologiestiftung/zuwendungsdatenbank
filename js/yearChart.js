var yearChart = function(_container, _dates, _filterFunction, _filterKey){

  var module = {},
    filterFunction = _filterFunction,
    filterKey = _filterKey,
    filters = [],
    init = true,
    container = _container,
    dates = _dates,
    width, height, barWidth, padding = 10, xOffset = 150, yOffset = 20,
    x = d3.scaleTime().domain([dates.all()[0].key, dates.all()[dates.size()-1].key]),
    xAxis = d3.axisBottom().scale(x).ticks(d3.timeYear),
    x_axis,
    y = d3.scaleLinear(),
    yAxis = d3.axisLeft().ticks(10).scale(y).tickFormat(function(d){
      if(d >= 1000000000){
        return (d/1000000000).toFixed(2) + ' B €';
      }else if(d >= 1000000){
        return (d/1000000).toFixed(0) + ' M €';
      }else if(d >= 1000){
        return (d/1000).toFixed(2) + ' K €';
      }else{
        return d;
      }
    }),
    y_axis,
    svg = container.append('svg').classed('dateChart', true),
    g = svg.append('g')
           .attr('transform','translate('+(padding+xOffset)+','+padding+')'),
    chart;

  module.init = function(){
    y_axis = g.append('g').classed('yaxis',true).attr('transform', 'translate(-'+padding+',0)');
    x_axis = g.append('g').classed('xaxis',true);

    chart = g.selectAll('rect').data(dates.all()).enter().append('rect')
      .on('click', function(d){
        filterFunction(filterKey, d.key);
      });

    module.resize();
  };

  module.data = function(_dates, _filters){
    dates = _dates;
    filters = _filters;
    svg.classed('hasSelection', ((filters.length>0)?true:false));
    module.update();
  };

  module.update = function(){
    dates = _dates;
    y.domain([0, d3.max(dates.all(), function(d){ return d.value;})]);

    chart.data(dates.all())
      .classed('selected', function(d){
        if(filters.indexOf(d.key)>-1){
          return true;
        }
        return false;
      })
      .transition().duration((init)?0:500)
        .attr('x',function(d,i){ return x(d.key); })
        .attr('y',function(d,i){ return y(d.value); })
        .attr('width',function(d,i){ return barWidth; })
        .attr('height',function(d,i){ return height-2*padding-yOffset-y(d.value); });

    y_axis.transition()
      .duration((init)?0:500)
      .call(yAxis);

    x_axis.transition()
      .duration((init)?0:500)
      .call(xAxis);

    init = false;
  };

  module.resize = function(){
    width = container.node().offsetWidth;
    height = container.node().offsetHeight;

    barWidth = ((width - padding*2 - xOffset) - (dates.size())*padding)/(dates.size()+1);
    x.range([0, (width-3*padding-barWidth*2-xOffset)]);
    y.range([height-2*padding-yOffset,0]);

    svg.attr('width',width);
    svg.attr('height',height);

    yAxis.tickSize(-(width - padding - xOffset - barWidth), 0, 0);

    x_axis.attr('transform', 'translate('+barWidth/2+','+(height-2*padding-yOffset)+')');

    module.update();
  };

  return module;
};
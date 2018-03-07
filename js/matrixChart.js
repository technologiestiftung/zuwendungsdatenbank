var matrixChart = function(_container, _labels, _data, _dict, _filterFunction, _filterKey){

  //ADD SUM

  var module = {},
    dict = _dict,
    dict_keys = {};

    dict.forEach(function(d){
      dict_keys[formNum(d.id)] = shortenLabel(d.label);
    });

    var init = true,
    filterFunction = _filterFunction,
    filterKey = _filterKey,
    container = _container,
    labels = _labels,
    data = _data,
    d3Data = splitData(_data, _labels),
    filters = [],
    sort = 'label',
    filterYears = [],
    root = 1/4,
    width,height,blockWidth,blockHeight=25,padding=10,xOffset = 150, yOffset = 10,
    svg = container.append('svg').classed('matrixChart', true).classed(sort,true),
    y = d3.scaleLinear().domain([0,Math.pow(data.top(1)[0].value, root)]),
    xLabels = svg.append('g').attr('transform','translate('+(padding+xOffset)+','+padding+')'),
    sortButton = svg.append('g').attr('transform','translate('+padding+','+padding+')').append('text'),
    years = [],
    sums = [],
    sumw = d3.scaleLinear().domain([0,Math.pow(labels.top(1)[0].value, root)]),
    g = svg.append('g')
           .attr('transform','translate('+(padding+xOffset)+','+(padding+yOffset)+')'),
    groups = g.append('g').selectAll('g').data(d3Data).enter().append('g').attr('class', 'matrixGroup'),
    yLabels = groups.append('text')
      .datum(function(d,i){
        return labels.all()[i];
      })
      .attr('text-anchor', 'end'),
    bgs = groups.selectAll('rect.bg').data(function(d){return d.years;}).enter().append('rect').classed('bg',true),
    bars = groups.selectAll('rect.bar').data(function(d){return d.years;}).enter().append('rect').classed('bar',true),
    sumg = groups.append('g').datum(function(d,i){ return labels.all()[i]; }),
    sumbg = sumg.append('rect').attr('height',blockHeight).classed('sumbg', true),
    sumbars = sumg.append('rect').attr('height',blockHeight).classed('sumbar', true),
    buttons = groups.append('rect').attr('x', -xOffset).classed('button',true).on('click', function(d){
      filterFunction(filterKey, d.key);
    });

  function splitData(_data, _labels){
    var ndata = [], nkeys = {};

    _data.all().forEach(function(d, di){
      var s = d.key.split('_');
      var id = s[0], year = s[1];
      if(!(id in nkeys)){
        ndata.push({key:id, years:[]});
        nkeys[id] = ndata.length-1;
      }
      ndata[nkeys[id]].years.push({key:year, value:d.value});
    });

    var sorter = [];

    ndata.forEach(function(d,di){
      ndata[di]['sort'] = {sum:0,label:0,isum:0,ilabel:0};
      ndata[di]['id'] = di;
      ndata[di]['label'] = dict_keys[formNum(_labels.all()[di].key)];
      ndata[di]['sum'] = ndata[di].years.reduce(function(sum,v){ return v.value+sum; }, 0);
      sorter.push({id:di,label:ndata[di]['label'].trim(),sum:ndata[di]['sum']});
    });

    sorter.sort(function(a,b){
      return +(a.label > b.label) || +(a.label === b.label) -1;
    });

    sorter.forEach(function(d,i){
      ndata[d.id].sort.label = i;
      ndata[d.id].sort.ilabel = sorter.length-i-1;
    });

    sorter.sort(function(a,b){
      return b.sum - a.sum;
    });

    sorter.forEach(function(d,i){
      ndata[d.id].sort.sum = i;
      ndata[d.id].sort.isum = sorter.length-i-1;
    });

    return ndata;
  }

  module.init = function(){
    data.all().forEach(function(d){
      var year = d.key.split('_')[1];
      if(years.indexOf(year)==-1){
        years.push(year);
      }
    });

    years.sort();

    yLabels.append('tspan').attr('x', -padding).attr('dy','1.1em').text(function(d){ 
      if(d == undefined || !('key' in d) || d.key == undefined){
        return '';
      }else{
        var lparts = dict_keys[formNum(d.key)].split(' '),
          label = '', lastlabel = '', i = 0;

        while(label.length<35 && i<=lparts.length){
          lastlabel = label;
          if(i>0){ label += ' '; }
          label += lparts[i];
          i++;
        }
        label = lastlabel;

        return label;
      }
    });

    yLabels.append('tspan').attr('x', -padding).attr('dy','1.1em').text(function(d){ 
      if(d == undefined || !('key' in d) || d.key == undefined){
        return '';
      }else{
        var lparts = dict_keys[formNum(d.key)].split(' '),
          label = '', lastlabel = '', i = 0;

        while(label.length<35 && i<=lparts.length){
          lastlabel = label;
          if(i>0){ label += ' '; }
          label += lparts[i];
          i++;
        }
        label = lparts.slice(i-1, lparts.length).join(' ');

        return label;
      }
    });

    xLabels = xLabels.selectAll('text').data(years.concat('Summe')).enter().append('text')
      .attr('text-anchor', 'middle')
      .text(function(d){return d;});

    sortButton.append('tspan').text('Sortieren: ');
    sortButton.append('tspan').text('↑').classed('sort-d-label',true);
    sortButton.append('tspan').text('↓').classed('sort-d-ilabel',true);
    sortButton.append('tspan').text('Name').classed('sort-label',true).on('click',function(){ module.toggleSort('label'); });
    sortButton.append('tspan').text(' / ');
    sortButton.append('tspan').text('↑').classed('sort-d-sum',true);
    sortButton.append('tspan').text('↓').classed('sort-d-isum',true);
    sortButton.append('tspan').text('Summe').classed('sort-sum',true).on('click',function(){ module.toggleSort('sum'); });

    module.resize();
  };

  function shortenLabel(l){
    [["'", 'unbekannt'],['Weltanschauungsgemeinschaften','Weltanschauungsg.'], ['Die/Der ',''], [' -Senatskanzlei -', ' SK'], ['Senatskanzlei', 'SK'], ['SK -', ' SK'],['Angelegenheiten -','Angelegenheiten'], ['des Staatssicherheitsdienstes der ehemaligen DDR','der Stasi'], [' Berlin', ''], ['Bezirksamt', 'BA'], ['Senatsverwaltung für', 'SV']].forEach(function(r){
      l = l.replace(r[0],r[1]);
    });
    return l;
  }

  function formNum(n){
    return ((n<10)?'0':'')+n;
  }

  module.resize = function(){
    width = container.node().offsetWidth;
    height = (blockHeight+padding)*labels.size()+padding+yOffset;

    svg.attr('width',width);
    svg.attr('height',height);

    blockWidth = (width-padding*2-xOffset - years.length*padding)/(years.length+1);

    y.range([0, blockHeight]);
    sumw.range([0, blockWidth]);

    module.update();
  };

  module.toggleSort = function(_sort){
    var sorts = ['label','sum'];
    sorts.forEach(function(s){
      svg.classed(s,false);
      svg.classed('i'+s,false);
    });
    if(_sort === sort){
      sort = 'i'+sort;
    }else{
      sort = _sort;
    }
    svg.classed(sort,true);
    module.update();
  };

  module.update = function(){
    buttons
      .attr('height', blockHeight)
      .attr('width', (blockWidth+padding)*(years.length+1)+xOffset);

    groups.data(d3Data).classed('selected', function(d){
        if(filters.indexOf(cleanId(d.key))>-1){
          return true;
        }
        return false;
      }).transition()
      .duration((init)?0:500)
      .attr('transform', function(d){
        return 'translate(0,'+(blockHeight+padding) * d.sort[sort]+')';
      });

    sumg.transition()
      .duration((init)?0:500)
      .attr('transform','translate('+(years.length* (padding+blockWidth))+',0)');

    sumbg.transition()
      .duration((init)?0:500)
      .attr('width', blockWidth);

    sumbars.datum(function(d,i){ return labels.all()[i]; }).transition()
      .duration((init)?0:500)
      .attr('width', function(d,i){
        return sumw(Math.pow(d.value, root));
      });

    xLabels.transition()
      .duration((init)?0:500)
      .attr('x', function(d,i){
        return (blockWidth+padding) * i + blockWidth/2;
      });

    bgs.data(function(d){return d.years;}).transition()
      .duration((init)?0:500)
      .attr('width', blockWidth)
      .attr('height', blockHeight)
      .style('fill', function(d){ return (filterYears.indexOf(d.key)>-1)?'rgba(45,145,210,0.3)':''; })
      .attr('x', function(d){
        return (blockWidth+padding) * years.indexOf(d.key);
      });

    bars.data(function(d){return d.years;}).transition()
      .duration((init)?0:500)
      .attr('width', blockWidth)
      .attr('height', function(d){
        return y(Math.pow(d.value, root));
      })
      .attr('x', function(d){
        return (blockWidth+padding) * years.indexOf(d.key);
      })
      .attr('y', function(d){
        return blockHeight - y(Math.pow(d.value, root));
      });

    init = false;
  };

  module.data = function(_data, _labels, _filters, _filterYears){
    filters = _filters;
    filterYears = _filterYears;
    data = _data;
    d3Data = splitData(_data, _labels);
    labels = _labels;

    svg.classed('hasSelection', ((filters.length>0)?true:false));

    y.domain([0,Math.pow(data.top(1)[0].value, root)]);
    sumw.domain([0,Math.pow(labels.top(1)[0].value, root)]);

    module.update();
  };

  return module;
};
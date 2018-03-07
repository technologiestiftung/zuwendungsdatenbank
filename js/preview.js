var preview = function(_container, _data, _dicts){

  var module = {},
    container = _container,
    data = _data.allFiltered(),
    dicts = _dicts,
    page = 0,
    perpage = 40;

  module.init = function(){
    module.sortData();

    for(var key in dicts){
      var tdict = {};
      dicts[key].forEach(function(d){
        tdict[d.id] = d.label;
      });
      dicts[key] = tdict;
    }

    module.update();
  };

  module.data = function(_data){
    data = _data.allFiltered();
    module.sortData();
    page = 0;
    module.update();
  };

  module.sortData = function(){
    data.sort(function(a,b){
      return b.betrag-a.betrag;
    });
  };

  function formNum(n){
    return ((n<10)?'0':'')+n;
  }

  module.update = function(){
    d3.selectAll('.pagination span').text( (page*perpage + 1) + ' bis ' +  ((((page+1)*perpage)>data.length)?data.length:((page+1)*perpage)) + ' von ' + data.length);
    var tdata = data.filter(function(d,i){
      if(i>=page*perpage && i < (page+1)*perpage){
        return true;
      }
      return false;
    });
    
    container.selectAll('tr').remove();
    var rows = container.selectAll('tr').data(tdata).enter().append('tr');

    (['jahr','name','politikbereich','geber','zweck','betrag']).forEach(function(c){
      rows.append('td').attr('class',c).datum(function(d){ return d[c]; }).html(function(d){
        if(c in dicts){
          return dicts[c][d];
        }
        if(c == 'betrag'){
          return currency(d);
        }
        return d;
      });
    });
  };

  module.next = function(){
    if(Math.floor(data.length/perpage)>page){
      page++;
    }
    module.update();
  };

  module.prev = function(){
    if(page > 0){
      page--;
    }
    module.update();
  };

  return module;
};
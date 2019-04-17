let tip = tooltip();

let table_mode = false
d3.select('#switchTables').on('click',d=>{
    if(!table_mode){
        d3.select('#preview').style('display','none')
        d3.select('#preview_group').style('display','block')
        d3.select('#switchTables').html('&harrw;&nbsp;zurück zur detaillierten Tabelle')
        table_mode = true
    }else{
        d3.select('#preview').style('display','block')
        d3.select('#preview_group').style('display','none')
        d3.select('#switchTables').html('&harrw;&nbsp;Tabelle nach Empfängern gruppieren')
        table_mode = false
    }
})

let initialised = false

  // ACTIONS FROM THE UI

function updateUI(){
  updateCharts();
}

function doFilters(_filters){
    if(initialised){
        document.getElementById('vis').scrollIntoView();
        reset();
        for(let key in _filters){
            state[key] = _filters[key];
        }
        updateFilter();
    }
}

d3.select('#bvg-search').on('click', d=>{
    doFilters({
        searchterm_name:['bvg']
    })
})

d3.select('#anti-search').on('click', d=>{
    doFilters({
        politikbereich:['01']
    })
})

//Predefined Filters

//Create a global object that contains dimensions and groups, etc.

var state = {}, searchterm_name = '', empfaenger, organisations_a, organisations, organisations_keys, searchterm_zweck = '', overall_count, overall_sum, amount, bin_borders, bin_count_borders, bin_sum_borders, dates_count, fund, all, all_groups, date, dates, names, names_sum, names_count, zwecke, empfaenger_root, postcode, postcodes, politikbereich, politikbereichs, geber, gebers, geber_jahre, gebers_jahre, politikbereich_jahre, politikbereichs_jahre, postcodeYears, postcodeYears_count, filter, sum_chart, art_chart, year_chart, map_chart, map_chart_years, table;

function updateFilter(){
  var changed = false;
  for(var key in state){
    if(key in filter && state[key].length>=1){
      state[key].forEach(function(s){
        if(filter[key].indexOf(s)==-1){
          filterFunction(key, s, true);
          changed = true;
        }
        if(key == 'searchterm_zweck'){
            d3.select('#search_zweck').property('value', s)
        }else if(key == 'searchterm_name'){
            d3.select('#search').property('value', s)
        }
      });
    }
  }
  if(changed){
    dispatcher.call('action', this, createURL());
  }
}

var filterFunction = function(key, value, silent){
  console.log('filterFunction', key, value, silent)
  //fix bug with double zero digits
  value = cleanId(value);

  if(key == 'searchterm_name' || key == 'searchterm_zweck'){

    filter[key] = value    

  }else{

      if(filter[key].indexOf(value)>-1){
        filter[key].splice(filter[key].indexOf(value), 1);
      }else{
        filter[key].push(value);
      }

  }

  var dimension = null, borders = null;
  switch(key){
    case 'date':
      dimension = date;
    break;
    case 'postcode':
      dimension = postcode;
    break;
    case 'politikbereich':
      dimension = politikbereich;
    break;
    case 'geber':
      dimension = geber;
    break;
    case 'bin':
      dimension = amount;
      borders = bin_borders;
    break;
    case 'bin_sum':
      dimension = overall_sum;
      borders = bin_sum_borders;
    break;
    case 'bin_count':
      dimension = overall_count;
      borders = bin_count_borders;
    break;
  }

  if(key == 'searchterm_name'){

        if(filter[key].length > 2){
            names.filter(function(d){
                if(d.indexOf(filter[key].toLowerCase())>-1){
                    return true;
                }
                return false;
            });
        }else{
            names.filterAll();
        }

  }else if(key == 'searchterm_zweck'){

        if(filter[key].length > 2){

            zwecke.filter(function(d){
                if(d.indexOf(filter[key].toLowerCase())>-1){
                    return true;
                }
                return false;
            });

        }else{

            zwecke.filterAll();

        }

  }else if(key == 'bin' || key == 'bin_count' || key == 'bin_sum'){

    if(filter[key].length == 0){

        dimension.filterAll();

    }else{

        filter[key].forEach((f,fi)=>{
            filter[key][fi] = parseInt(filter[key][fi])
        })

        dimension.filter(d=>{
            let inside = false
            for(let b = 0; b<borders.length; b++){
                if(filter[key].indexOf(b)>-1){
                    if(b == borders.length-1){
                        if(d >= borders[b]){
                            inside = true
                        }
                    }else if(d >= borders[b] && d < borders[b+1]){
                        inside = true
                    }
                }
            }
            return inside;
        })

    }

  }else{

      if(filter[key].length == 0){

        dimension.filterAll();

      }else{

        dimension.filter(function(d){
          if(filter[key].indexOf(d)>-1){
            return true;
          }
          return false;
        });

      }
  }

  if(!silent || silent == undefined){
    for(var key in filter){
        if(key == 'searchterm_name' || key == 'searchterm_zweck'){
            state[key] = filter[key];
        }else{
            state[key] = filter[key].join(',');
        }
    }

    dispatcher.call('action', this, createURL());
  }
};

d3.select('#reset').on('click', function(){
  reset()
});

function reset(){
  for(var key in state){
    var states = state[key]

    if(!Array.isArray(states)) states = states.split(',')

    if(state[key].length>0){
      states.forEach(s=>{
        filterFunction(key, s, true);
      })
    }

    state[key] = [];
    if(key == 'searchterm_name' || key == 'searchterm_zweck'){
        state[key] = ''
        filterFunction(key, '', true);
    }
  }

  searchterm_name = ''
  searchterm_zweck = ''

  d3.selectAll('#search, #search_zweck').property('value', '')

  dispatcher.call('action', this, createURL());
}

let extension = '-2017-ckan'

let fileLoads = {}

let callbackLoad = (type, file, loadID, size, callback) => {
  d3[type](file, callback)
    .on('progress', evt=>{
      if(!(loadID in fileLoads)) fileLoads[loadID] = {total:size, loaded:evt.loaded}
      fileLoads[loadID].loaded = evt.loaded
      updateProgress()
    })
}

let updateProgress = ()=>{
  let total = 0, loaded = 0
  for(let loadID in fileLoads){
    total += fileLoads[loadID].total
    loaded += fileLoads[loadID].loaded
  }

  loaderFunds.html(currency(Math.round(loadScale(loaded/total))));
  foreground.attr('d', d=>{
    d.endAngle = loadCoinScale(loaded/total)
    return arc(d);
  });
  
}

//d3.select('#container').style('display','none')

var icon = d3.select('#loader-icon').append('svg').attr('width',100).attr('height',100).append('g').attr('transform', 'translate(50,50)'),
  loadScale = d3.scaleLinear().range([0,14145702625]).domain([0,1]),
  loadCoinScale = d3.scaleLinear().range([0,Math.PI*2]).domain([0,1]),
  loaderFunds = d3.select('#loader-funds'),
  arcBG = d3.arc()
      .innerRadius(42)
      .outerRadius(48)
      .startAngle(0),
  arc = d3.arc()
      .innerRadius(43)
      .outerRadius(47)
      .startAngle(0),
  background = icon.append('path')
    .datum({endAngle: Math.PI*2})
      .style("fill", "#ddd")
      .attr("d", arcBG),
  foreground = icon.append("path")
      .datum({endAngle: 0})
      .style("fill", "#777")
      .attr("d", arc);

icon.append('text').attr('text-anchor','middle').attr('id','euro-sign').style('fill','#777').style('font-size',72).text('€').attr('dy',24).attr('dx',-3);

function arcTween(newAngle) {
  return function(d) {
    var interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  };
}

let crossfilter_build = 0, funds, plz, dict_geber, dict_name, dict_zweck, dict_plz, zweck_keys, dict_politikbereich, name_keys

if(window.innerWidth >= 1024){
    initialised = true;
    initialiseThis()
}

function initialiseThis(){
    d3.queue()
      .defer(callbackLoad, 'json', "./data/plz.topojson","plz",333505)
      .defer(callbackLoad, 'csv', "./data/min"+extension+".csv","min",2846095)
      .defer(callbackLoad, 'csv', "./data/dict_geber"+extension+".csv","dict_geber",1897)
      .defer(callbackLoad, 'csv', "./data/dict_name"+extension+".csv","dict_name",376613)
      .defer(callbackLoad, 'csv', "./data/dict_zweck"+extension+".csv","dict_zweck",2614485)
      .defer(callbackLoad, 'csv', "./data/dict_plz"+extension+".csv","dict_plz",6635)
      .defer(callbackLoad, 'csv', "./data/dict_politikbereich"+extension+".csv","dict_politikbereich",500)
      .await(function(error, _plz, _funds, _dict_geber, _dict_name, _dict_zweck, _dict_plz, _dict_politikbereich){

        plz = _plz
        funds = _funds
        dict_geber = _dict_geber
        dict_name = _dict_name
        dict_zweck = _dict_zweck
        dict_plz = _dict_plz
        dict_politikbereich = _dict_politikbereich

      loaderFunds.html(currency(Math.round(loadScale(1))));
      foreground.attr('d', d=>{
        d.endAngle = Math.PI*2
        return arc(d);
      });

      d3.select('#loader').style('display','none')
      d3.select('#sumChart').style('display','block')

      name_keys = {}
      dict_name.forEach((d,di)=>{
        name_keys[d.id] = di
      })

      zweck_keys = {}
      dict_zweck.forEach((d,di)=>{
        zweck_keys[d.id] = di
      })

      plz = topojson.feature(plz, plz.objects.plz);

      organisations = {}
      organisations_a = []
      organisations_keys = {}

      // A little coercion, since the CSV is untyped.
      funds.forEach(function(d, i) {
        d.index = i;
        d.date = new Date(d.jahr);
        d.betrag = +d.betrag;

        if(!(d.empfaengerid in organisations)) organisations[d.empfaengerid] = {count:0, sum:0, id:[], empfaengerid:d.empfaengerid}

        organisations[d.empfaengerid].id.push(i)
        organisations[d.empfaengerid].count++
        organisations[d.empfaengerid].sum += d.betrag

        if(organisations[d.empfaengerid].count > 8000) console.log(d.empfaengerid)

        organisations_keys[d.empfaengerid] = dict_name[name_keys[d.name]].label

      });

      for(let o_key in organisations){
        organisations_a.push({
            id:o_key,
            empfaengerid:organisations[o_key].empfaengerid,
            count:organisations[o_key].count,
            sum:organisations[o_key].sum
        })
      }

      funds.forEach(f=>{
        f['overall_count'] = organisations[f.empfaengerid].count
        f['overall_sum'] = organisations[f.empfaengerid].sum
      })

      //id;name;geber;art;jahr;anschrift;politikbereich;zweck;betrag;empfaengerid;plz;city;street

      buildCrossFilter()
    });
}

function buildCrossFilter() {

    switch(crossfilter_build){
          // Create the crossfilter for the relevant dimensions and groups.

        case 1:

          fund = crossfilter(funds);
          all = fund.groupAll().reduceSum(function(d){return d.betrag; });
          all_groups = fund.groupAll().reduceCount();

        break;

        case 2:

          var empfaenger_root = fund.dimension(function(d) { return d.empfaengerid; });
          empfaenger = empfaenger_root.group();
          names_sum = empfaenger_root.group().reduceSum(function(d) { return d.betrag; });
          names_count = empfaenger_root.group().reduceCount();

        break;
        case 3:

          amount = fund.dimension(function(d) { return d.betrag; });
          overall_count = fund.dimension(function(d) { return d.overall_count; });
          overall_sum = fund.dimension(function(d) { return d.overall_sum; });

        break;
        case 4:

          date = fund.dimension(function(d) { return d.jahr; });
          dates = date.group().reduceSum(function(d) { return d.betrag; });
          dates_count = date.group().reduceCount();

        break;
        case 5:

          names = fund.dimension(function(d) { return dict_name[name_keys[d.name]].label.toLowerCase(); });
          zwecke = fund.dimension(function(d) { return dict_zweck[zweck_keys[d.zweck]].label.toLowerCase(); });

        break;
        case 6:

          postcode = fund.dimension(function(d) { return d.plz; });
          postcodes = postcode.group().reduceSum(function(d) { return d.betrag; });
          postcodes_count = postcode.group().reduceCount();

        break;
        case 7:

          politikbereich = fund.dimension(function(d) { return d.politikbereich; });
          politikbereichs = politikbereich.group().reduceSum(function(d) { return d.betrag; });
          politikbereichs_count = politikbereich.group().reduceCount();

        break;
        case 8:

          //for the labels
          geber = fund.dimension(function(d) { return d.geber; });
          gebers = geber.group().reduceSum(function(d) { return d.betrag; });
          gebers_count = geber.group().reduceCount();

        break;
        case 9:

          geber_jahre = fund.dimension(function(d) { return ((d.geber < 10)?'0':'') +d.geber + '_' + d.jahr; });
          gebers_jahre = geber_jahre.group().reduceSum(function(d) { return d.betrag; });
          gebers_jahre_count = geber_jahre.group().reduceCount();

        break;
        case 10:

          politikbereich_jahre = fund.dimension(function(d) { return ((d.politikbereich < 10)?'0':'') +d.politikbereich + '_' + d.jahr; });
          politikbereichs_jahre = politikbereich_jahre.group().reduceSum(function(d) { return d.betrag; });
          politikbereichs_jahre_count = politikbereich_jahre.group().reduceCount();
        break;
    }

    crossfilter_build++

    if(crossfilter_build<=10){
        buildCrossFilter()
    }else{
        buildVis()
    }
}

function buildVis(){
  postcodeYears = {};
  postcodeYears_count = {};

  //for(var i = 2009; i<=2016; i++){
  postcodeYears[2009] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2009)?d.betrag:0); });
  postcodeYears[2010] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2010)?d.betrag:0); });
  postcodeYears[2011] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2011)?d.betrag:0); });
  postcodeYears[2012] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2012)?d.betrag:0); });
  postcodeYears[2013] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2013)?d.betrag:0); });
  postcodeYears[2014] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2014)?d.betrag:0); });
  postcodeYears[2015] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2015)?d.betrag:0); });
  postcodeYears[2016] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2016)?d.betrag:0); });
  postcodeYears[2017] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2017)?d.betrag:0); });

  postcodeYears_count[2009] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2009)?1:0); });
  postcodeYears_count[2010] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2010)?1:0); });
  postcodeYears_count[2011] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2011)?1:0); });
  postcodeYears_count[2012] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2012)?1:0); });
  postcodeYears_count[2013] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2013)?1:0); });
  postcodeYears_count[2014] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2014)?1:0); });
  postcodeYears_count[2015] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2015)?1:0); });
  postcodeYears_count[2016] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2016)?1:0); });
  postcodeYears_count[2017] = postcode.group().reduceSum(function(d) { return ((d.jahr == 2017)?1:0); });
  //}

  filter = {bin:[],bin_sum:[],bin_count:[],date:[],politikbereich:[],geber:[],postcode:[],searchterm_name:'',searchterm_zweck:''};

  sum_chart = sumChart(d3.select('#sumChart'), all);
  sum_chart.init();

  bin_borders =         calcBinBorders(amount, 'betrag')
  bin_sum_borders =     calcBinBordersSpecial(names_sum, 'value')
  bin_count_borders =   calcBinBordersSpecial(names_count, 'value')

  bin_chart = binChart(d3.select('#binChart-1'), calcBins(amount, bin_borders, 'betrag'), 'Förderungen', filterFunction, 'bin');
  bin_chart.init();

  let organisations_t = buildOrganisation()

  bin_sum_chart = binChart(d3.select('#binChart-2'), calcBinsSpecial(organisations_t, bin_sum_borders, 'sum'), 'Empfänger mit Summen', filterFunction, 'bin_sum');
  bin_sum_chart.init();

  bin_count_chart = binChart(d3.select('#binChart-3'), calcBinsSpecial(organisations_t, bin_count_borders, 'count'), 'Empfänger', filterFunction, 'bin_count');
  bin_count_chart.init();
  
  geber_chart = matrixChart(d3.select('#geberChart'), gebers, gebers_jahre, dict_geber, gebers_jahre_count, filterFunction, 'geber', tip);
  geber_chart.init();

  art_chart = matrixChart(d3.select('#artChart'), politikbereichs, politikbereichs_jahre, dict_politikbereich, politikbereichs_jahre_count, filterFunction, 'politikbereich', tip);
  art_chart.init();

  year_chart = yearChart(d3.select('#yearChart'), dates, dates_count, filterFunction, 'date', tip);
  year_chart.init();

  map_chart = mapChart(d3.select('#mapChart'), plz, postcodes, postcodes_count, dict_plz, filterFunction, 'postcode', tip, false, 0);
    map_chart.init();

  map_chart_years = [];
  for(var i = 2009; i<=2017; i++){
    var container = d3.select('#maprow').append('div').attr('id', 'map'+i);
    map_chart_years[i] = mapChart(container, plz, postcodeYears[i], postcodeYears_count[i], dict_plz, filterFunction, 'postcode', tip, true, i);
    map_chart_years[i].init();
    map_chart_years[i].hide();
  }

  d3.select('#mmb-ratio').on('click', ()=>{ switchMaps('ratio'); })
  d3.select('#mmb-sum').on('click', ()=>{ switchMaps('sum'); })
  d3.select('#mmb-count').on('click', ()=>{ switchMaps('count'); })

  let minimapstate = false;
  d3.select('#showMiniMap').on('click', ()=>{
    if(!minimapstate){
        d3.select('#minimap-buttons').style('display','block');
        d3.select('#showMiniMap').html('&#10224;&nbsp;Jahreskarten ausblenden')
        map_chart_years.forEach(m=>{m.show();})
    }else{
        d3.select('#showMiniMap').html('&#10225;&nbsp;Jahreskarten anzeigen')
        d3.select('#minimap-buttons').style('display','none');
        map_chart_years.forEach(m=>{m.hide();})
    }
    minimapstate = !minimapstate
  })

  table = preview(d3.select('#preview tbody'), fund, {zweck:dict_zweck, name:dict_name, geber:dict_geber, politikbereich:dict_politikbereich }, ['jahr','name','politikbereich','geber','zweck','betrag'], d3.select('#preview'));
  table.init();

  grouped_table = previewLight(d3.select('#preview_group tbody'), buildGrouping(), {}, ['name','count','sum'], d3.select('#preview_group'));
  grouped_table.init();

  d3.selectAll('#preview .next').on('click', function(){ table.next(); });
  d3.selectAll('#preview .prev').on('click', function(){ table.prev(); });
  d3.selectAll('#preview th').on('click', function(){
    table.setSort(d3.select(this).attr('data-key'))
  })

  d3.selectAll('#preview_group .next').on('click', function(){ grouped_table.next(); });
  d3.selectAll('#preview_group .prev').on('click', function(){ grouped_table.prev(); });
  d3.selectAll('#preview_group th').on('click', function(){
    grouped_table.setSort(d3.select(this).attr('data-key'))
  })

  d3.select('#search').on('keyup', debouncer(function(e){
      let v = d3.select('#search').property('value');
      filterFunction('searchterm_name', v, false)
  }, 200));

  d3.select('#search_zweck').on('keyup', debouncer(function(e){
      let v = d3.select('#search_zweck').property('value');
      filterFunction('searchterm_zweck', v, false)
  }, 200));

  d3.select(window).on('resize', debouncer(function(e){
    year_chart.resize();
    geber_chart.resize();
    art_chart.resize();
    map_chart.resize();
    bin_chart.resize();
    bin_sum_chart.resize();
    bin_count_chart.resize();
    for(var year in map_chart_years){
      map_chart_years[year].resize();
    }
  }), 200);

  retrieveUrl();

}

d3.select(window).on('resize', debouncer(function(e){
    if(window.innerWidth >= 1024 && !initialised){
        initialised = true;
        initialiseThis()
    }
}), 200);

function buildGrouping (){
    let t_names_sum = names_sum.all(),
        t_names_count = names_count.all()
    
    return t_names_sum.map((d,i)=>{
        return {
            name:organisations_keys[d.key],
            sum:d.value,
            count:t_names_count[i].value
    };}).filter(d=>d.sum>0)
}

function calcBinBorders (group, key) {
    let bin_count = 10, 
        bin_border = [],
        data = group.top(Infinity)

    data.sort((a,b)=>{
        return a[key]-b[key]
    })

    for(let i = 0; i<bin_count; i++){
        let id = Math.round(i*(data.length/bin_count))
        if(id>=data.length) id = data.length-1
        bin_border.push(data[id][key])
    }

    for(let i = bin_border.length-1; i>0; i--){
        if(bin_border[i] == bin_border[i-1]) bin_border.splice(i,1)
    }

    bin_border.sort((a,b)=>{ return a-b; })

    return bin_border
}

function calcBinBordersSpecial (group, key) {
    let bin_count = 10, 
        bin_border = [],
        data = group.top(Infinity)

    data.sort((a,b)=>{
        return a[key]-b[key]
    })

    for(let i = 0; i<bin_count; i++){
        let id = Math.round(i*(data.length/bin_count))
        if(id>=data.length) id = data.length-1
        bin_border.push(data[id][key])
    }

    for(let i = bin_border.length-1; i>0; i--){
        if(bin_border[i] == bin_border[i-1]) bin_border.splice(i,1)
    }

    bin_border.sort((a,b)=>{ return a-b; })

    return bin_border
}

function calcBins (group, bin_border, key){
    let data = group.top(Infinity), bins = []

    data.sort((a,b)=>{
        return a[key]-b[key]
    })

    for(let i = 0; i<bin_border.length; i++){
        bins[i] = 0;
    }

    data.forEach(d=>{
        let found = false
        for(let i = 0; i<bin_border.length; i++){
            if(d[key] >= bin_border[i] && d[key] < bin_border[i+1]){
                bins[i]++
                found = true
            }
        }

        if(!found){
            if(d[key]<=bin_border[0]){
                bins[0]++
            }else{
                bins[bin_border.length-1]++
            }
        }
    })

    bins.forEach((b,bi)=>{
        bins[bi] = {
            value:b,
            from:bin_border[bi],
            to:( (bi < bins.length-1) ? (bin_border[bi+1]-1) : ((data.length==0)?0:data[data.length-1][key]) )
        }
    })

    return bins
}

function calcBinsSpecial (group, bin_border, key){
    let bins = []

    group.sort((a,b)=>{
        return a[key]-b[key]
    })

    for(let i = 0; i<bin_border.length; i++){
        bins[i] = 0;
    }

    group.forEach(d=>{
        let found = false
        for(let i = 0; i<bin_border.length; i++){
            if(d[key] >= bin_border[i] && d[key] < bin_border[i+1]){
                bins[i]++
                found = true
            }
        }

        if(!found){
            if(d[key]<=bin_border[0]){
                bins[0]++
            }else{
                bins[bin_border.length-1]++
            }
        }
    })

    bins.forEach((b,bi)=>{
        bins[bi] = {
            value:b,
            from:bin_border[bi],
            to:( (bi < bins.length-1) ? (bin_border[bi+1]-1) : ((group.length==0)?0:group[group.length-1][key]) )
        }
    })

    return bins
}

function buildOrganisation(){
    let filtered = empfaenger.all()
    return filtered.filter(d=>d.value>0).map(d=>organisations[d.key])
}

function switchMaps(mode){
    d3.select('#minimap-buttons').classed('sum',false).classed('ratio',false).classed('count',false).classed(mode,true)
    for(var i = 2009; i<=2017; i++){
        map_chart_years[i].switchDisplayMode(mode);
    }
}

function updateCharts(){
    let organisations_t = buildOrganisation()

  bin_chart.data(calcBins(amount, bin_borders, 'betrag'), filter['bin'])
  bin_sum_chart.data(calcBinsSpecial(organisations_t, bin_sum_borders, 'sum'), filter['bin_sum'])
  bin_count_chart.data(calcBinsSpecial(organisations_t, bin_count_borders, 'count'), filter['bin_count'])

  geber_chart.data(gebers_jahre, gebers, gebers_jahre_count, filter['geber'], filter['date']);
  art_chart.data(politikbereichs_jahre, politikbereichs, politikbereichs_jahre_count, filter['politikbereich'], filter['date']);
  year_chart.data(dates, dates_count, filter['date']);
  table.data(fund);
  grouped_table.data(buildGrouping());
  sum_chart.data(all);
  map_chart.data(postcodes, postcodes_count, filter['postcode']);

  for(var year in map_chart_years){
    map_chart_years[year].data(postcodeYears[year], postcodeYears_count[year], filter['postcode']);
  }
}

var images = new Array()
function preload(img) {
    for (var i = 0; i < img.length; i++) {
        images[i] = new Image()
        images[i].src = './images/'+img[i]+'.png'
    }
}

preload(
    ["t-l@2x",
    "t-m@2x",
    "t-r@2x",
    "m-l@2x",
    "m-m@2x",
    "m-r@2x",
    "b-l@2x",
    "b-m@2x",
    "b-r@2x",
    "t-l-r@2x",
    "t-m-r@2x",
    "t-r-r@2x",
    "m-l-r@2x",
    "m-m-r@2x",
    "m-r-r@2x",
    "b-l-r@2x",
    "b-m-r@2x",
    "b-r-r@2x",

    "t-l-b@2x",
    "t-m-b@2x",
    "t-r-b@2x",
    "m-l-b@2x",
    "m-m-b@2x",
    "m-r-b@2x",
    "b-l-b@2x",
    "b-m-b@2x",
    "b-r-b@2x",

    "t-l-t@2x",
    "t-m-t@2x",
    "t-r-t@2x",
    "m-l-t@2x",
    "m-m-t@2x",
    "m-r-t@2x",
    "b-l-t@2x",
    "b-m-t@2x",
    "b-r-t@2x"][
)
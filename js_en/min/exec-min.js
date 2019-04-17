"use strict";var tip=tooltip(),table_mode=!1;function updateUI(){updateCharts()}function doFilters(e){if(initialised){for(var t in document.getElementById("vis").scrollIntoView(),reset(),e)state[t]=e[t];updateFilter()}}d3.select("#switchTables").on("click",function(e){table_mode?(d3.select("#preview").style("display","block"),d3.select("#preview_group").style("display","none"),d3.select("#switchTables").html("&harrw;&nbsp;table with grouped recipients"),table_mode=!1):(d3.select("#preview").style("display","none"),d3.select("#preview_group").style("display","block"),d3.select("#switchTables").html("&harrw;&nbsp;back to detailed table"),table_mode=!0)}),d3.select("#bvg-search").on("click",function(e){doFilters({searchterm_name:["bvg"]})}),d3.select("#anti-search").on("click",function(e){doFilters({politikbereich:["01"]})});var empfaenger,organisations_a,organisations,organisations_keys,overall_count,overall_sum,amount,bin_borders,bin_count_borders,bin_sum_borders,dates_count,fund,all,all_groups,date,dates,names,zwecke,empfaenger_root,names_sum,names_count,postcode,postcodes,politikbereich,politikbereichs,geber,gebers,geber_jahre,gebers_jahre,politikbereich_jahre,politikbereichs_jahre,postcodeYears,postcodeYears_count,filter,sum_chart,art_chart,year_chart,map_chart,map_chart_years,table,state={},initialised=!1,searchterm_name="",searchterm_zweck="";function updateFilter(){var e=!1;for(var t in state)t in filter&&state[t].length>=1&&state[t].forEach(function(r){-1==filter[t].indexOf(r)&&(filterFunction(t,r,!0),e=!0),"searchterm_zweck"==t?d3.select("#search_zweck").property("value",r):"searchterm_name"==t&&d3.select("#search").property("value",r)});e&&dispatcher.call("action",this,createURL())}var filterFunction=function(e,t,r){console.log("filterFunction",e,t,r),t=cleanId(t),"searchterm_name"==e||"searchterm_zweck"==e?filter[e]=t:filter[e].indexOf(t)>-1?filter[e].splice(filter[e].indexOf(t),1):filter[e].push(t);var n=null,a=null;switch(e){case"date":n=date;break;case"postcode":n=postcode;break;case"politikbereich":n=politikbereich;break;case"geber":n=geber;break;case"bin":n=amount,a=bin_borders;break;case"bin_sum":n=overall_sum,a=bin_sum_borders;break;case"bin_count":n=overall_count,a=bin_count_borders}if("searchterm_name"==e?filter[e].length>2?names.filter(function(t){return t.indexOf(filter[e].toLowerCase())>-1}):names.filterAll():"searchterm_zweck"==e?filter[e].length>2?zwecke.filter(function(t){return t.indexOf(filter[e].toLowerCase())>-1}):zwecke.filterAll():"bin"==e||"bin_count"==e||"bin_sum"==e?0==filter[e].length?n.filterAll():(filter[e].forEach(function(t,r){filter[e][r]=parseInt(filter[e][r])}),n.filter(function(t){for(var r=!1,n=0;n<a.length;n++)filter[e].indexOf(n)>-1&&(n==a.length-1?t>=a[n]&&(r=!0):t>=a[n]&&t<a[n+1]&&(r=!0));return r})):0==filter[e].length?n.filterAll():n.filter(function(t){return filter[e].indexOf(t)>-1}),!r||null==r){for(var e in filter)state[e]="searchterm_name"==e||"searchterm_zweck"==e?filter[e]:filter[e].join(",");dispatcher.call("action",this,createURL())}};function reset(){for(var e in state){var t=state[e];Array.isArray(t)||(t=t.split(",")),state[e].length>0&&t.forEach(function(t){filterFunction(e,t,!0)}),state[e]=[],"searchterm_name"!=e&&"searchterm_zweck"!=e||(state[e]="",filterFunction(e,"",!0))}searchterm_name="",searchterm_zweck="",d3.selectAll("#search, #search_zweck").property("value",""),dispatcher.call("action",this,createURL())}d3.select("#reset").on("click",function(){reset()});var extension="-2017-ckan",fileLoads={},callbackLoad=function(e,t,r,n,a){d3[e](t,a).on("progress",function(e){r in fileLoads||(fileLoads[r]={total:n,loaded:e.loaded}),fileLoads[r].loaded=e.loaded,updateProgress()})},updateProgress=function(){var e=0,t=0;for(var r in fileLoads)e+=fileLoads[r].total,t+=fileLoads[r].loaded;loaderFunds.html(currency(Math.round(loadScale(t/e)))),foreground.attr("d",function(r){return r.endAngle=loadCoinScale(t/e),arc(r)})},icon=d3.select("#loader-icon").append("svg").attr("width",100).attr("height",100).append("g").attr("transform","translate(50,50)"),loadScale=d3.scaleLinear().range([0,14145702625]).domain([0,1]),loadCoinScale=d3.scaleLinear().range([0,2*Math.PI]).domain([0,1]),loaderFunds=d3.select("#loader-funds"),arcBG=d3.arc().innerRadius(42).outerRadius(48).startAngle(0),arc=d3.arc().innerRadius(43).outerRadius(47).startAngle(0),background=icon.append("path").datum({endAngle:2*Math.PI}).style("fill","#ddd").attr("d",arcBG),foreground=icon.append("path").datum({endAngle:0}).style("fill","#777").attr("d",arc);function arcTween(e){return function(t){var r=d3.interpolate(t.endAngle,e);return function(e){return t.endAngle=r(e),arc(t)}}}icon.append("text").attr("text-anchor","middle").attr("id","euro-sign").style("fill","#777").style("font-size",72).text("€").attr("dy",24).attr("dx",-3);var funds,plz,dict_geber,dict_name,dict_zweck,dict_plz,zweck_keys,dict_politikbereich,name_keys,crossfilter_build=0;function initialiseThis(){d3.queue().defer(callbackLoad,"json","./data/plz.topojson","plz",333505).defer(callbackLoad,"csv","./data/min"+extension+".csv","min",2846095).defer(callbackLoad,"csv","./data/dict_geber"+extension+".csv","dict_geber",1897).defer(callbackLoad,"csv","./data/dict_name"+extension+".csv","dict_name",376613).defer(callbackLoad,"csv","./data/dict_zweck"+extension+".csv","dict_zweck",2614485).defer(callbackLoad,"csv","./data/dict_plz"+extension+".csv","dict_plz",6635).defer(callbackLoad,"csv","./data/dict_politikbereich"+extension+".csv","dict_politikbereich",500).await(function(e,t,r,n,a,i,o,c){for(var s in plz=t,funds=r,dict_geber=n,dict_name=a,dict_zweck=i,dict_plz=o,dict_politikbereich=c,loaderFunds.html(currency(Math.round(loadScale(1)))),foreground.attr("d",function(e){return e.endAngle=2*Math.PI,arc(e)}),d3.select("#loader").style("display","none"),d3.select("#sumChart").style("display","block"),name_keys={},dict_name.forEach(function(e,t){name_keys[e.id]=t}),zweck_keys={},dict_zweck.forEach(function(e,t){zweck_keys[e.id]=t}),plz=topojson.feature(plz,plz.objects.plz),organisations={},organisations_a=[],organisations_keys={},funds.forEach(function(e,t){e.index=t,e.date=new Date(e.jahr),e.betrag=+e.betrag,e.empfaengerid in organisations||(organisations[e.empfaengerid]={count:0,sum:0,id:[],empfaengerid:e.empfaengerid}),organisations[e.empfaengerid].id.push(t),organisations[e.empfaengerid].count++,organisations[e.empfaengerid].sum+=e.betrag,organisations[e.empfaengerid].count>8e3&&console.log(e.empfaengerid),organisations_keys[e.empfaengerid]=dict_name[name_keys[e.name]].label}),organisations)organisations_a.push({id:s,empfaengerid:organisations[s].empfaengerid,count:organisations[s].count,sum:organisations[s].sum});funds.forEach(function(e){e.overall_count=organisations[e.empfaengerid].count,e.overall_sum=organisations[e.empfaengerid].sum}),buildCrossFilter()})}function buildCrossFilter(){switch(crossfilter_build){case 1:fund=crossfilter(funds),all=fund.groupAll().reduceSum(function(e){return e.betrag}),all_groups=fund.groupAll().reduceCount();break;case 2:empfaenger_root=fund.dimension(function(e){return e.empfaengerid}),empfaenger=empfaenger_root.group(),names_sum=empfaenger_root.group().reduceSum(function(e){return e.betrag}),names_count=empfaenger_root.group().reduceCount();break;case 3:amount=fund.dimension(function(e){return e.betrag}),overall_count=fund.dimension(function(e){return e.overall_count}),overall_sum=fund.dimension(function(e){return e.overall_sum});break;case 4:date=fund.dimension(function(e){return e.jahr}),dates=date.group().reduceSum(function(e){return e.betrag}),dates_count=date.group().reduceCount();break;case 5:names=fund.dimension(function(e){return dict_name[name_keys[e.name]].label.toLowerCase()}),zwecke=fund.dimension(function(e){return dict_zweck[zweck_keys[e.zweck]].label.toLowerCase()});break;case 6:postcode=fund.dimension(function(e){return e.plz}),postcodes=postcode.group().reduceSum(function(e){return e.betrag}),postcodes_count=postcode.group().reduceCount();break;case 7:politikbereich=fund.dimension(function(e){return e.politikbereich}),politikbereichs=politikbereich.group().reduceSum(function(e){return e.betrag}),politikbereichs_count=politikbereich.group().reduceCount();break;case 8:geber=fund.dimension(function(e){return e.geber}),gebers=geber.group().reduceSum(function(e){return e.betrag}),gebers_count=geber.group().reduceCount();break;case 9:geber_jahre=fund.dimension(function(e){return(e.geber<10?"0":"")+e.geber+"_"+e.jahr}),gebers_jahre=geber_jahre.group().reduceSum(function(e){return e.betrag}),gebers_jahre_count=geber_jahre.group().reduceCount();break;case 10:politikbereich_jahre=fund.dimension(function(e){return(e.politikbereich<10?"0":"")+e.politikbereich+"_"+e.jahr}),politikbereichs_jahre=politikbereich_jahre.group().reduceSum(function(e){return e.betrag}),politikbereichs_jahre_count=politikbereich_jahre.group().reduceCount()}++crossfilter_build<=10?buildCrossFilter():buildVis()}function buildVis(){postcodeYears_count={},(postcodeYears={})[2009]=postcode.group().reduceSum(function(e){return 2009==e.jahr?e.betrag:0}),postcodeYears[2010]=postcode.group().reduceSum(function(e){return 2010==e.jahr?e.betrag:0}),postcodeYears[2011]=postcode.group().reduceSum(function(e){return 2011==e.jahr?e.betrag:0}),postcodeYears[2012]=postcode.group().reduceSum(function(e){return 2012==e.jahr?e.betrag:0}),postcodeYears[2013]=postcode.group().reduceSum(function(e){return 2013==e.jahr?e.betrag:0}),postcodeYears[2014]=postcode.group().reduceSum(function(e){return 2014==e.jahr?e.betrag:0}),postcodeYears[2015]=postcode.group().reduceSum(function(e){return 2015==e.jahr?e.betrag:0}),postcodeYears[2016]=postcode.group().reduceSum(function(e){return 2016==e.jahr?e.betrag:0}),postcodeYears[2017]=postcode.group().reduceSum(function(e){return 2017==e.jahr?e.betrag:0}),postcodeYears_count[2009]=postcode.group().reduceSum(function(e){return 2009==e.jahr?1:0}),postcodeYears_count[2010]=postcode.group().reduceSum(function(e){return 2010==e.jahr?1:0}),postcodeYears_count[2011]=postcode.group().reduceSum(function(e){return 2011==e.jahr?1:0}),postcodeYears_count[2012]=postcode.group().reduceSum(function(e){return 2012==e.jahr?1:0}),postcodeYears_count[2013]=postcode.group().reduceSum(function(e){return 2013==e.jahr?1:0}),postcodeYears_count[2014]=postcode.group().reduceSum(function(e){return 2014==e.jahr?1:0}),postcodeYears_count[2015]=postcode.group().reduceSum(function(e){return 2015==e.jahr?1:0}),postcodeYears_count[2016]=postcode.group().reduceSum(function(e){return 2016==e.jahr?1:0}),postcodeYears_count[2017]=postcode.group().reduceSum(function(e){return 2017==e.jahr?1:0}),filter={bin:[],bin_sum:[],bin_count:[],date:[],politikbereich:[],geber:[],postcode:[],searchterm_name:"",searchterm_zweck:""},(sum_chart=sumChart(d3.select("#sumChart"),all)).init(),bin_borders=calcBinBorders(amount,"betrag"),bin_sum_borders=calcBinBordersSpecial(names_sum,"value"),bin_count_borders=calcBinBordersSpecial(names_count,"value"),bin_chart=binChart(d3.select("#binChart-1"),calcBins(amount,bin_borders,"betrag"),"Grants",filterFunction,"bin"),bin_chart.init();var e=buildOrganisation();bin_sum_chart=binChart(d3.select("#binChart-2"),calcBinsSpecial(e,bin_sum_borders,"sum"),"Recipients with sum",filterFunction,"bin_sum"),bin_sum_chart.init(),bin_count_chart=binChart(d3.select("#binChart-3"),calcBinsSpecial(e,bin_count_borders,"count"),"Recipients",filterFunction,"bin_count"),bin_count_chart.init(),geber_chart=matrixChart(d3.select("#geberChart"),gebers,gebers_jahre,dict_geber,gebers_jahre_count,filterFunction,"geber",tip),geber_chart.init(),(art_chart=matrixChart(d3.select("#artChart"),politikbereichs,politikbereichs_jahre,dict_politikbereich,politikbereichs_jahre_count,filterFunction,"politikbereich",tip)).init(),(year_chart=yearChart(d3.select("#yearChart"),dates,dates_count,filterFunction,"date",tip)).init(),(map_chart=mapChart(d3.select("#mapChart"),plz,postcodes,postcodes_count,dict_plz,filterFunction,"postcode",tip,!1,0)).init(),map_chart_years=[];for(var t=2009;t<=2017;t++){var r=d3.select("#maprow").append("div").attr("id","map"+t);map_chart_years[t]=mapChart(r,plz,postcodeYears[t],postcodeYears_count[t],dict_plz,filterFunction,"postcode",tip,!0,t),map_chart_years[t].init(),map_chart_years[t].hide()}d3.select("#mmb-ratio").on("click",function(){switchMaps("ratio")}),d3.select("#mmb-sum").on("click",function(){switchMaps("sum")}),d3.select("#mmb-count").on("click",function(){switchMaps("count")});var n=!1;d3.select("#showMiniMap").on("click",function(){n?(d3.select("#showMiniMap").html("&#10225;&nbsp;show annual maps"),d3.select("#minimap-buttons").style("display","none"),map_chart_years.forEach(function(e){e.hide()})):(d3.select("#minimap-buttons").style("display","block"),d3.select("#showMiniMap").html("&#10224;&nbsp;hide annual maps"),map_chart_years.forEach(function(e){e.show()})),n=!n}),(table=preview(d3.select("#preview tbody"),fund,{zweck:dict_zweck,name:dict_name,geber:dict_geber,politikbereich:dict_politikbereich},["jahr","name","politikbereich","geber","zweck","betrag"],d3.select("#preview"))).init(),grouped_table=previewLight(d3.select("#preview_group tbody"),buildGrouping(),{},["name","count","sum"],d3.select("#preview_group")),grouped_table.init(),d3.selectAll("#preview .next").on("click",function(){table.next()}),d3.selectAll("#preview .prev").on("click",function(){table.prev()}),d3.selectAll("#preview th").on("click",function(){table.setSort(d3.select(this).attr("data-key"))}),d3.selectAll("#preview_group .next").on("click",function(){grouped_table.next()}),d3.selectAll("#preview_group .prev").on("click",function(){grouped_table.prev()}),d3.selectAll("#preview_group th").on("click",function(){grouped_table.setSort(d3.select(this).attr("data-key"))}),d3.select("#search").on("keyup",debouncer(function(e){var t=d3.select("#search").property("value");filterFunction("searchterm_name",t,!1)},200)),d3.select("#search_zweck").on("keyup",debouncer(function(e){var t=d3.select("#search_zweck").property("value");filterFunction("searchterm_zweck",t,!1)},200)),d3.select(window).on("resize",debouncer(function(e){for(var t in year_chart.resize(),geber_chart.resize(),art_chart.resize(),map_chart.resize(),bin_chart.resize(),bin_sum_chart.resize(),bin_count_chart.resize(),map_chart_years)map_chart_years[t].resize()}),200),retrieveUrl()}function buildGrouping(){var e=names_sum.all(),t=names_count.all();return e.map(function(e,r){return{name:organisations_keys[e.key],sum:e.value,count:t[r].value}}).filter(function(e){return e.sum>0})}function calcBinBorders(e,t){var r=[],n=e.top(1/0);n.sort(function(e,r){return e[t]-r[t]});for(var a=0;a<10;a++){var i=Math.round(a*(n.length/10));i>=n.length&&(i=n.length-1),r.push(n[i][t])}for(var o=r.length-1;o>0;o--)r[o]==r[o-1]&&r.splice(o,1);return r.sort(function(e,t){return e-t}),r}function calcBinBordersSpecial(e,t){var r=[],n=e.top(1/0);n.sort(function(e,r){return e[t]-r[t]});for(var a=0;a<10;a++){var i=Math.round(a*(n.length/10));i>=n.length&&(i=n.length-1),r.push(n[i][t])}for(var o=r.length-1;o>0;o--)r[o]==r[o-1]&&r.splice(o,1);return r.sort(function(e,t){return e-t}),r}function calcBins(e,t,r){var n=e.top(1/0),a=[];n.sort(function(e,t){return e[r]-t[r]});for(var i=0;i<t.length;i++)a[i]=0;return n.forEach(function(e){for(var n=!1,i=0;i<t.length;i++)e[r]>=t[i]&&e[r]<t[i+1]&&(a[i]++,n=!0);n||(e[r]<=t[0]?a[0]++:a[t.length-1]++)}),a.forEach(function(e,i){a[i]={value:e,from:t[i],to:i<a.length-1?t[i+1]-1:0==n.length?0:n[n.length-1][r]}}),a}function calcBinsSpecial(e,t,r){var n=[];e.sort(function(e,t){return e[r]-t[r]});for(var a=0;a<t.length;a++)n[a]=0;return e.forEach(function(e){for(var a=!1,i=0;i<t.length;i++)e[r]>=t[i]&&e[r]<t[i+1]&&(n[i]++,a=!0);a||(e[r]<=t[0]?n[0]++:n[t.length-1]++)}),n.forEach(function(a,i){n[i]={value:a,from:t[i],to:i<n.length-1?t[i+1]-1:0==e.length?0:e[e.length-1][r]}}),n}function buildOrganisation(){return empfaenger.all().filter(function(e){return e.value>0}).map(function(e){return organisations[e.key]})}function switchMaps(e){d3.select("#minimap-buttons").classed("sum",!1).classed("ratio",!1).classed("count",!1).classed(e,!0);for(var t=2009;t<=2017;t++)map_chart_years[t].switchDisplayMode(e)}function updateCharts(){var e=buildOrganisation();for(var t in bin_chart.data(calcBins(amount,bin_borders,"betrag"),filter.bin),bin_sum_chart.data(calcBinsSpecial(e,bin_sum_borders,"sum"),filter.bin_sum),bin_count_chart.data(calcBinsSpecial(e,bin_count_borders,"count"),filter.bin_count),geber_chart.data(gebers_jahre,gebers,gebers_jahre_count,filter.geber,filter.date),art_chart.data(politikbereichs_jahre,politikbereichs,politikbereichs_jahre_count,filter.politikbereich,filter.date),year_chart.data(dates,dates_count,filter.date),table.data(fund),grouped_table.data(buildGrouping()),sum_chart.data(all),map_chart.data(postcodes,postcodes_count,filter.postcode),map_chart_years)map_chart_years[t].data(postcodeYears[t],postcodeYears_count[t],filter.postcode)}window.innerWidth>=1024&&(initialised=!0,initialiseThis()),d3.select(window).on("resize",debouncer(function(e){window.innerWidth>=1024&&!initialised&&(initialised=!0,initialiseThis())}),200);var images=new Array;function preload(e){for(var t=0;t<e.length;t++)images[t]=new Image,images[t].src="./images/"+e[t]+".png"}preload(["t-l@2x","t-m@2x","t-r@2x","m-l@2x","m-m@2x","m-r@2x","b-l@2x","b-m@2x","b-r@2x","t-l-r@2x","t-m-r@2x","t-r-r@2x","m-l-r@2x","m-m-r@2x","m-r-r@2x","b-l-r@2x","b-m-r@2x","b-r-r@2x","t-l-b@2x","t-m-b@2x","t-r-b@2x","m-l-b@2x","m-m-b@2x","m-r-b@2x","b-l-b@2x","b-m-b@2x","b-r-b@2x","t-l-t@2x","t-m-t@2x","t-r-t@2x","m-l-t@2x","m-m-t@2x","m-r-t@2x","b-l-t@2x","b-m-t@2x","b-r-t@2x"]);
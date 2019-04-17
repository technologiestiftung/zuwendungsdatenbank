"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var binChart=function(t,n,r,e,o){var a,c,i={},u=e,f=o,l=[],s=r,d=guid(),p=!0,y=JSON.parse(JSON.stringify(n)),m=t,h=n,g=d3.scaleLinear().domain([0,y.reduce(function(t,n){return"object"==_typeof(t)&&(t=t.value),t+n.value})]),b=m.append("svg").classed("bin_chart",!0);defs=b.append("defs"),color=d3.scaleLinear().domain([y[0].from,y[y.length-1].to]).range(["rgba(11,138,221,0.1)","rgba(11,138,221,1)"]),color_red=d3.scaleLinear().domain([y[0].from,y[y.length-1].to]).range(["rgba(231,4,51,0.1)","rgba(231,4,51,1)"]),defs.selectAll("linearGradient.blue").data(y).enter().append("linearGradient").attr("class","blue").attr("id",function(t,n){return"binGrad".concat(n,"-").concat(d)}).attr("x1","0%").attr("x2","0%").attr("y1","0%").attr("y2","100%").html(function(t){return'<stop offset="0%" style="stop-color:'.concat(color(t.from),';stop-opacity:1" /><stop offset="100%" style="stop-color:').concat(color(t.to),';stop-opacity:1" />')}),defs.selectAll("linearGradient.red").data(y).enter().append("linearGradient").attr("class","red").attr("id",function(t,n){return"binGrad-red-".concat(n,"-").concat(d)}).attr("x1","0%").attr("x2","0%").attr("y1","0%").attr("y2","100%").html(function(t){return'<stop offset="0%" style="stop-color:'.concat(color_red(t.from),';stop-opacity:1" /><stop offset="100%" style="stop-color:').concat(color_red(t.to),';stop-opacity:1" />')});var v=0;y.forEach(function(t,n){y[n].before=v,v+=t.value});b.append("g").attr("transform","translate(10,20)");var x=b.append("g").attr("transform","translate(10,20)").selectAll("g").data(y).enter().append("g").attr("class","binGs").on("click",function(t,n){u(f,n)}),G=x.append("rect").attr("class","blue-rect").datum(function(t,n){return h[n]}).attr("height",10).style("fill",function(t,n){return"url(#binGrad".concat(n,"-").concat(d,")")}),S=x.append("rect").attr("class","red-rect").datum(function(t,n){return h[n]}).attr("height",10).style("fill",function(t,n){return"url(#binGrad-red-".concat(n,"-").concat(d,")")}),_=x.append("text").attr("dx",8).attr("dy",16).style("fill","#000"),w=_.append("tspan").text(function(t){return t.value}).style("font-weight","bold");return 1==y[0].from?_.append("tspan").text(function(t){return t.to>1?" Empfänger mit "+t.from+(t.to==t.from?"":" bis "+t.to)+" Projekten":" Empfänger mit einem Projekt"}):_.append("tspan").text(function(t){return" ".concat(s," ").concat(t.from!=t.to?"zwischen "+currency(t.from,!0)+" und "+currency(t.to,!0):"von "+currency(t.to,!0))}),i.init=function(){i.resize()},i.data=function(t,n){n.forEach(function(t,r){n[r]=parseInt(n[r])}),h=t,l=n,G.datum(function(t,n){return h[n]}),S.datum(function(t,n){return h[n]}),w.datum(function(t,n){return h[n]}),b.classed("hasSelection",l.length>0),i.update()},i.update=function(){x.classed("selected",function(t,n){return l.indexOf(n)>-1}),G.transition().duration(p?0:500).attr("height",function(t){return g(t.value)}),S.transition().duration(p?0:500).attr("height",function(t){return g(t.value)}),w.text(function(t){return t.value}),p=!1},i.resize=function(){a=m.node().offsetWidth,c=m.node().offsetHeight,g.range([0,c-20-1*y.length]),x.attr("transform",function(t,n){return"translate(0,".concat(g(t.before)+1*n,")")}).attr("height",function(t){return g(t.value)}),G.attr("width",a-20),S.attr("width",a-20),b.attr("width",a),b.attr("height",c),i.update()},i};
"use strict";var matrixChart=function(t,n,e,a,r,o,u,s){var i={},c={};a.forEach(function(t){var n;c[G(t.id)]=(n=t.label,[["'","unbekannt"],["Weltanschauungsgemeinschaften","Weltanschauungsg."],["Die/Der ",""],[" -Senatskanzlei -"," SK"],["Senatskanzlei","SK"],["SK -"," SK"],["Angelegenheiten -","Angelegenheiten"],["des Staatssicherheitsdienstes der ehemaligen DDR","der Stasi"],[" Berlin",""],["Bezirksamt","BA"],["Senatsverwaltung für","SV"]].forEach(function(t){n=n.replace(t[0],t[1])}),n)});var l,d,p,f=!0,h=s,g=o,m=u,b=t,x=n,y=e,v=r,k=j(e,r,n),w=[],S="label",M=[],A=b.append("svg").classed("matrixChart",!0).classed(S,!0),E=d3.scaleLinear().domain([0,Math.pow(y.top(1)[0].value,.25)]),O=d3.scaleLinear().domain([0,Math.pow(v.top(1)[0].value,.25)]),z=A.append("g").attr("transform","translate(160,10)"),T=A.append("g").attr("transform","translate(150,10)").append("text").style("text-anchor","end"),I=[],_=d3.scaleLinear().domain([0,Math.pow(d3.max(k,function(t){return t.sum}),.25)]),D=d3.scaleLinear().domain([0,Math.pow(d3.max(k,function(t){return t.count}),.25)]),K=A.append("g").attr("transform","translate(160,20)").selectAll("g").data(k).enter().append("g").attr("class","matrixGroup"),L=K.append("text").datum(function(t,n){return x.all()[n]}).attr("text-anchor","end"),Y=K.selectAll("rect.bg").data(function(t){return t.years}).enter().append("rect").classed("bg",!0),B=K.selectAll("rect.bar").data(function(t){return t.years}).enter().append("rect").classed("bar",!0),C=K.selectAll("rect.count").data(function(t){return t.years}).enter().append("rect").classed("count",!0),W=K.selectAll("g.sumgroup").data(function(t){return[t]}).enter().append("g").classed("sumgroup",!0),X=W.append("rect").attr("height",25).classed("sumbg",!0),F=W.selectAll("rect.sumbar").data(function(t){return[t]}).enter().append("rect").attr("height",12.5).classed("sumbar",!0),N=W.selectAll("rect.count").data(function(t){return[t]}).enter().append("rect").attr("x",0).attr("height",12.5).attr("y",12.5).classed("count",!0),U=K.append("rect").attr("x",-150).classed("button",!0).on("click",function(t,n){g(m,t.key),t.sum>0&&i.updateToolTip(d3.event.pageX,d3.event.pageY,t,n)}).on("mousemove",function(t){h.move({x:d3.event.pageX,y:d3.event.pageY})}).on("mouseover",function(t,n){t.sum>0&&i.updateToolTip(d3.event.pageX,d3.event.pageY,t,n)}).on("mouseout",function(t){h.hide()});function j(t,n,e){var a=[],r={};t.all().forEach(function(t,e){var o=t.key.split("_"),u=o[0],s=o[1];u in r||(a.push({key:u,years:[]}),r[u]=a.length-1),a[r[u]].years.push({key:s,value:t.value,count:n.all()[e].value})});var o=[];return a.forEach(function(t,n){a[n].sort={sum:0,label:0,isum:0,ilabel:0,icount:0,count:0},a[n].id=n,a[n].label=c[G(e.all()[n].key)],a[n].sum=a[n].years.reduce(function(t,n){return n.value+t},0),a[n].count=a[n].years.reduce(function(t,n){return n.count+t},0),o.push({id:n,label:a[n].label.trim(),sum:a[n].sum,count:a[n].count})}),o.sort(function(t,n){return+(t.label>n.label)||+(t.label===n.label)-1}),o.forEach(function(t,n){a[t.id].sort.label=n,a[t.id].sort.ilabel=o.length-n-1}),o.sort(function(t,n){return n.sum-t.sum}),o.forEach(function(t,n){a[t.id].sort.sum=n,a[t.id].sort.isum=o.length-n-1}),o.sort(function(t,n){return n.count-t.count}),o.forEach(function(t,n){a[t.id].sort.count=n,a[t.id].sort.icount=o.length-n-1}),a}function G(t){return(t<10?"0":"")+t}return A.append("defs").selectAll("pattern").data(["texture","texture_blue","texture_grey"]).enter().append("pattern").attr("id",function(t){return t}).attr("width",5).attr("height",5).attr("patternUnits","userSpaceOnUse").append("image").attr("xlink:href",function(t){return"./images/"+t+".png"}).attr("width",5).attr("height",5),i.updateToolTip=function(t,n,e){var a=!1;(0==w.length||w.indexOf(e.key.substr(1))>-1)&&(a=!0);var r="<tr><th>Year</th><th>Sum</th><th>Count</th></tr>";e.years.forEach(function(t){r+="<tr><td>".concat(t.key,"</td><td>").concat(currency(t.value),"</td><td>").concat(t.count,"</td></tr>")}),h.direction("vertical"),h.show({title:e.label,body:"Sum in (€):<br /><i>".concat(currency(e.sum))+(a?"&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;".concat((e.sum/all.value()*100).toFixed(2),"%"):"")+"</i><br><br />Number of grants:<br /><i>".concat(e.count)+(a?"&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;".concat((e.count/all_groups.value()*100).toFixed(2),"%"):"")+"</i><br /><br /><table>".concat(r,"</table>"),x:t,y:n})},i.init=function(){y.all().forEach(function(t){var n=t.key.split("_")[1];-1==I.indexOf(n)&&I.push(n)}),I.sort(),L.append("tspan").attr("x",-10).attr("dy","1.1em").text(function(t){if(null!=t&&"key"in t&&null!=t.key){for(var n=c[G(t.key)].split(" "),e="",a="",r=0;e.length<35&&r<=n.length;)a=e,r>0&&(e+=" "),e+=n[r],r++;return e=a}return""}),L.append("tspan").attr("x",-10).attr("dy","1.1em").text(function(t){if(null!=t&&"key"in t&&null!=t.key){for(var n=c[G(t.key)].split(" "),e="",a=0;e.length<35&&a<=n.length;)e,a>0&&(e+=" "),e+=n[a],a++;return e=n.slice(a-1,n.length).join(" ")}return""}),z=z.selectAll("text").data(I.concat("Summe")).enter().append("text").attr("text-anchor","middle").text(function(t){return t}),T.append("tspan").text("↑").classed("sort-d-label",!0),T.append("tspan").text("↓").classed("sort-d-ilabel",!0),T.append("tspan").text("Name").classed("sort-label",!0).on("click",function(){i.toggleSort("label")}),T.append("tspan").text(" / "),T.append("tspan").text("↑").classed("sort-d-sum",!0),T.append("tspan").text("↓").classed("sort-d-isum",!0),T.append("tspan").text("Sum").classed("sort-sum",!0).on("click",function(){i.toggleSort("sum")}),T.append("tspan").text(" / "),T.append("tspan").text("↑").classed("sort-d-count",!0),T.append("tspan").text("↓").classed("sort-d-icount",!0),T.append("tspan").text("count").classed("sort-count",!0).on("click",function(){i.toggleSort("count")}),i.resize(),i.sortItems()},i.resize=function(){l=b.node().offsetWidth,d=35*x.size()+10+10,A.attr("width",l),A.attr("height",d),p=(l-20-150-10*I.length)/(I.length+1),E.range([0,25]),O.range([0,25]),_.range([0,p]),D.range([0,p]),X.transition().duration(f?0:500).attr("width",p),z.transition().duration(f?0:500).attr("x",function(t,n){return(p+(10-(n==I.length?0:1)))*n+p/2}),Y.data(function(t){return t.years}).transition().duration(f?0:500).attr("width",p).attr("height",25).style("fill",function(t){return M.indexOf(t.key)>-1?"rgba(45,145,210,0.3)":""}).attr("x",function(t){return(p+9)*I.indexOf(t.key)}),U.attr("height",25).attr("width",(p+10)*(I.length+1)+150),W.transition().duration(f?0:500).attr("transform","translate("+I.length*(10+p)+",0)"),i.update()},i.toggleSort=function(t){["label","sum","count"].forEach(function(t){A.classed(t,!1),A.classed("i"+t,!1)}),S=t===S?"i"+S:t,A.classed(S,!0),i.sortItems()},i.sortItems=function(){K.data(k).classed("selected",function(t){return w.indexOf(cleanId(t.key))>-1}).transition().duration(f?0:500).attr("transform",function(t){return"translate(0,"+35*t.sort[S]+")"})},i.update=function(){K.data(k),U.data(k),W.data(function(t){return[t]}),F.data(function(t){return[t]}).transition().duration(f?0:500).attr("width",function(t,n){return _(Math.pow(t.sum,.25))}),N.data(function(t){return[t]}).transition().duration(f?0:500).attr("width",function(t,n){return D(Math.pow(t.count,.25))}),B.data(function(t){return t.years}).transition().duration(f?0:500).attr("width",p/2).attr("height",function(t){return E(Math.pow(t.value,.25))}).attr("x",function(t){return(p+9)*I.indexOf(t.key)}).attr("y",function(t){return 25-E(Math.pow(t.value,.25))}),C.data(function(t){return t.years}).transition().duration(f?0:500).attr("width",p/2).attr("height",function(t){return O(Math.pow(t.count,.25))}).attr("x",function(t){return(p+9)*I.indexOf(t.key)+p/2}).attr("y",function(t){return 25-O(Math.pow(t.count,.25))}),i.sortItems(),f=!1},i.data=function(t,n,e,a,r){w=a,M=r,y=t,v=e,k=j(t,e,n),x=n,A.classed("hasSelection",w.length>0),E.domain([0,Math.pow(y.top(1)[0].value,.25)]),O.domain([0,Math.pow(v.top(1)[0].value,.25)]),_.domain([0,Math.pow(d3.max(k,function(t){return t.sum}),.25)]),D.domain([0,Math.pow(d3.max(k,function(t){return t.count}),.25)]),i.update()},i};
"use strict";var sumChart=function(t,a){var n={},u=a,e=t.append("span").attr("id","sum");return n.init=function(){n.update()},n.data=function(t){u=t,n.update()},n.update=function(){e.html("<span>Aktuell angezeigte Gesamtsumme:</span><br />"+currency(u.value()))},n};
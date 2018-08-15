/* --------- PIPELINE --------- */

const extension = '-2017-ckan'

let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';'),
	postcode = require('../data/plz.json'),
	yearRange = [2009,2017],
	//TODO: test against fuzzy
	strSim = require('string-similarity'),
	fuzzy = require('fuzzyset.js')

/* --------- postcode.js --------- */

function postcodeData(){

	let data = fs.readFileSync('../data/temp/all_clean_merge'+extension+'-excel.csv', 'utf8'),
	csv = dsvParse.parse(data)

	let post_keys = {}
	postcode.features.forEach((p,i)=>{
		p.properties.count = 0
		p.properties.money = 0
		p.properties.years = []
		for(let year = 0; year <= yearRange[1]-yearRange[0]; year++){
			p.properties.years.push({count:0,money:0})
		}
		post_keys[p.properties.PLZ99_N] = i
	})
	let p_regex = new RegExp(/\, (\d){5}/, 'g'),
		sp_regex = new RegExp(/(\d){4}/, 'g')

	var external = [], external_keys = {}

	csv.forEach(function(d,i){
		let plz = d.anschrift.match(p_regex),
			money = parseInt(d.betrag),
			year = parseInt(d.jahr) - yearRange[0]

		csv[i].empfaengerid = csv[i].empfaengerid.replace('hbr_vr_', 'vr_')

		let empfaengerid = csv[i].empfaengerid.split('_')

		csv[i].empfaengerid = empfaengerid[1]
		csv[i]["empfaengertyp"] = empfaengerid[0].toLowerCase()
		csv[i]["plz"] = 0
		csv[i]["city"] = ''
		csv[i]["street"] = ''

		if(plz != null){
			code = parseInt(plz[0].split(' ')[1])
			csv[i]["plz"] = code
			let anschrift = d.anschrift.split(plz[0])
				csv[i].anschrift = ''
				csv[i]["city"] = anschrift[1].trim()
				csv[i]["street"] = anschrift[0].split(',')[0].trim()

			if(code in post_keys){

				postcode.features[post_keys[code]].properties.count++
				postcode.features[post_keys[code]].properties.money += money

				postcode.features[post_keys[code]].properties.years[year].count++
				postcode.features[post_keys[code]].properties.years[year].money += money

			}else{

				if(!(code in external_keys)){
					external_keys[code] = external.length
					external.push({
						key:code,
						money:0,
						count:0,
						years:[]
					})
					for(let year = 0; year <= yearRange[1]-yearRange[0]; year++){
						external[external.length-1].years.push({count:0,money:0})
					}
				}

				external[external_keys[code]].count++
				external[external_keys[code]].money += money

				external[external_keys[code]].years[year].count++
				external[external_keys[code]].years[year].money += money

			}
		}else{
			if(d.anschrift.trim()==',' || d.anschrift.trim().length < 6){
				csv[i].anschrift = ''
			}else if(d.anschrift.trim()==', Berlin'){
				csv[i].anschrift = ''
				csv[i]["city"] = 'Berlin'
			}else{
				let anschrift = d.anschrift.split(',')
				if(anschrift[1].indexOf('Berlin')>-1){
					csv[i]["city"] = 'Berlin'
					csv[i]["street"] = anschrift[0]
				}else if(anschrift[1].length<=1){
					csv[i]["street"] = anschrift[0]
				}else{
					csv[i]["street"] = anschrift[0]

					let city = ''

					anschrift[1].split(' ').forEach((d)=>{
						if(d.match(sp_regex)){
							csv['plz'] = parseInt(d)
						}else{
							city += ' '+d
						}
					})

					csv[i]["city"] = city.trim()
				}
			}
		}

	})

	fs.writeFileSync('../data/temp/plz_w_data'+extension+'.geojson', JSON.stringify(postcode), 'utf8')
	fs.writeFileSync('../data/temp/plz_external'+extension+'.json', JSON.stringify(external), 'utf8')

	//group by empfaengerid & empfaengertyp
	//merge name, city, plz

	let empfaenger = {}, replacements = {}

	csv.forEach(c=>{
		if(c.empfaengertyp != '' && c.empfaengertyp != undefined){
			if(!(c.empfaengertyp in empfaenger)){
				empfaenger[c.empfaengertyp] = {}
			}

			if(c.empfaengerid != '' && c.empfaengerid != undefined){
				if(!(c.empfaengerid in empfaenger[c.empfaengertyp])){
					empfaenger[c.empfaengertyp][c.empfaengerid] = {}
				}

				if(!(c.name in empfaenger[c.empfaengertyp][c.empfaengerid])){
					empfaenger[c.empfaengertyp][c.empfaengerid][c.name] = 0
				}

				empfaenger[c.empfaengertyp][c.empfaengerid][c.name]+=1
			}
		}
	})

	for(let typ in empfaenger){
		for(let id in empfaenger[typ]){
			let major = 0, major_name = null;
			for(let name in empfaenger[typ][id]){
				if(empfaenger[typ][id][name]>major){
					major = empfaenger[typ][id][name]
					major_name = name
				}
			}

			for(let name in empfaenger[typ][id]){
				replacements[typ+'_'+id+'_'+name] = major_name
			}
		}
	}

	csv.forEach((c,ci)=>{
		if((c.empfaengertyp+'_'+c.empfaengerid+'_'+c.name in replacements)){
			csv[ci].name = replacements[c.empfaengertyp+'_'+c.empfaengerid+'_'+c.name]
		}
	})

	function cleanCol(str){

		if(str != undefined){
			let a = [
				['Str.','Straße'],
				['str.','straße'],
				['Strasse','Straße'],
				['strasse','straße']
			]

			a.forEach(a=>{
				while(str.indexOf(a[0])>=0){
					str = str.replace(a[0],a[1])
				}
			})

			//space after StraßeNUM
			let streets = ['Straße','straße']
			streets.forEach(s=>{
				for(let n = 0; n<=9; n++){
					str = str.replace(s+n, s+' '+n)
				}
			})
		}

		return str.trim()
	}

	csv.forEach((c,ci)=>{
		for(var key in c){
			if(key != 'plz' && key != 'empfaengerid') csv[ci][key] = cleanCol(c[key])
		}
	})

	let ncsv = '';
	for(let key in csv[0]){
		if(ncsv != '') ncsv += ';'
		ncsv += key
	}
	csv.forEach(d=>{
		ncsv += '\n'
		let i = 0
		for(let key in d){
			if(i != 0) ncsv += ';'
			if(d[key] && d[key].length>0){
				if(d[key].indexOf('"')>-1) d[key] = d[key].split('"').join('\"').split('\\"').join('\"')
				if(d[key].indexOf(";")>-1) ncsv += '"'
			}
			ncsv += d[key]
			if((d[key] && d[key].length>0) && d[key].indexOf(";")>-1) ncsv += '"'
			i++
		}
	})

	fs.writeFileSync('../data/temp/all_clean_w_plz'+extension+'.csv', ncsv, 'utf8')

	//NEXT
	clusterData()
}

postcodeData();

/* --------- cluster.js --------- */

function clusterData(){
	let merges = 0, yearRange = [2009,2017], merger = {geber:[
		['Senatsverwaltung für Justiz','Senatsverwaltung für Justiz und Verbraucherschutz'],
		['Senatsverwaltung für Stadtentwicklung und Umwelt','Senatsverwaltung für Stadtentwicklung','Senatsverwaltung für Gesundheit, Umwelt und Verbraucherschutz'],
		['Senatsverwaltung für Wirtschaft, Technologie und Forschung','Senatsverwaltung für Wirtschaft, Technologie und Frauen'],
		['Senatsverwaltung für Bildung, Jugend und Wissenschaft','Senatsverwaltung für Bildung, Wissenschaft und Forschung'],
		['Senatsverwaltung für Gesundheit und Soziales','Senatsverwaltung für Gesundheit, Umwelt und Verbraucherschutz'],
		['Senatsverwaltung für Integration, Arbeit und Soziales','Senatsverwaltung für Arbeit, Integration und Frauen']
	]}, mergeKeys = {}

	function cleanRegEx(str){
		let a = ['.',')','(']
		a.forEach(a=>{
			str = str.split(a).join('\\' + a)
		})
		return str
	}

	let cleanCSV = []

	let data = fs.readFileSync('../data/temp/all_clean_w_plz'+extension+'.csv', 'utf8')
	let csv = dsvParse.parse(data)

	var cols = ["geber","art","politikbereich","city","plz","empfaengertyp","empfaengerid","zweck","name"], //name
		tests = {},
		colCluster = {},
		clusterKeys = {}

	cols.forEach(col => {
		tests[col] = []
		colCluster[col] = []
		clusterKeys[col] = {}
	})

	csv.forEach((c,ci) => {
		//console.log(ci,csv.length)

		let m = parseInt(c.betrag)
			if(isNaN(m)){
				m = 0
			}

		let y = parseInt(c.jahr)
			if(isNaN(y)){
				y = 0
			}

		cols.forEach(col => {
			let v = c[col]

			//console.log(col,v)
			if(v != undefined && v != ''){

				if(v in clusterKeys[col]){

					clusterKeys[col][v].c++
					colCluster[col][clusterKeys[col][v].i].count++
					colCluster[col][clusterKeys[col][v].i].money += m
					colCluster[col][clusterKeys[col][v].i].years[y-yearRange[0]].money += m
					colCluster[col][clusterKeys[col][v].i].years[y-yearRange[0]].count++

				}else{

					//let f = null, r = false

					// if(col != 'plz' && col != 'empfaengerid'){
					// 	f = fuzzy(tests[col])
					// 	r = f.get(v)
					// }

					// if(r && r[0][0] > 0.8){
					// 	merges++

					// 	let match1 = data.match(new RegExp(cleanRegEx(v), 'g')),
					// 		match2 = data.match(new RegExp(cleanRegEx(r[0][1]), 'g'))

					// 	if(match1 > match2){
					// 		colCluster[col][clusterKeys[col][r[0][1]].i].key = v
					// 	}

					// 	colCluster[col][clusterKeys[col][r[0][1]].i].count++
					// 	colCluster[col][clusterKeys[col][r[0][1]].i].money += m
					// 	colCluster[col][clusterKeys[col][r[0][1]].i].years[y-yearRange[0]].money += m
					// 	colCluster[col][clusterKeys[col][r[0][1]].i].years[y-yearRange[0]].count++
					// 	if(v in clusterKeys[col]){
					// 		clusterKeys[col][v].values.push(v)
					// 		clusterKeys[col][v].c++
					// 	}else{
					// 		tests[col].push(v)
					// 		clusterKeys[col][v] = {i:clusterKeys[col][r[0][1]].i,values:[v], c:1}
					// 	}

					// }else{
						//tests[col].push(v)

						colCluster[col].push({
							key:v,
							count:1,
							money:m,
							years:[]
						})

						clusterKeys[col][v] = {i:colCluster[col].length-1, values:[v], c:1}
						for(var year = 0; year <= yearRange[1]-yearRange[0]; year++){
							colCluster[col][clusterKeys[col][v].i].years.push({count:0,money:0})
						}

						colCluster[col][clusterKeys[col][v].i].years[y-yearRange[0]].money += m
						colCluster[col][clusterKeys[col][v].i].years[y-yearRange[0]].count++
					//}
				}
			}
		})
	})

	cols.forEach(c=>{
		fs.writeFileSync('../data/columns/'+c+''+extension+'.json', JSON.stringify(colCluster[c].sort(function(a,b){
			if(a.key < b.key){
				return 1
			}else if(a.key > b.key){
				return -1
			}
			return 0
		})), 'utf8')
	})

	fs.writeFileSync('../data/temp/clusterKeys'+extension+'.json', JSON.stringify(clusterKeys), 'utf8')

	
	//NEXT
	shrinkData()
}

/* --------- shrink.js --------- */


function shrinkData(){
	let json = JSON.parse(fs.readFileSync('../data/temp/clusterKeys'+extension+'.json', 'utf8')),
		csv = dsvParse.parse(fs.readFileSync('../data/temp/all_clean_w_plz'+extension+'.csv', 'utf8'))


	let keep = ['jahr','geber','politikbereich','betrag','plz','name','zweck',"empfaengertyp","empfaengerid"]

	let ncsv = ''

	keep.forEach((k,i)=>{
		if(i>0) ncsv += ','
		ncsv += k

		if(k in json){
			//sorting the clusterKey
			var keys = []
			for(var label in json[k]){
				keys.push(label)
			}
			keys.sort()
			keys.forEach((key,id)=>{
				json[k][key].i = ((id<10)?'0':'')+id
			})

			var tcsv = 'id,label'
			for(var label in json[k]){
				tcsv += '\n'
				tcsv += json[k][label].i+','
				if(label.indexOf(',')>-1){
					tcsv += '"'
				}
				tcsv += label
				if(label.indexOf(',')>-1){
					tcsv += '"'
				}
			}
			fs.writeFileSync('../data/dict_'+k+''+extension+'.csv', tcsv, 'utf8')
		}
	})

	csv.forEach(c=>{
		ncsv += '\n'
		keep.forEach((k,i)=>{
			if(i>0) ncsv += ','

			if((k in json) && c[k] != '' && c[k] != undefined){
				ncsv += json[k][c[k]].i
			}else{
				ncsv += c[k]
			}
		})
	})

	fs.writeFileSync('../data/min'+extension+'.csv', ncsv, 'utf8')
}
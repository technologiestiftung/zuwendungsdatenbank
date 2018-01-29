let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';'),
	//TODO: test against fuzzy
	strSim = require('string-similarity'),
	fuzzy = require('fuzzyset.js')

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

	return str
}

let merges = 0, yearRange = [2009,2016], merger = {geber:[
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

function cleanData(fileName){
	cleanCSV = []

	new Promise(function(resolve, reject){
	    fs.readFile(fileName, 'utf8', (err, data) => {
	        err ? reject(err) : resolve(data);
	    });
	}).then(data => {
		let csv = dsvParse.parse(data)

		var cols = ["geber","art","politikbereich","city","plz","empfaengerid"], //name
			tests = {},
			colCluster = {},
			clusterKeys = {}
		cols.forEach(col => {
			tests[col] = []
			colCluster[col] = []
			clusterKeys[col] = {}
		})

		csv.forEach((c,ci) => {
			console.log(ci,csv.length)

			let m = parseInt(c.betrag)
				if(isNaN(m)){
					m = 0
				}
			let y = parseInt(c.jahr)
				if(isNaN(y)){
					y = 0
				}
			cols.forEach(col => {
				let v = cleanCol(c[col])
				//console.log(col,v)
				if(v != undefined){

					if(v in clusterKeys[col]){
						clusterKeys[col][v].c++
						colCluster[col][clusterKeys[col][v].i].count++
						colCluster[col][clusterKeys[col][v].i].money += m
						colCluster[col][clusterKeys[col][v].i].years[y-yearRange[0]].money += m
						colCluster[col][clusterKeys[col][v].i].years[y-yearRange[0]].count++
					}else{

						let f = null, r = false

						if(col != 'plz' && col != 'empfaengerid'){
							f = fuzzy(tests[col])
							r = f.get(v)
						}

						if(r && r[0][0] > 0.8){
							merges++

							let match1 = data.match(new RegExp(cleanRegEx(v), 'g')),
								match2 = data.match(new RegExp(cleanRegEx(r[0][1]), 'g'))

							if(match1 > match2){
								colCluster[col][clusterKeys[col][r[0][1]].i].key = v
							}

							colCluster[col][clusterKeys[col][r[0][1]].i].count++
							colCluster[col][clusterKeys[col][r[0][1]].i].money += m
							colCluster[col][clusterKeys[col][r[0][1]].i].years[y-yearRange[0]].money += m
							colCluster[col][clusterKeys[col][r[0][1]].i].years[y-yearRange[0]].count++
							if(v in clusterKeys[col]){
								clusterKeys[col][v].values.push(v)
								clusterKeys[col][v].c++
							}else{
								tests[col].push(v)
								clusterKeys[col][v] = {i:clusterKeys[col][r[0][1]].i,values:[v], c:1}
							}

						}else{
							tests[col].push(v)

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
						}
					}
				}
			})
		})



		cols.forEach(c=>{
			fs.writeFileSync('data/columns/'+c+'.json', JSON.stringify(colCluster[c].sort(function(a,b){
				if(a.key < b.key){
					return 1
				}else if(a.key > b.key){
					return -1
				}
				return 0
			})), 'utf8')
		})

		fs.writeFileSync('data/clusterKeys.json', JSON.stringify(clusterKeys), 'utf8')

		console.log('Merges', merges)

	}, error => console.log(error)).catch(err => {
		console.log(err)
	})
}

cleanData('data/all_clean_excel_w_plz.csv')
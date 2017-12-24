let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';'),
	//TODO: test against fuzzy
	strSim = require('string-similarity'),
	fuzzy = require('fuzzyset.js')

function cleanCol(str){
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

	return str
}

let merges = 0, yearRange = [2009,2016], merger = [
	['Senatsverwaltung für Justiz','Senatsverwaltung für Justiz und Verbraucherschutz'],
	['Senatsverwaltung für Stadtentwicklung und Umwelt','Senatsverwaltung für Stadtentwicklung','Senatsverwaltung für Gesundheit, Umwelt und Verbraucherschutz'],
	['Senatsverwaltung für Wirtschaft, Technologie und Forschung','Senatsverwaltung für Wirtschaft, Technologie und Frauen'],
	['Senatsverwaltung für Bildung, Jugend und Wissenschaft','Senatsverwaltung für Bildung, Wissenschaft und Forschung'],
	['Senatsverwaltung für Gesundheit und Soziales','Senatsverwaltung für Gesundheit, Umwelt und Verbraucherschutz'],
	['Senatsverwaltung für Integration, Arbeit und Soziales','Senatsverwaltung für Arbeit, Integration und Frauen']
]

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

		var cols = ["geber","art","politikbereich","name"],
			tests = {},
			colCluster = {},
			clusterKeys = {}
		cols.forEach(col => {
			tests[col] = []
			colCluster[col] = []
			clusterKeys[col] = {}
		})

		csv.forEach(c => {
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
				console.log(col,v)

				if(v in clusterKeys[col]){
					colCluster[col][clusterKeys[col][v]].count++
					colCluster[col][clusterKeys[col][v]].money += m
					colCluster[col][clusterKeys[col][v]].years[y-yearRange[0]].money += m
					colCluster[col][clusterKeys[col][v]].years[y-yearRange[0]].count++
				}else{

					let f = fuzzy(tests[col]),
						r = f.get(v)

					if(r && r[0][0] > 0.9){
						merges++

						let match1 = data.match(new RegExp(cleanRegEx(v), 'g')),
							match2 = data.match(new RegExp(cleanRegEx(r[0][1]), 'g'))

						if(match1 > match2){
							colCluster[col][clusterKeys[col][r[0][1]]].key = v
						}

						colCluster[col][clusterKeys[col][r[0][1]]].count++
						colCluster[col][clusterKeys[col][r[0][1]]].money += m
						colCluster[col][clusterKeys[col][r[0][1]]].years[y-yearRange[0]].money += m
						colCluster[col][clusterKeys[col][r[0][1]]].years[y-yearRange[0]].count++
						clusterKeys[col][v] = clusterKeys[col][r[0][1]]

					}else{
						tests[col].push(v)

						colCluster[col].push({
							key:v,
							count:1,
							money:m,
							years:[]
						})

						clusterKeys[col][v] = colCluster[col].length-1
						for(var year = 0; year <= yearRange[1]-yearRange[0]; year++){
							colCluster[col][clusterKeys[col][v]].years.push({count:0,money:0})
						}

						colCluster[col][clusterKeys[col][v]].years[y-yearRange[0]].money += m
						colCluster[col][clusterKeys[col][v]].years[y-yearRange[0]].count++
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

		console.log('Merges', merges)

	}, error => console.log(error)).catch(err => {
		console.log(err)
	})
}

cleanData('data/all_clean_excel.csv')
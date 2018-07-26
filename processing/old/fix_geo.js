let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';')

let funding = dsvParse.parse(fs.readFileSync('./data/all_clean_excel.csv', 'utf8')),
	lines = (fs.readFileSync('./data/all_clean_excel_w_geo.csv', 'utf8')).split('\n'),
	data = [], data_keys = {}


funding.forEach((f,fi)=>{
	for(var key in f){
		if(key.trim() == 'id'){
			funding[fi]['id'] = f[key]
		}
	}
})


lines.forEach(l=>{
	data.push(l.split(','))
})

data.forEach(d=>{
	data_keys[d[0]] = {lat:d[d.length-2],lng:d[d.length-1]}
})




let cols1 = ['id','name','geber','art','jahr','anschrift','politikbereich','zweck','betrag','empfaengerid'],
	cols2 = ['lat','lng'],
	csv = ''

cols1.forEach((c,ci)=> {
	let has = false
	if(c.indexOf(',')>=0){ 
		has = true
	}

	csv += ((ci>0)?',':'')+((has)?'"':'')+c+((has)?'"':'')
})

cols2.forEach((c,ci)=> csv += ','+c )

funding.forEach(f=>{
	csv += '\n'
	cols1.forEach((c,ci)=> {
		let has = false
		if(f[c].indexOf(',')>=0){ 
			has = true
		}

		csv += ((ci>0)?',':'')+((has)?'"':'')+f[c]+((has)?'"':'')
	})
	cols2.forEach((c,ci)=> csv += ','+data_keys[f.id][c])
})

fs.writeFileSync('./data/all_clean_excel_w_geo_fixed.csv', csv, 'utf8')

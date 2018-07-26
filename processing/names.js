const fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';')

let csv = dsvParse.parse(fs.readFileSync('../data/all_clean_excel_w_plz.csv', 'utf8'))

let groups = {}

csv.forEach(c=>{
	if(c.empfaengerid != 'undefined'){
		c.empfaengerid = c.empfaengerid.trim()
		c.empfaengerid = c.empfaengerid.split(' ').join('')
		if(!(c.empfaengerid in groups)){
			groups[c.empfaengerid] = {}
		}
		if(!(c.name in groups[c.empfaengerid])){
			groups[c.empfaengerid][c.name] = 0
		}
		groups[c.empfaengerid][c.name] += 1
	}
})

fs.writeFileSync('../data/name_groups.json', JSON.stringify(groups), 'utf8')
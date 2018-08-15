/* --------- PIPELINE --------- */

const extension_1 = '-2017-ckan',
	  extension_2 = ''

let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';'),
	yearRange = [2009,2017]

/* --------- postcode.js --------- */

let newData = csv = dsvParse.parse(fs.readFileSync('../data/temp/all_clean'+extension_1+'-excel.csv', 'utf8')),
	oldData = csv = dsvParse.parse(fs.readFileSync('../data/temp/all_clean'+extension_2+'_excel.csv', 'utf8'))

let newYears = [],
	cols = newData.columns

newData.forEach(d=>{
	for(let key in d){
		if(key.trim() != key){
			d[key.trim()] = d[key]
			delete d[key]
		}
	}
	d[cols[0].trim()] = parseInt(d[cols[0].trim()])
	if(newYears.indexOf(d.jahr)==-1) newYears.push(d.jahr)
})

let max_id = d3.max(newData, d=>d[cols[0].trim()])

oldData.forEach(d=>{
	for(let key in d){
		if(key.trim() != key){
			d[key.trim()] = d[key]
			delete d[key]
		}
	}

	max_id++
	d[cols[0].trim()] = max_id

	if(newYears.indexOf(d.jahr)==-1) newData.push(d)
})

let output = cols.join(';')

newData.forEach((d,i)=>{
	output += '\n'
	cols.forEach((c,ci)=>{
		c = c.trim()
		if(ci>0) output += ';'
		if(isNaN(d[c]) && d[c].indexOf(';')>-1) output += '"'
		output += d[c]
		if(isNaN(d[c]) && d[c].indexOf(';')>-1) output += '"'
	})
})

fs.writeFileSync('../data/temp/all_clean_merge'+extension_1+'-excel.csv', output, 'utf8')

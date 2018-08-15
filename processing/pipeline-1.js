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

/* --------- clean.js --------- */

function cleanData(){

	function filterInt (value) {
	  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
	    return Number(value);
	  return NaN;
	}

	function cleanStr(csv){
		let a = [
			['  ',' '],
			['"""','"\''],
			['""','\''],
			['\'\'','\''],
			[' "','"'],
			['" ','"']
		]
		
		a.forEach(a=>{
			while(csv.indexOf(a[0])>=0){
				csv = csv.split(a[0]).join(a[1])
			}
		})

		csv.replace(/[^\x00-\x7F]/g, "");

		return csv;
	}

	let cleanCSV = []

	let data = fs.readFileSync('../data/all'+extension+'.csv', 'utf8')

    let lines = data.split(/\r\n|\n|\r/)

	lines.forEach((l,li)=>{

		let good = false;
		if(l.indexOf('"')==0 && l.indexOf(';') != 1){
			let cols = l.split(";")
			let n = filterInt(cols[0].split('"').join(''))
			if(!isNaN(n)){
				good = true
			}
		}
		if(good || li == 0){
			cleanCSV.push(l)
		}else{
			cleanCSV[cleanCSV.length-1] += ' ' + l
		}
	})

	let clean = '';
	cleanCSV.forEach((cl,cli) => {
		if(cli > 0){
			clean += '\n'
		}
		clean += cl
	})

	fs.writeFileSync('../data/temp/all_clean'+extension+'.csv', cleanStr(clean), 'utf8')

}

cleanData();
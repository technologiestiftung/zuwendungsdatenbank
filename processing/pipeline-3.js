/* Create CSV for Fabians visualizations */

/* --------- PIPELINE --------- */

const extension = '-2017-ckan'

let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';'),
	yearRange = [2009,2017]

let data = fs.readFileSync('../data/temp/all_clean_merge'+extension+'-excel.csv', 'utf8'),
	csv = dsvParse.parse(data)

let politikbereich = {}

let def = [], years = []

for(let i = yearRange[0]; i<=yearRange[1]; i++){
	years.push({
		count:0,
		money:0
	})
	def.push({
		count:0,
		money:0,
		moneyShare:0,
		countShare:0
	})
}

csv.forEach(c=>{
	if(!(c.politikbereich in politikbereich)) politikbereich[c.politikbereich] = {target:c.politikbereich, count:0, money:0, years:JSON.parse(JSON.stringify(def))}
	politikbereich[c.politikbereich].count++
	politikbereich[c.politikbereich].money += parseInt(c.betrag)
	politikbereich[c.politikbereich].years[parseInt(c.jahr)-yearRange[0]].count++
	politikbereich[c.politikbereich].years[parseInt(c.jahr)-yearRange[0]].money += parseInt(c.betrag)
	years[parseInt(c.jahr)-yearRange[0]].count++
	years[parseInt(c.jahr)-yearRange[0]].money += parseInt(c.betrag)
})

let array = []

for(let key in politikbereich){
	if(key != "'"){
		politikbereich[key].years.forEach((y,yi)=>{
			let digit = 2
			let countShare = parseFloat((y.count / years[yi].count * 100).toFixed(digit))
			let moneyShare = parseFloat((y.money / years[yi].money * 100).toFixed(digit))

			while(moneyShare == 0 && y.money > 0){
				digit++
				moneyShare = parseFloat((y.money / years[yi].money * 100).toFixed(digit))
			}

			digit = 2

			while(countShare == 0 && y.count > 0){
				digit++
				countShare = parseFloat((y.count / years[yi].count * 100).toFixed(digit))
			}

			y.countShare = countShare
			y.moneyShare = moneyShare
		})

		array.push(politikbereich[key])
	}
}

array.sort((a,b)=>b.money-a.money)

fs.writeFileSync('../data/lab-site.json', JSON.stringify(array), 'utf8')
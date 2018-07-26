let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';'),
	config = require('./config.json'),
	googleMapsClient = require('@google/maps').createClient({
		key: config.api_key,
		Promise: Promise
	})

let funding = dsvParse.parse(fs.readFileSync('./data/all_clean_excel.csv', 'utf8')),
	anschriften = {}

function activate(id) {
  	this.id = id;

  	for(var key in funding[this.id]){
  		if(key.trim() == 'id'){
  			funding[this.id]['id'] = funding[this.id][key]
  		}
  	}

  	if(funding[this.id].anschrift in anschriften){
  		funding[this.id]['lat'] = anschriften[funding[this.id].anschrift].lat
		funding[this.id]['lng'] = anschriften[funding[this.id].anschrift].lng
		console.log(this.id, funding.length, 'same')
  		return Promise.resolve()
  	}else{
	  	return googleMapsClient.geocode({
			  address: funding[this.id].anschrift
			})
			.asPromise()
			.then(response => {
				if(response.json.status != 'ZERO_RESULTS'){
					console.log(this.id, funding.length, response.json.results[0].geometry.location.lat, response.json.results[0].geometry.location.lng)
					anschriften[funding[this.id].anschrift] = response.json.results[0].geometry.location
					funding[this.id]['lat'] = response.json.results[0].geometry.location.lat
					funding[this.id]['lng'] = response.json.results[0].geometry.location.lng
				}else{
					console.log(this.id, funding.length, 'ZERO_RESULTS')
				}
			})
			.catch(err => console.log(err))
	}
}

let chain = Promise.resolve()
funding.forEach((f,fi)=>{
	chain = chain.then(()=>activate(fi))
})

chain.then(() => {

	let cols = ['id','name','geber','art','jahr','anschrift','politikbereich','zweck','betrag','empfaengerid','lat','lng'],
		csv = ''

	cols.forEach((c,ci)=> csv += ((ci>0)?',':'')+'"'+c+'"')

	funding.forEach(f=>{
		csv += '\n'
		cols.forEach((c,ci)=> csv += ((ci>0)?',':'')+'"'+f[c]+'"')
	})

	fs.writeFileSync('./data/all_clean_excel_w_geo.csv', csv, 'utf8')

})


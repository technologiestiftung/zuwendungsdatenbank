let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';'),
	postcode = require('./data/plz.json'),
	yearRange = [2009,2016]

new Promise(function(resolve, reject){
	    fs.readFile('data/all_clean_excel.csv', 'utf8', (err, data) => {
	        err ? reject(err) : resolve(data);
	    });
	}).then(data => {
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

		let p_regex = new RegExp(/(\d){5}/, 'g')

		var external = [], external_keys = {}

		csv.forEach(function(d){
			let plz = d.anschrift.match(p_regex),
				money = parseInt(d.betrag),
				year = parseInt(d.jahr) - yearRange[0]

			if(plz != null){
				code = parseInt(plz[0])

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
			}

		})

		fs.writeFileSync('data/plz_w_data.geojson', JSON.stringify(postcode), 'utf8')
		fs.writeFileSync('data/plz_external.json', JSON.stringify(external), 'utf8')
	}, error => console.log(error)).catch(err => {
		console.log(err)
	})
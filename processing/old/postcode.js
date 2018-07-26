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
		let p_regex = new RegExp(/\, (\d){5}/, 'g'),
			sp_regex = new RegExp(/(\d){4}/, 'g')

		var external = [], external_keys = {}

		csv.forEach(function(d,i){
			let plz = d.anschrift.match(p_regex),
				money = parseInt(d.betrag),
				year = parseInt(d.jahr) - yearRange[0]

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

		fs.writeFileSync('data/plz_w_data.geojson', JSON.stringify(postcode), 'utf8')
		fs.writeFileSync('data/plz_external.json', JSON.stringify(external), 'utf8')

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

		fs.writeFileSync('data/all_clean_excel_w_plz.csv', ncsv, 'utf8')

	}, error => console.log(error)).catch(err => {
		console.log(err)
	})
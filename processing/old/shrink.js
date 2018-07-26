let fs = require('fs'),
	d3 = require('d3'),
	dsvParse = d3.dsvFormat(';')

let json = JSON.parse(fs.readFileSync('data/clusterKeys.json', 'utf8')),
	csv = dsvParse.parse(fs.readFileSync('data/all_clean_excel_w_plz.csv', 'utf8'))


let keep = ['jahr','geber','politikbereich','betrag','plz','name','zweck']

let ncsv = ''

keep.forEach((k,i)=>{
	if(i>0) ncsv += ','
	ncsv += k

	if(k in json){
		//sorting the clusterKey
		var keys = []
		for(var label in json[k]){
			keys.push(label)
		}
		keys.sort()
		keys.forEach((key,id)=>{
			json[k][key].i = ((id<10)?'0':'')+id
		})

		var tcsv = 'id,label'
		for(var label in json[k]){
			tcsv += '\n'
			tcsv += json[k][label].i+','
			if(label.indexOf(',')>-1){
				tcsv += '"'
			}
			tcsv += label
			if(label.indexOf(',')>-1){
				tcsv += '"'
			}
		}
		fs.writeFileSync('data/dict_'+k+'.csv', tcsv, 'utf8')
	}
})

csv.forEach(c=>{
	ncsv += '\n'
	keep.forEach((k,i)=>{
		if(i>0) ncsv += ','

		if(k in json){
			ncsv += json[k][c[k]].i
		}else{
			ncsv += c[k]
		}
	})
})

fs.writeFileSync('data/min.csv', ncsv, 'utf8')
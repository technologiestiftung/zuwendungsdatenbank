let d3 = require('d3'),
	proj = require('proj4'),
	fs = require('fs'),
	http = require('http')

let proj1 = '+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999600 +x_0=33500000 +y_0=0 +ellps=GRS80 +units=m +no_defs towgs84=0,0,0',
	proj2 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'

let dsvParse = d3.dsvFormat(';')

let oData = dsvParse.parse(fs.readFileSync('data/HKO_2017_EPSG5650.txt', 'utf8'))
let data = d3.csvParse(fs.readFileSync('data/codings.csv', 'utf8'))

function convertNumber(str){
	return parseFloat(str.replace(',','.'))
}

function saveData(){
	let csv = '', keys = []
	for(var key in data[0]){
		if(csv != ''){
			csv += ','
		}
		csv += key
		keys.push(key)
	}

	data.forEach(d=>{
		csv += '\n'
		keys.forEach((k,ki)=>{
			if(ki > 0){
				csv += ','
			}
			csv += d[k]
		})
	})

	fs.writeFileSync('data/codings-convert.csv', csv, 'utf8')
	console.log('DONE');
}

oData.forEach(function(d,i){
	let coord = proj(proj1, proj2, [convertNumber(d.LON), convertNumber(d.LAT)])
	data[i].LON = coord[0];
	data[i].LAT = coord[1];

	(['NBA','OI','QUA','LAN','RBZ','KRS','GMD','OTT','SSS','HNR','ADZ','LONco','LATco','STN','ONM','ZON','POT','PSN','AUD','error']).forEach(c=>{
		delete data[i][c]
	})
})

oData = null

saveData()

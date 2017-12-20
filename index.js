let d3 = require('d3'),
	proj = require('proj4'),
	fs = require('fs'),
	http = require('http')

let proj1 = '+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999600 +x_0=33500000 +y_0=0 +ellps=GRS80 +units=m +no_defs towgs84=0,0,0',
	proj2 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'

let dsvParse = d3.dsvFormat(';')

let data = dsvParse.parse(fs.readFileSync('data/HKO_2017_EPSG5650.txt', 'utf8'))

let coord = proj(proj1, proj2, [convertNumber(data[0].LON), convertNumber(data[0].LAT)])

function getFunding(id){
	http.get('http://www.businesslocationcenter.de/foerdergebiete/2014/suche?format=json&street='+encodeURI(data[id].STN)+'&number='+data[id].HNR+'&zipcode='+data[id].PLZ, (res) => {
	  const { statusCode } = res;
	  const contentType = res.headers['content-type'];

	  let error;
	  if (statusCode !== 200) {
	    error = new Error('Request Failed.\n' +
	                      `Status Code: ${statusCode}`);
	  } else if (!/^application\/json/.test(contentType)) {
	    error = new Error('Invalid content-type.\n' +
	                      `Expected application/json but received ${contentType}`);
	  }
	  if (error) {
	  	data[id]['error'] = '"'+error.message+'"';
	    console.error(error.message);
	    nextFunding(id)
	    // consume response data to free up memory
	    res.resume();
	    return;
	  }

	  res.setEncoding('utf8');
	  let rawData = '';
	  res.on('data', (chunk) => { rawData += chunk; });
	  res.on('end', () => {
	    try {
	      const parsedData = JSON.parse(rawData);
	      data[id]['fundingArea'] = parsedData[0].fundingArea;
	      data[id]['error'] = 0
	      console.log('get '+id)
	      nextFunding(id)
	    } catch (e) {
	    	data[id]['error'] = '"'+e.message+'"';
	      console.error(e.message);
	      nextFunding(id)
	    }
	  });
	}).on('error', (e) => {
		data[id]['error'] = '"'+e.message+'"';
	  	console.error(`Got error: ${e.message}`);
	  	nextFunding(id)
	});
}

function nextFunding(id){
	id++;
	if(id < data.length){
		setTimeout(function(){getFunding(id)}, 500)
	}else{
		saveData();
	}
}

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

	fs.writeFileSync('data/output.csv', csv, 'utf8')

	console.log('DONE');
}

getFunding(0)
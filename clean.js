let fs = require('fs')

let cleanCSV = []

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

	return csv;
}

function cleanData(fileName){
	cleanCSV = []

	new Promise(function(resolve, reject){
	    fs.readFile(fileName, 'utf8', (err, data) => {
	        err ? reject(err) : resolve(data);
	    });
	}).then(data => {
		return new Promise((resolve, reject) => {
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

			fs.writeFileSync('data/all_clean.csv', cleanStr(clean), 'utf8')

			resolve(true)
		})
	}, error => console.log(error)).then(result => {
		console.log('done')
	}, error => console.log(error)).catch(err => {
		console.log(err)
	})
}

cleanData('data/all.csv');
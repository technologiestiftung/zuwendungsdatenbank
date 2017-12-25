let fs = require('fs'),
	names = require('./data/columns/name.json'),
	json = []

names.forEach(n=>{
	if(n.count > 1){
		json.push(n)
	}
})

fs.writeFileSync('./data/columns/name_filtered.json', JSON.stringify(json), 'utf8')
let fs = require('fs'),
	d3 = require('d3')

let cluster = JSON.parse(fs.readFileSync('data/clusterKeys.json', 'utf8')),
	clusters = {},
	limit = 0,
	letters = ('abcdefghijklmnopqrstuvwxyz0123456789').split()

for(let key in cluster){
	clusters[key] = {},
	i = 0
	for(let kkey in cluster[key]){
		if(!(cluster[key][kkey].i in clusters[key])){
			clusters[key][cluster[key][kkey].i] = {
				c:0,
				values:[]
			}
		}
		clusters[key][cluster[key][kkey].i].c += cluster[key][kkey].c
		clusters[key][cluster[key][kkey].i].values.push({key:cluster[key][kkey].values[0], c:cluster[key][kkey].c})
	}

	let temp = []
	for(let kkey in clusters[key]){
		let max = -Number.MAX_VALUE,
			tkey = ''
		clusters[key][kkey].values.forEach(v=>{
			if(v.c > max){
				max = v.c
				tkey = v.key
			}
		})
		clusters[key][kkey]['id'] = i
		i++
		clusters[key][kkey]['key'] = tkey
		temp.push(clusters[key][kkey])
	}
	clusters[key] = temp
}

fs.writeFileSync('data/dict.json', JSON.stringify(clusters), 'utf8')
let fs = require('fs'),
	d3 = require('d3')
	swords = require('stopwords-de')

let fundings = d3.csvParse(fs.readFileSync('./data/min.csv', 'utf8')),
	zwecks = JSON.parse(fs.readFileSync('./data/dict_zweck.json', 'utf8')),
	zweck_keys = {}

zwecks.forEach((z,zi)=>{
	zwecks[zi]['count'] = 0

	let removes = [',','.','"',"'"]
	removes.forEach(r=>{
		zwecks[zi].label = zwecks[zi].label.split(r).join()
	})

	zwecks[zi]['parts']	= zwecks[zi].label.split(' ')

	zweck_keys[z.id] = zi
})

fundings.forEach(f=>{
	zwecks[zweck_keys[f.zweck]].count++
})

let parts = [], part_keys = {}
zwecks.forEach(z=>{
	z.parts.forEach(p=>{
		if(!(p in part_keys)){
			parts.push({
				part : p,
				count: 0
			})
			part_keys[p] = parts.length-1
		}
		parts[part_keys[p]].count += z.count
	})
})

let cleaned_parts = [], cleaned = 0
parts.forEach(p=>{
	if(!(p.part in swords)){
		cleaned_parts.push(p)
	}else{
		cleaned++
	}
})

console.log('cleaned',cleaned)

cleaned_parts.sort((a,b)=>{
	return a.sort-b.sort
})

let csv = 'label,count'
cleaned_parts.forEach(c=>{
	csv += '\n'+c.part+','+c.count
})


fs.writeFileSync('./data/tagcloud.csv', csv, 'utf8')
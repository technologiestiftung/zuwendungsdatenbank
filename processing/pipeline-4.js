const file_key = '-2017-ckan'

const fs = require('fs')
const d3 = require('d3')
const dsvParse = d3.dsvFormat(',')

let berlin = JSON.parse(fs.readFileSync('../data/plz.json', 'utf8'))

let berlin_plz = []

berlin.features.forEach(f=>{
	berlin_plz.push(f.properties.PLZ99_N)
	for(let key in f.properties){
		if(key != 'PLZ99') delete f.properties[key]
	}
})

let plz_dict = dsvParse.parse(fs.readFileSync('../data/dict_plz'+file_key+'.csv', 'utf8'))
let plz_keys = {}, plz_keys_a = []

plz_dict.forEach((p,pi)=>{
	plz_keys[p.id] = pi
	plz_keys_a.push(p.id)
})

let max = d3.max(plz_keys_a)

const new_id = max+1

plz_dict.push({
	id:new_id,
	label:9999999
})

berlin.features.push({
  "type": "Feature",
  "properties": {
    "PLZ99": "9999999"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          13.59832763671875,
          52.60054532499603
        ],
        [
          13.616867065429688,
          52.60054532499603
        ],
        [
          13.616867065429688,
          52.61201260795977
        ],
        [
          13.59832763671875,
          52.61201260795977
        ],
        [
          13.59832763671875,
          52.60054532499603
        ]
      ]
    ]
  }
})

plz_keys[new_id] = plz_keys.length
plz_keys_a.push(new_id)

let data = dsvParse.parse(fs.readFileSync('../data/min'+file_key+'.csv', 'utf8'))

let deleteThis = []

data.forEach(d=>{
	if(berlin_plz.indexOf(parseInt(plz_dict[plz_keys[d.plz]].label))==-1){
		if(deleteThis.indexOf(plz_dict[plz_keys[d.plz]].label) == -1) deleteThis.push(plz_dict[plz_keys[d.plz]].label)
		d.plz = new_id
	}
})

let data_csv = data.columns.join(',')

data.forEach(d=>{
	let cols = []
	data.columns.forEach(c=>{
		cols.push(d[c])
	})
	data_csv += '\n' + cols.join(',')
})

fs.writeFileSync('../data/min'+file_key+'-cl.csv', data_csv, 'utf8')

//remove useless postcodes

for(let i = plz_dict.length-1; i>=0; i--){
	if(deleteThis.indexOf(plz_dict[i].label)>-1){
		plz_dict.splice(i,1)
	}
}

let dict_csv = 'id,label'

plz_dict.forEach(p=>{
	dict_csv += `\n${p.id},${p.label}`
})

fs.writeFileSync('../data/dict_plz'+file_key+'-cl.csv', dict_csv, 'utf8')

fs.writeFileSync('../data/plz-cl.json', JSON.stringify(berlin), 'utf8')

//const { exec } = require('child_process');
// exec('topo2geo ../data/plz-cl.json > ../data/plz-cl.topojson', (err, stdout, stderr) => {
//   if (err) console.log(err)

//   // the *entire* stdout and stderr (buffered)
//   console.log(`stdout: ${stdout}`);
//   console.log(`stderr: ${stderr}`);

//   console.log('done')

//   process.exit();
// });
const fs = require('fs')
const { config } = require('process')
const configFile = require('./config.json')

// list all directories in the directory servapps and compile them in servapps.json

const servapps = fs.readdirSync('./servapps').filter(file => fs.lstatSync(`./servapps/${file}`).isDirectory())

let servappsJSON = []

for (const file of servapps) {
  const servapp = require(`./servapps/${file}/description.json`)
  servapp.id = file
  servapp.screenshots = [];
  servapp.artefacts = {};

  // list all screenshots in the directory servapps/${file}/screenshots
  const screenshots = fs.readdirSync(`./servapps/${file}/screenshots`)
  for (const screenshot of screenshots) {
    servapp.screenshots.push(`https://aseracorp.github.io/resiSTORE/servapps/${file}/screenshots/${screenshot}`)
  }

  if(fs.existsSync(`./servapps/${file}/artefacts`)) {
    const artefacts = fs.readdirSync(`./servapps/${file}/artefacts`)
    for(const artefact of artefacts) {
      servapp.artefacts[artefact] = (`https://aseracorp.github.io/resiSTORE/servapps/${file}/artefacts/${artefact}`)
    }
  }

  servapp.icon = `https://aseracorp.github.io/resiSTORE/servapps/${file}/icon.png`
  //Common Format,used by most
  const YMLComposeSource =  `https://aseracorp.github.io/resiSTORE/servapps/${file}/docker-compose.yml`;
  if(fs.existsSync(`./servapps/${file}/docker-compose.yml`)) {
    servapp.compose = YMLComposeSource;
  }
  //Cosmos Legacy Format
  const CosmosComposeSource =  `https://aseracorp.github.io/resiSTORE/servapps/${file}/cosmos-compose.json`; 
  if(fs.existsSync(`./servapps/${file}/cosmos-compose.json`)) {
    servapp.compose = CosmosComposeSource;
    }

  servappsJSON.push(servapp)
}

// add showcase
const _sc = ["Home Assistant", "Node-RED", "openPLC"];
const showcases = servappsJSON.filter((app) => _sc.includes(app.name));

let apps = {
  "source": configFile.url,
  "showcase": showcases,
  "all": servappsJSON
}

fs.writeFileSync('./servapps.json', JSON.stringify(servappsJSON, null, 2))
fs.writeFileSync('./index.json', JSON.stringify(apps, null, 2))

for (const servapp of servappsJSON) {
  servapp.compose = `http://localhost:3000/servapps/${servapp.id}/cosmos-compose.json`
  servapp.icon = `http://localhost:3000/servapps/${servapp.id}/icon.png`
  for (let i = 0; i < servapp.screenshots.length; i++) {
    servapp.screenshots[i] = servapp.screenshots[i].replace('https://aseracorp.github.io/resiSTORE', 'http://localhost:3000')
  }
  for (const artefact in servapp.artefacts) {
    servapp.artefacts[artefact] = servapp.artefacts[artefact].replace('https://aseracorp.github.io/resiSTORE', 'http://localhost:3000')
  }
}

fs.writeFileSync('./servapps_test.json', JSON.stringify(apps, null, 2))

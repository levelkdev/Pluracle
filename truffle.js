module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    kovan: getKovanConfig(),
    kovan_infura: getInfuraConfig('kovan', 42),
    ropsten_infura: getInfuraConfig('ropsten', 3)
  }
};

function getInfuraConfig (networkName, networkId) {
  var HDWalletProvider = require('truffle-hdwallet-provider')
  var secrets = {}
  try {
    secrets = require('./secrets.json')
  } catch (err) {
    console.log('could not find ./secrets.json')
  }

  return {
    network_id: networkId,
    provider: () => {
      return new HDWalletProvider(secrets.mnemonic, `https://${networkName}.infura.io/` + secrets.infura_apikey)
    },
    gas: 4600000
  }
}

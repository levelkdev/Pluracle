/* globals artifacts web3 */

require('babel-polyfill')
require('babel-register')

const config = require('../config.json')
const request = require('request');
const moment = require('moment')

const MakerSignedOracle = artifacts.require('MakerSignedOracle')

const OtherWeb3 = require('web3');
const otherWeb3 = new OtherWeb3('http://localhost:8545');

module.exports = async (callback) => {
  updatePriceOracle()

  function updatePriceOracle() {
    web3.eth.getAccounts((err, accounts) => {

      request('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', { json: true }, (err, res, body) => {
        if (err) { return console.log(err) }

        const makerSignedOracle = MakerSignedOracle.at("0xb2b27ce17a1f1f52ab8b7470577a396388e914ff")
        const now = moment().subtract(1, "minutes").unix()
        const price = res.body.USD
        let data = web3.toWei(price)
        console.log("Updating price: " + price + ", data: " + data)
        const message = otherWeb3.utils.soliditySha3({type: 'uint256', value: data}, {type: 'uint256', value: now});
        const signedMessage = otherWeb3.eth.accounts.sign(message, "0x46a059700a7077b8c530809c85168b16d1774678d94ceedf9872365e85ca5de1")
        makerSignedOracle.update(data, now, signedMessage.signature).then((tx) => {
          console.log("tx: " + tx.tx)
          setTimeout(updatePriceOracle, 60000);
        }).catch((err) => {
          console.error(err)
        })
      })
    })
  }
}

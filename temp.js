const { readFileSync, writeFileSync } = require('fs')
const { utils } = require('ethers')

const main = async () => {
    address = JSON.parse(readFileSync('./alert-system/token-address.json', encoding='utf-8'))
    console.log(utils.getAddress(address[1][0][1]))
}

main()
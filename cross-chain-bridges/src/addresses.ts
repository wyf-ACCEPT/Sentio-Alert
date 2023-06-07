export const MultichainMap: { [index: number]: [string[], [string, string, number][]] } = {
  1: [    // Ethereum
    [
      "0x6b7a87899490ece95443e979ca9485cbe7e71522",
      "0x765277eebeca2e31912c9946eae1021199b39c61",
      "0xba8da9dcf11b50b03fd5284f164ef5cdef910705"
    ], [
      ["ETH", "0x0615dbba33fe61a31c7ed131bda6655ed76748b1", 18],   // anyETH
      ["USDC", "0x7ea2be2df7ba6e54b1a9c70676f668455e329d29", 6],   // anyUSDC
      ["USDT", "0x22648c12acd87912ea1710357b1302c6a4154ebc", 6],   // anyUSDT
    ]],
  10: [  // Optimisim
    [
      "0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98"
    ], [
      ["ETH", "0x965f84D915a9eFa2dD81b653e3AE736555d945f4", 18],
      ["USDC", "0xf390830DF829cf22c53c8840554B98eafC5dCBc2", 6],
    ]
  ],
  56: [   // BNB Chain
    [
      "0xd1C5966f9F5Ee6881Ff6b261BBeDa45972B1B5f3"
    ], [
      ["ETH", "0xdebb1d6a2196f2335ad51fbde7ca587205889360", 18],
      ["USDC", "0x8965349fb649a33a30cbfda057d8ec2c48abe2a2", 18],
      ["USDT", "0xedf0c420bc3b92b961c6ec411cc810ca81f5f21a", 18],
    ]
  ],
  137: [  // Polygon
    [
      "0x4f3Aff3A747fCADe12598081e80c6605A8be192F",
    ], [
      ["ETH", "0xbD83010eB60F12112908774998F65761cf9f6f9a", 18],
      ["USDC", "0xd69b31c3225728CC57ddaf9be532a4ee1620Be51", 6],
      ["USDT", "0xE3eeDa11f06a656FcAee19de663E84C7e61d3Cac", 6],
      ["DAI", "0x9b17bAADf0f21F03e35249e0e59723F34994F806", 18],
    ]
  ],
  250: [  // Fantom
    [
      '0x1CcCA1cE62c62F7Be95d4A67722a8fDbed6EEcb4',
    ], [
      ['ETH', '0xBDC8fd437C489Ca3c6DA3B5a336D11532a532303', 18],
      ['USDC', '0x95bf7E307BC1ab0BA38ae10fc27084bC36FcD605', 6],
      ['USDT', '0x2823D10DA533d9Ee873FEd7B16f4A962B2B7f181', 6],
      ['DAI', '0xd652776dE7Ad802be5EC7beBfafdA37600222B48', 18],
    ]
  ],
  42161: [  // Arbitrum
    [
      "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
      "0x650Af55D5877F289837c30b94af91538a7504b76"
    ], [
      ["ETH", "0x1Dd9e9e142f3f84d90aF1a9F2cb617C7e08420a4", 18],
      ["USDC", "0x3405A1bd46B85c5C029483FbECf2F3E611026e45", 6],
      ["USDT", "0x05e481B19129B560E921E487AdB281E70Bdba463", 6],
      ["DAI", "0xaef9E3e050D0Ef060cdfd5246209B0B6BB66060F", 18],
    ]
  ],
  43114: [  // Avalanche
    [
      "0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8",
    ], [
      ["ETH", "0x7D09a42045359Aa85488bC07D0ADa83E22d50017", 18],
      ["USDC", "0xcc9b1F919282c255eB9AD2C0757E8036165e0cAd", 6],
      ["USDT", "0x94977c9888F3D2FAfae290d33fAB4a5a598AD764", 6],
      ["DAI", "0xd4143E8dB48a8f73afCDF13D7B3305F28DA38116", 18],
    ]
  ],
}

export const CBridgeMap: { [index: number]: [string, [string, string, number][]] } = {
  1: [
    "0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820", [
      ["ETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18],
      ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6],
      ["USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6],
      ["DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18],
    ]],
  10: [
    "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401", [
      ["ETH", "0x4200000000000000000000000000000000000006", 18],
      ["USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6],
      ["USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6],
      ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
    ]],
  56: [
    "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF", [
      ["ETH", "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", 18],
      ["USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", 18],
      ["USDT", "0x55d398326f99059fF775485246999027B3197955", 18],
      ["DAI", "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", 18],
    ]],
  137: [
    "0x88DCDC47D2f83a99CF0000FDF667A468bB958a78", [
      ["ETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18],
      ["USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 6],
      ["USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 6],
      ["DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18],
    ]],
  250: [
    "0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF", [
      ["ETH", "0x74b23882a30290451A17c44f4F05243b6b58C76d", 18],
      ["USDC", "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", 6],
      ["USDT", "0x049d68029688eAbF473097a2fC38ef61633A3C7A", 6],
      ["DAI", "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", 18],
    ]
  ],
  42161: [
    "0x1619DE6B6B20eD217a58d00f37B9d47C7663feca", [
      ["ETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18],
      ["USDC", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 6],
      ["USDT", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", 6],
      ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
    ]],
  43114: [
    "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4", [
      ["ETH", "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", 18],
      ["USDC", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", 6],
      ["USDT", "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", 6],
      ["DAI", "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", 18],
    ]]
}

export const HopMap: { [index: number]: [string, string, number][] } = {
  1: [
    ["ETH", "0xb8901acB165ed027E32754E0FFe830802919727f", 18],
    ["USDC", "0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a", 6],
    ["USDT", "0x3E4a3a4796d16c0Cd582C382691998f7c06420B6", 6],
    ["DAI", "0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1", 18],
  ],
  10: [
    ["ETH", "0x83f6244Bd87662118d96D9a6D44f09dffF14b30E", 18],
    ["USDC", "0xa81D244A1814468C734E5b4101F7b9c0c577a8fC", 6],
    ["USDT", "0x46ae9BaB8CEA96610807a275EBD36f8e916b5C61", 6],
    ["DAI", "0x7191061D5d4C60f598214cC6913502184BAddf18", 18],
  ],
  137: [
    ["ETH", "0xb98454270065A31D71Bf635F6F7Ee6A518dFb849", 18],
    ["USDC", "0x25D8039bB044dC227f741a9e381CA4cEAE2E6aE8", 6],
    ["USDT", "0x6c9a1ACF73bd85463A46B0AFc076FBdf602b690B", 6],
    ["DAI", "0xEcf268Be00308980B5b3fcd0975D47C4C8e1382a", 18],
  ],
  43114: [
    ["ETH", "0x3749C4f034022c39ecafFaBA182555d4508caCCC", 18],
    ["USDC", "0x0e0E3d2C5c292161999474247956EF542caBF8dd", 6],
    ["USDT", "0x72209Fe68386b37A40d6bCA04f78356fd342491f", 6],
    ["DAI", "0x7aC115536FE3A185100B2c4DE4cb328bf3A58Ba6", 18],
  ]
}

export const StargateMap: { [index: number]: [string, string, number][] } = {
  1: [
    ["USDC", "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56", 1],
    ["USDT", "0x38EA452219524Bb87e18dE1C24D3bB59510BD783", 2],
    ["DAI", "0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d", 3],
    ["ETH", "0x101816545F6bd2b1076434B54383a1E633390A2E", 13],
  ],     // Ethereum

  56: [
    ["USDT", "0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda", 2],
  ],     // BNB Chain

  43114: [
    ["USDC", "0x1205f31718499dBf1fCa446663B532Ef87481fe1", 1],
    ["USDT", "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", 2],
  ],     // Avalanche

  137: [
    ["USDC", "0x1205f31718499dBf1fCa446663B532Ef87481fe1", 1],
    ["USDT", "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", 2],
    ["DAI", "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea", 3],
  ],     // Polygon

  42161: [
    ["USDC", "0x892785f33CdeE22A30AEF750F285E18c18040c3e", 1],
    ["USDT", "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641", 2],
    ["ETH", "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e", 13],
  ],     // Arbitrum

  10: [
    ["USDC", "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298", 1],
    ["DAI", "0x165137624F1f692e69659f944BF69DE02874ee27", 3],
    ["ETH", "0xd22363e3762cA7339569F3d33EADe20127D5F98C", 13],
  ],     // Optimism

  250: [
    ["USDC", "0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97", 1],
  ],     // Fantom
}

export const AcrossMap: { [index: number]: [string[], [string, string, number][]] } = {
  1: [[
    "0x4D9079Bb4165aeb4084c526a32695dCfd2F77381",
    "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5",
  ], [
    ["ETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18],
    ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6],
    ["DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18],
  ]],     // Ethereum

  10: [[
    "0xa420b2d1c0841415A695b81E5B867BCD07Dff8C9",
    "0x6f26Bf09B1C792e3228e5467807a900A503c0281",
  ], [
    ["ETH", "0x4200000000000000000000000000000000000006", 18],
    ["USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6],
    ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
  ]],     // Optimism

  137: [[
    "0x69B5c72837769eF1e7C164Abc6515DcFf217F920",
    "0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096",
  ], [
    ["ETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18],
    ["USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 6],
    ["DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18],
  ]],     // Polygon

  42161: [[
    "0xB88690461dDbaB6f04Dfad7df66B7725942FEb9C",
    "0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A",
  ], [
    ["ETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18],
    ["USDC", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 6],
    ["DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18],
  ]],     // Arbitrum
}

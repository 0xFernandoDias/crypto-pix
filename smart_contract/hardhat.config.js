require("@nomiclabs/hardhat-waffle")

module.exports = {
	solidity: "0.8.0",
	networks: {
		goerli: {
			url: "https://eth-goerli.g.alchemy.com/v2/svlGy4Z13hsNN_KXAKPUKsn_Zl5LfAA-",
			accounts: [
				"d31b1f1cd582d5cdfe2ef997c29f59fb97410bc216b81f35414904f43d2b9288",
			],
		},
	},
}

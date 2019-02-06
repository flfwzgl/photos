

const path = require('path');

module.exports = {
	dev: {
		path: path.join(__dirname, '../docs'), 
		assetsPath: 'asset',
		publicPath: '/',
	},

	production: {
		path: path.join(__dirname, '../docs'), 
		assetsPath: 'asset',
		publicPath: '/photos',
	}
}
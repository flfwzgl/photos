

const path = require('path');

module.exports = {
	dev: {
		path: path.join(__dirname, '../dist'), 
		assetsPath: 'asset',
		publicPath: '/',
	},

	production: {
		path: path.join(__dirname, '../dist'), 
		assetsPath: 'asset',
		publicPath: '/',
	}
}
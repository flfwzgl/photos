
const webpack              = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const merge                = require('webpack-merge');
const webpackConfig        = require('./webpack.base');

const config               = require('./config')[process.env.NODE_ENV];


const path = require('path');


const port = 9000;

module.exports = merge(webpackConfig, {
	devtool: '#eval-source-map',
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new FriendlyErrorsPlugin(),
	],
	devServer: {
		contentBase: config.path,
		compress: true,
		hot: true,
		host: '0.0.0.0',
		allowedHosts: [
			'demo.fanlinfeng.com',
		],
		port,
	}
})

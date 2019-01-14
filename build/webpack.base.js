

const ENV                   = process.env.NODE_ENV;
const path                  = require('path');
const webpack               = require('webpack');
const HtmlWebpackPlugin     = require('html-webpack-plugin');
const pro          			= ENV === 'production';

const config                = require('./config')[ENV];
const pkg					= require('../package');

const resolve = (...args) => path.join(__dirname, '..', ...args);
const assetPath = p => path.join(config.assetsPath, p);

const getLoader = name => ({
	loader: `${name}-loader`,
	options: {
		minimize: pro,
		sourceMap: !pro
	}
});

module.exports = {
	entry: {
		photos: [
			// 'core-js/fn/promise',
			'core-js/fn/array',
			'core-js/fn/object',
			resolve('src/lib/photos.js')
		],
		index: resolve('src/index.js')
	},
	output: {
		path: config.path,
		filename: assetPath('[name].js?[hash:8]'),
		publicPath: config.publicPath
	},
	resolve: {
		extensions: ['.js', '/index.js', '.ejs', '.md'],
		alias: {
			'@': resolve('src'),
			'css': resolve('src/css'),
			'tpl': resolve('src/tpl'),
		}
	},
	module: {
		rules: [{
			enforce: 'pre',
			test: /\.js$/,
			loader: 'eslint-loader'
		}, {
			test: /\.js$/,
			loader: 'babel-loader',
			include: resolve('src')
		}, {
			test: /\.ejs$/,
			loader: 'ejs-loader',
			include: resolve('src')
		}, {
			test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 50000,
				name: assetPath('img/[name].[ext]?[hash:8]')
			}
		}, {
			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 50000,
				name: assetPath('fonts/[name].[ext]?[hash:8]')
			}
		}, {
			test: /\.(css|less)$/,
			loader: [
				'style-loader',
				getLoader('css'),
				'postcss-loader',
				getLoader('less')
			]
		}, {
			test: /\.md$/,
			loader: [
				'html-loader',
				'markdown-loader'
			]
		}]
	},
	devtool: !pro,
	plugins: [
		new webpack.DefinePlugin({
			'process.env.version': `'${pkg.version}'`
		}),

		new webpack.ProvidePlugin({
			'$': 'jquery'
		}),

		// cn
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: resolve('src/index.html'),
			inject: 'body',
			chunks: [
				'photos',
				'index'
			],
			minify: {
				removeComments:     pro,
				collapseWhitespace: pro
			}
		}),

		// en
		new HtmlWebpackPlugin({
			filename: 'en/index.html',
			template: resolve('src/index.html'),
			inject: 'body',
			chunks: [
				'photos',
				'index'
			],
			minify: {
				removeComments:     pro,
				collapseWhitespace: pro
			}
		}),
	]
}
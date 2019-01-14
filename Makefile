
dev:
	@NODE_ENV=dev ./node_modules/.bin/webpack-dev-server\
	 --config build/webpack.dev.js\
	 --public\
	 --color\
	 --progress\
	 --hot\
	 -d


production:
	@rm -rf dist && NODE_ENV=production ./node_modules/.bin/webpack\
	 --config build/webpack.base.js\
	 --verbose\
	 --progress\
	 -p

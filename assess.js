#!/usr/bin/env node

// Define sites on which to run audit
const root = 'https://www.junkyarn.com/';
const sites = {
//  'filename'			: 'extension',
	'home'				: '',
	'cart'				: 'cart',
	'product-grid'		: 'collections/galentines-day-2019-collection-barbie',
	'single-product'	: 'collections/galentines-day-2019-collection-barbie/products/junkyarn-dk-ready-to-ship?variant=39511884038231'
};

const exec = require('child_process').exec;

function assess() {
	
	Object.keys(sites).forEach(key => {
		exec(`lighthouse ${root}${sites[key]} --output=json --output-path=./lighthouse-reports/${key}_mobile.json`);
		exec(`lighthouse ${root}${sites[key]} --preset=desktop --output=json --output-path=./lighthouse-reports/${key}_desktop.json`);
	})
	
}

exec(`mkdir lighthouse-reports`);
assess();
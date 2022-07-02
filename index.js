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

const cli = require('child_process');
var results = [];

Object.keys(sites).forEach(key => {
	// Mobile audit
	cli.exec(`lighthouse ${root}${sites[key]} --output=json --output-path=./lighthouse-report_${key}_mobile.json`);
	results.push(`lighthouse-report_${key}_mobile.json`);

	// Desktop audit
	cli.exec(`lighthouse ${root}${sites[key]} --preset=desktop --output=json --output-path=./lighthouse-report_${key}_desktop.json`);
	results.push(`lighthouse-report_${key}_desktop.json`);
})
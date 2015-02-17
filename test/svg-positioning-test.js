var svgPositioning = require('../svg-positioning');
var svgMatrixUntils = require('../svg-matrix-utils');
var test = require('tape');

test('SVG positioning ok', function (t) {
	t.plan(16);

	var sizeTo = {
		'x': Math.random() * 20,
		'y': Math.random() * 20,
		'width': 20 + (Math.random() * 20),
		'height': 20 + (Math.random() * 20)
	};
	var SVG_NS = 'http://www.w3.org/2000/svg';

	var svgElem = document.createElementNS(SVG_NS, 'svg');
	document.body.appendChild(svgElem);
	svgElem.setAttribute('width', 400);
	svgElem.setAttribute('height', 400);


	var svgObjects = //svgPositioning.getMoveable()
		['rect', 'ellipse', 'image'].map(function(n) {
			return document.createElementNS(SVG_NS, n);
		});

	var foreignObjectElement = document.createElementNS(SVG_NS, 'foreignObject');
	body = document.createElement("body");
	body.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
	foreignObjectElement.appendChild(body);

	// svgObjects.push(foreignObjectElement);

	svgObjects.forEach(function(svgElement) {
		svgElement.setAttribute('fill', '#F00');
	});

	svgObjects.forEach(function(svgElement) {
		svgElem.appendChild(svgElement);
	});

	svgObjects.forEach(function(svgElement) {
		svgPositioning.sizeSvg(svgElement, sizeTo);
	});

	svgObjects.forEach(function(svgElement) {
		['x', 'y', 'width', 'height'].forEach(function(dimention) {
			t.equal(
				Math.round(svgElement.getBBox()[dimention] * 100),
				Math.round(sizeTo[dimention] * 100),
				svgElement.nodeName.toLowerCase() + ' - ' + dimention);
		});
	});

	sizeTo.width = sizeTo.height;

	svgObjects = ['circle'].map(function(n) {
			return document.createElementNS(SVG_NS, n);
		});

	svgObjects.forEach(function(svgElement) {
		svgElem.appendChild(svgElement);
	});

	svgObjects.forEach(function(svgElement) {
		svgPositioning.sizeSvg(svgElement, sizeTo);
	});

	svgObjects.forEach(function(svgElement) {
		['x', 'y', 'width', 'height'].forEach(function(dimention) {
			t.equal(
				Math.round(svgElement.getBBox()[dimention] * 100),
				Math.round(sizeTo[dimention] * 100),
				svgElement.nodeName.toLowerCase() + ' - ' + dimention);
		});
	});


	svgElem.parentNode.removeChild(svgElem);

	t.end();
});



test('SVG remove transform ok', function (t) {
	t.plan(12);

	var sizeTo = {
		'x': 10 + (Math.random() * 20),
		'y': 10 + (Math.random() * 20),
		'width': 20 + (Math.random() * 20),
		'height': 20 + (Math.random() * 20)
	};

	var SVG_NS = 'http://www.w3.org/2000/svg';

	var svgObjects = //svgPositioning.getMoveable()
		['rect', 'ellipse', 'image'].map(function(n) {
			return document.createElementNS(SVG_NS, n);
		});

	var svgElem = document.createElementNS(SVG_NS, 'svg');
	svgElem.setAttribute('width', 400);
	svgElem.setAttribute('height', 400);

	svgObjects.forEach(function(svgElement) {
		svgElem.appendChild(svgElement);
	});
	document.body.appendChild(svgElem);

	svgObjects
		.forEach(function(svgElement) {
			svgElement.setAttribute('fill', '#F00');

			svgPositioning.sizeSvg(svgElement, {
				'x': 0,
				'y': 0,
				'width': 1,
				'height': 1
			});

			svgElement.setAttribute('transform', 'translate(' +
				((sizeTo.x)) + ' ' + ((sizeTo.y)) + ') scale(' +
				sizeTo.width + ' ' + sizeTo.height + ')');
		});

	svgObjects.forEach(function(svgElement) {
		svgMatrixUntils.removeTransform(svgElement);
	});

	svgObjects.forEach(function(svgElement) {
		     svgElement.removeAttribute('transform');
			// t.equal(
			// 	svgElement.hasAttribute('transform'),
			// 	false,
			// 	svgElement.nodeName.toLowerCase() + ' - ' + svgElement.getAttribute('transform'));
			['x', 'y', 'width', 'height'].forEach(function(dimention) {
				t.equal(
					Math.round(svgMatrixUntils.getBbox(svgElement)[dimention] * 1000),
					Math.round(sizeTo[dimention] * 1000),
					svgElement.nodeName.toLowerCase() + ' - ' + dimention);
			});
		});

	svgElem.parentNode.removeChild(svgElem);

	t.end();
});

var svgPositioning = require('../svg-positioning');
var test = require('tape');

test('SVG positioning ok', function (t) {
	t.plan(12);
	t.timeoutAfter(1000);

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


	var SVG_OBJECTS_NAMES = ['rect', 'ellipse', 'image'];

	var svgObjects = SVG_OBJECTS_NAMES
		.map(function(n) {
			return document.createElementNS(SVG_NS, n);
		});

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
				Math.round(svgElement.getBBox()[dimention] * 1000),
				Math.round(sizeTo[dimention] * 1000),
				svgElement.nodeName.toLowerCase() + ' - ' + dimention);
		});
	});

	t.end();
});

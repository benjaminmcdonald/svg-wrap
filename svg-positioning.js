function svgPositionsDefinition() {
    'use strict';

    var RESIZEABLE_ELEMENTS = ['ellipse', 'circle', 'foreignObject',
                'rect', 'image', 'line'];
    var _this = {};

    function sizeSvg(element, newBBox) {
        switch (element.nodeName.toLowerCase()) {
            case 'ellipse':
                if (newBBox.width) {
                    var positionDiffX = (element.rx.baseVal.value - (newBBox.width / 2)) ;
                    element.cx.baseVal.value = element.cx.baseVal.value - positionDiffX;
                    element.rx.baseVal.value = newBBox.width / 2;                    
                }
                if (newBBox.height) {
                    var positionDiffY = (element.ry.baseVal.value - (newBBox.height / 2));
                    element.cy.baseVal.value = element.cy.baseVal.value - positionDiffY;
                    element.ry.baseVal.value = newBBox. height / 2;
                }
                if (newBBox.x) {
                    element.cx.baseVal.value = newBBox.x + element.rx.baseVal.value;
                }
                if (newBBox.y) {
                    element.cy.baseVal.value = newBBox.y + element.ry.baseVal.value;
                }
                break;
            case 'circle':
                var newRadius = Math.max(newBBox.width / 2, newBBox.height / 2);
                var positionDiff = (element.r.baseVal.value - newRadius) / 2;
                if (newBBox.width) {
                    element.setAttribute('cx', element.cx.baseVal.value - positionDiff);
                }
                if (newBBox.height) {
                    element.setAttribute('cy', element.cy.baseVal.value - positionDiff);
                }
                if (newBBox.width || newBBox. height) {
                    element.r.baseVal.value = newRadius;
                }
                if (newBBox.x) {
                    element.cx.baseVal.value = newBBox.x + element.r.baseVal.value;
                }
                if (newBBox.y) {
                    element.cy.baseVal.value = newBBox.y + element.r.baseVal.value;
                }
                break;
            case 'use':
                console.assert(!('width' in newBBox) && 
                    !('width' in newBBox));
                if (newBBox.x) {
                    element.setAttribute('x', newBBox.x);
                }
                if (newBBox.y) {
                    element.setAttribute('y', newBBox.y);
                }
                break;
            case 'foreignObject':
            case 'rect':
            case 'image':
                if (newBBox.x) {
                    element.x.baseVal.value = newBBox.x;
                }
                if (newBBox.y) {
                    element.y.baseVal.value = newBBox.y;
                }
                if (newBBox.width) {
                    element.setAttribute('width', newBBox.width);
                }
                if (newBBox.height) {
                    element.setAttribute('height',newBBox.height);
                }
                break;
        }
    }

    function getEllipseBbox() {
        var rx = parseFloat(ellipseElem.getAttribute('rx'));
        var ry = parseFloat(ellipseElem.getAttribute('ry'));
        return {
            'x': parseFloat(ellipseElem.getAttribute('cx')) - rx,
            'y': parseFloat(ellipseElem.getAttribute('cy')) - ry,
            'width': rx * 2,
            'height': ry * 2
        };
    }

    function getCircleBbox() {
        var r = parseFloat(ellipseElem.getAttribute('r'));
        return {
            'x': parseFloat(ellipseElem.getAttribute('cx')) - r,
            'y': parseFloat(ellipseElem.getAttribute('cy')) - r,
            'width': r * 2,
            'height': r * 2
        };
    }

    function getRectBbox() {
        return {
            'x': parseFloat(rectElem.getAttribute('x')),
            'y': parseFloat(rectElem.getAttribute('y')),
            'width': parseFloat(rectElem.getAttribute('width')),
            'height': parseFloat(rectElem.getAttribute('height'))
        };
    }

    var getBboxDict = {
        'image': getRectBbox,
        'rect': getRectBbox,
        'foreignObject': getRectBbox,
        'ellipse': getCircleBbox,
        'circle': getEllipseBbox
    };

    function getBbox(element) {
        return getBboxDict[element.nodeName.toLowerCase()]();
    }

    function getResizable() {
        return RESIZEABLE_ELEMENTS;
    }

    return {
        'sizeSvg': sizeSvg,
        'getResizable': getResizable
    };
}

// backwards-compatibility for the old `require()` API. If we're in
// the browser, add a global object.
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = svgPositionsDefinition();
    }
    exports.svgPositions = svgPositionsDefinition();
} else {
    root.svgPositions = svgPositionsDefinition();
}
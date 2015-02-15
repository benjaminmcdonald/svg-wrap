function svgPositionsDefinition() {
    'use strict';

    var MOVEABLE_ELEMENTS = ['ellipse', 'circle', 'foreignObject',
                'rect', 'square', 'image'];
    var _this = {};

    function removeTransform(svgElement) {

    }

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

    function isMoveable(svgElement) {
        return MOVEABLE_ELEMENTS.indexOf(svgElement.nodeName.toLowerCase()) !== -1;
    }

    return {
        'sizeSvg': sizeSvg,
        'isMoveable': isMoveable,
        'removeTransform': removeTransform
    };
}

 // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = svgPositionsDefinition();
    }
    exports.svgPositions = svgPositionsDefinition();
  } else {
    root.svgPositions = svgPositionsDefinition();
  }
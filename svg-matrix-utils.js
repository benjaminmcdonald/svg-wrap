/**
 *    Functions to perform matrix operations on svg elements
*/

/** @namespace svgLayoutDefinition */
function svgMatrixUntilsDefinition(svgPositions) {
    'use strict';

    /**
    * Get the transform matrix between the 'elem' and the 'relativeTo' element
    * @type {function(SVGElement, SVGElement?):SVGMatrix}
    */
    function getElementMatrix(elem, relativeTo) {
        if (relativeTo && relativeTo !== elem.parentNode) {
            // Avoid this method as it's slow

            var hasMatrix = null;
            var startElem = elem;
            while (startElem !== relativeTo.parentNode && startElem !== elem.ownerSVGElement) {
                if (startElem.hasAttribute('transform')) {
                    if (hasMatrix) {
                        return elem.getTransformToElement(relativeTo);
                    }
                    hasMatrix = startElem;
                }
                startElem = startElem.parentNode;
            }

            return hasMatrix?getElementMatrix(hasMatrix):elem.getTransformToElement(relativeTo);
        } else {
            if (elem.transform.baseVal.length === 0 || elem.transform.baseVal.numberOfItems === 0) {
                elem.transform.baseVal.appendItem(elem.ownerSVGElement.createSVGTransform());
            } else if (elem.transform.baseVal.length !== 1 || elem.transform.baseVal.numberOfItems !== 1) {
                elem.transform.baseVal.consolidate();
            }
            return elem.transform.baseVal.getItem(0).matrix;
        }
    }

    function getRotation(elem) {
        return Math.asin(getElementMatrix(elem).b) * (180/3.141);
    }

    function matrixToSvgTransformString(matrix) {
        return 'matrix(' + ['a', 'b', 'c', 'd', 'e', 'f'].map(function(key) {return matrix[key].toFixed(4);}).join(' ') + ')';
    }

    function bboxOfMany(bboxSet) {
        var x = Math.min.apply(null, bboxSet
            .map(function(rect){
                return rect.x;
            }));
        var width = Math.max.apply(null, bboxSet.map(function(rect){
                    return rect.x + rect.width;
                })) - x;
        var y = Math.min.apply(null, bboxSet
            .map(function(rect){
                return rect.y;
            }));
        var height = Math.max.apply(null, bboxSet.map(function(rect){
                    return rect.y + rect.height;
                })) - y;
        return {
            'x': x,
            'y': y,
            'width': width,
            'height': height
        };
    }

    function setRotation(elem, newRotation) {
        var bbox = getBbox(elem);
        var centerX = bbox.x + (bbox.width / 2);
        var centerY = bbox.y + (bbox.height / 2);

        // if (elem.transform.baseVal.length === 0) {
        //     elem.transform.baseVal.appendItem(elem.ownerSVGElement.createSVGTransform());
        // }
        var t = elem.ownerSVGElement.createSVGTransform(); //elem.transform.baseVal.getItem(0);

        t.setRotate(newRotation * (3.141 / 180), centerX, centerY);

        elem.setAttribute('transform', matrixToSvgTransformString(t.matrix));
    }

    /** @type {function(SVGElement):SVGMatrix} */
    function setElementMatrix(svgElement, matrix) {
        if (svgElement.transform.baseVal.length === 0) {
            svgElement.transform.baseVal.appendItem(svgElement.ownerSVGElement.createSVGTransform());
        }

        svgElement.transform.baseVal.getItem(0).setMatrix(matrix);
    }

    /**
    * Transform rect coordinates by matrix
    * @type {function(!Object, SVGMatrix, SVGElement):!Object}
    */
    function transformRect(bb, matrix, svg) {
        // Create an array of all four points for the original bounding box
        var pts = [
            svg.createSVGPoint(), svg.createSVGPoint(),
            svg.createSVGPoint(), svg.createSVGPoint()
        ];
        pts[0].x=bb.x;          pts[0].y=bb.y;
        pts[1].x=bb.x+bb.width; pts[1].y=pts[0].y;
        pts[2].x=pts[1].x;      pts[2].y=bb.y+bb.height;
        pts[3].x=pts[0].x;      pts[3].y=pts[2].y;

        var transformedPoints = pts.map(function(pt){
            return pt.matrixTransform(matrix);
        });

        var xCoords = transformedPoints.map(function(pt){
            return pt.x;
        });
        var yCoords = transformedPoints.map(function(pt){
            return pt.y;
        });

        var left = Math.min.apply(null, xCoords);
        var top = Math.min.apply(null, yCoords);
        var right = Math.max.apply(null, xCoords);
        var bottom = Math.max.apply(null, yCoords);
        return {
            'x': left,
            'y': top,
            'width': right - left,
            'height': bottom - top
        };
    }

    /** @type {function(SVGElement):!Object} */
    function getBboxOfChildren (elem, relativeTo) {
        var bboxOfMany = Array.from(elem.childNodes)
           .filter(function(e) {
                return e.nodeType === 1 && !e.classList.contains('no-distribute');
            })
            .map(function(e) {
                return getBbox(e, relativeTo);
            })
            .filter(function(b) {
                return b;
            });

        bboxOfMany = bboxOfMany.length===0?getBbox(elem):bboxOfMany;
        return bboxOfMany;
    }

    /** @type {function(SVGElement)} */
    function removeTransform (elem) {
        var svgDoc = elem.ownerSVGElement || relativeTo.ownerSVGElement;
        var bbox = transformRect(elem.getBBox(),
             getElementMatrix(elem),
             svgDoc);
        elem.removeAttribute('transform');

        svgPositions.sizeSvg(elem, bbox);

    }


    // Function: svgedit.utilities.getPathBBox
    // Get correct BBox for a path in Webkit
    // Converted from code found here:
    // http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    //
    // Parameters:
    // path - The path DOM element to get the BBox for
    //
    // Returns:
    // A BBox-like object
    function getPathBBox(path) {
        var r = Raphael(10, 50, 600, 300);
        var bbox = r.path(path.getAttribute('d')).getBBox();
        r.remove();

        return bbox;
    }


    /** @type {function(SVGElement):!Object} */
    function getBbox (elem, relativeTo, bugFix) {
        var referenceElement = elem;
        var svgDoc = elem.ownerSVGElement || relativeTo.ownerSVGElement;
        referenceElement = elem.correspondingUseElement || referenceElement;
        if (elem.href && elem.href.baseVal) {
            referenceElement = document.getElementById(elem.href.baseVal.substring(1)) || referenceElement;
        }

        var bbox;
        if (elem.localName.toLowerCase() === 'clippath' && !elem.getBBox) {
            referenceElement = referenceElement.firstChild;
            var matrix = getElementMatrix(referenceElement);

            return {
                'x': referenceElement.x.baseVal.value + matrix.e,
                'y': referenceElement.y.baseVal.value + matrix.f,
                'width': referenceElement.width.baseVal.value,
                'height': referenceElement.height.baseVal.value
            };
        }

        if (!referenceElement.getBBox || !svgDoc) {
            return null;
        }

        if (bugFix && elem.localName.toLowerCase() === 'path') {
            bbox = getPathBBox(referenceElement);
        } else {
            try {
                bbox = referenceElement.getBBox();
                bbox = {
                    'x': bbox.x,
                    'y': bbox.y,
                    'width': bbox.width,
                    'height': bbox.height
                };
            } catch (e) {
                console.log(elem);
                return null;
            }
        }

        //getComputedTextLength(); http://jsperf.com/comparing-ways-of-getting-svg-text-width/3
        //width = textSelector[0].offsetWidth;
        //height = textSelector[0].offsetHeight;


        if (bbox.width || bbox.height) {
            bbox.y = bbox.y || parseFloat(referenceElement.getAttribute('y')) || 0;
        }

        if (elem.nodeName.toLowerCase() === 'use') {
            bbox.x += elem.x.baseVal.value;
            bbox.y += elem.y.baseVal.value;
        }
        return (elem.hasAttribute('transform') || relativeTo)?transformRect(bbox,
                             getElementMatrix(elem, relativeTo),
                             svgDoc):bbox;
    }


    return {
        'getRotation': getRotation,
        'setRotation': setRotation,
        'getElementMatrix': getElementMatrix,
        'setElementMatrix': setElementMatrix,
        'getBbox': getBbox,
        'removeTransform': removeTransform,
        'getBboxOfChildren': getBboxOfChildren
    };
}

// backwards-compatibility for the old `require()` API. If we're in
// the browser, add a global object.
if (typeof exports !== 'undefined') {
    var svgPositions = require('./svg-positioning');
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = svgMatrixUntilsDefinition(svgPositions);
    }
    exports.svgMatrixUntils = svgMatrixUntilsDefinition(svgPositions);
} else {
    root.svgMatrixUntils = svgMatrixUntilsDefinition(svgPositions);
}
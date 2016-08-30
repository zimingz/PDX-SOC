"use strict";

/**
 * This function takes two parameters (x, y) and will return a number less than,
 * greater than or equal to zero depending on whether x is less than,
 * greater than or equal to y respectively. The '<' and '>' operators
 * are used to order x and y.
 * @param x
 * @param y
 * @return {number}
 */
function compareBasic(x, y) {
    if(x < y) {
        return -1;
    } else if(x > y) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * This function simply returns (x - y) and thus is a suitable comparison function
 * to use for sorting or searching numeric values
 * @param x {number}
 * @param y {number}
 * @return {number}
 */
function compareNumeric(x, y) {
    return x - y;
}

/**
 * Binary search which returns the matchin index -(insertIndex + 1) in the case that no match is found
 * @param array a sorted array
 * @param x the value we're searching for
 * @param [compFunc=compareNumeric] the function used to compare values for the binary search. This
 *          function takes two parameters (x, y) and will return a number less than, greater than or equal
 *          to zero depending on whether x is less than, greater than or equal to y respectively. This
 *          implementation guarantees that x is always the second parameter given to compFunc
 *          (so it is possible to perform a comparison where x is of a different type than the
 *          contents of the given array)
 * @return {number} the index
 */
function binarySearch(array, x, compFunc) {
    if(typeof compFunc === 'undefined') {
        compFunc = compareNumeric;
    }

    var low = 0;
    var high = array.length - 1;
    while (low <= high) {
        var mid = (low + high) >> 1;
        var midVal = array[mid];
        var compVal = compFunc(midVal, x);
        if(compVal < 0) {
            low = mid + 1;
        } else if(compVal > 0) {
            high = mid - 1;
        } else {
            return mid;
        }
    }

    return -(low + 1);
}

/**
 * Insert x into the given sorted array if it isn't already present (this function has no effect if the element is
 * already in the array).
 * @param array a sorted array
 * @param x the value to insert
 * @param [compFunc=compareNumeric] the function used to compare values for the binary search. This
 *          function takes two parameters (x, y) and will return a number less than, greater than or equal
 *          to zero depending on whether x is less than, greater than or equal to y respectively. This
 *          implementation guarantees that x is always the second parameter given to compFunc
 *          (so it is possible to perform a comparison where x is of a different type than the
 *          contents of the given array)
 */
function insertUnique(array, x, compFunc) {
    var idx = binarySearch(array, x, compFunc);
    if(idx < 0) {
        idx = -idx - 1;
        array.splice(idx, 0, x);
    }
}

/**
 *
 * @param nums
 * @return {{mean: number, stdDev: number}}
 */
function meanStddev(nums) {
    var sum = 0.0;
    var sumSq = 0.0;
    var count = nums.length;
    nums.forEach(function(num) {
        if(!isNaN(num)) {
            sum += num;
            sumSq += num * num;
        } else {
            count--;
        }
    });

    var mean = sum / count;
    return {
        mean: mean,
        stdDev: Math.sqrt((sumSq / count) - Math.pow(mean, 2)),
        count: count
    };
}

/**
 *
 * @param nums
 * @return {{mean: number, stdDev: number, stdErr: number}}
 */
function meanStderrStddev(nums) {
    var retVal = meanStddev(nums);
    retVal.stdErr = retVal.stdDev / Math.sqrt(retVal.count);

    return retVal;
}

//var colors = [
//    "#8b8b8b", "#1414c8", "#96e9e9", "#008B50", "#00B8CE", "#91C74B", "#7da564",
//    "#FAED3F", "#C4A2A3", "#d0811d", "#F69686", "#f5cac4", "#f5600f", "#B65578",
//    "#A94F97", "#E4483C", "#d5d5d5", "#98383A", "#964A94", "#0098A3", "#009DE0"
//];

var colors = [
    "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f",
    "#ff7f00", "#cab2d6", "#6a3d9a"
];
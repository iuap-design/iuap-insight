/**
 * Timing.js 1.2.0
 * Copyright 2016 Addy Osmani
 */

/**
 * Navigation Timing API helpers
 * timing.getTimes();
 **/
const timing =  {
    /**
     * Outputs extended measurements using Navigation Timing API
     * @param  Object opts Options (simple (bool) - opts out of full data view)
     * @return Object      measurements
     */
    getTimes: function(opts) {
        var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;

        if (performance === undefined) {
            return false;
        }

        var timing = performance.timing;
        var api = {};
        opts = opts || {};

        if (timing) {
            if(opts && !opts.simple) {
                for (var k in timing) {
                    // hasOwnProperty does not work because properties are
                    // added by modifying the object prototype
                    if(isNumeric(timing[k])) {
                        api[k] = parseFloat(timing[k]);
                    }
                }
            }


            // Time to first paint
            if (api.firstPaint === undefined) {
                // All times are relative times to the start time within the
                // same objects
                var firstPaint = 0;

                // IE
                if (typeof timing.msFirstPaint === 'number') {
                    firstPaint = timing.msFirstPaint;
                    api.firstPaintTime = firstPaint - timing.navigationStart;
                } else if (performance.getEntriesByName !== undefined) {
                    var firstPaintPerformanceEntry = performance.getEntriesByName('first-paint');
                    if (firstPaintPerformanceEntry.length === 1) {
                        var firstPaintTime = firstPaintPerformanceEntry[0].startTime;
                        firstPaint = performance.timeOrigin + firstPaintTime;
                        api.firstPaintTime = firstPaintTime;
                    }
                }
                if (opts && !opts.simple) {
                    api.firstPaint = firstPaint;
                }
            }

            // Total time from start to load
            api.loadTime = timing.loadEventEnd - timing.fetchStart;
            // Time spent constructing the DOM tree
            api.domReadyTime = timing.domComplete - timing.domInteractive;
            // Time consumed preparing the new page
            api.readyStart = timing.fetchStart - timing.navigationStart;
            // Time spent during redirection
            api.redirectTime = timing.redirectEnd - timing.redirectStart;
            // AppCache
            api.appcacheTime = timing.domainLookupStart - timing.fetchStart;
            // Time spent unloading documents
            api.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
            // DNS query time
            api.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
            // TCP connection time
            api.connectTime = timing.connectEnd - timing.connectStart;
            // Time spent during the request
            api.requestTime = timing.responseEnd - timing.requestStart;
            // Request to completion of the DOM loading
            api.initDomTreeTime = timing.domInteractive - timing.responseEnd;
            // Load event time
            api.loadEventTime = timing.loadEventEnd - timing.loadEventStart;

            let start = timing.navigationStart || timing.fetchStart;
            api.t_unload = api.unloadEventTime,
            api.t_redirect = api.redirectTime,
            api.t_dns = api.lookupDomainTime,
            api.t_tcp = api.connectTime,
            api.t_request = timing.responseStart - timing.requestStart,
            api.t_response = timing.responseEnd - timing.responseStart,
            api.t_paint = parseInt(api.firstPaintTime) - parseInt(start),
            api.t_paint = api.t_paint < 0 ? 0 : api.t_paint,
            api.t_dom = timing.domContentLoadedEventStart - timing.domLoading,
            api.t_domready = timing.domContentLoadedEventStart - start,
            api.t_load = timing.loadEventStart - timing.domLoading,
            api.t_onload = timing.loadEventStart - start,
            api.t_white = timing.responseStart - start,
            api.t_all = timing.loadEventEnd - start

        }

        return api;
    },
    /**
     * Uses console.table() to print a complete table of timing information
     * @param  Object opts Options (simple (bool) - opts out of full data view)
     */
    printTable: function(opts) {
        var table = {};
        var data  = this.getTimes(opts) || {};
        Object.keys(data).sort().forEach(function(k) {
            table[k] = {
                ms: data[k],
                s: +((data[k] / 1000).toFixed(2))
            };
        });
        console.table(table);
    },
    /**
     * Uses console.table() to print a summary table of timing information
     */
    printSimpleTable: function() {
        this.printTable({simple: true});
    }
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

window.timing = window.timing || timing 

export default timing;


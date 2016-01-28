import reqwest from 'reqwest'
import jquery from 'jquery'
import _ from 'underscore'
import mainHTML from './text/main.html!text'
import quoteBlockHTML from './text/quote-block.html!text'
import share from './lib/share'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

var dataset;

export function init(el, context, config, mediator) {
    
    
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
    
    var key = '1Cubx6HAm2tG9fwmnD0hpFW6LM6d_xSR7Qm6xp_HLnhw';
    var url = sheetURL(key);

    reqwest({
        url: url,
        type: 'json',
        crossOrigin: true,
        success: (resp) =>   doStuff(resp) /*el.querySelector('.test-msg').innerHTML = `Your IP address is ${resp.ip}`*/
    });

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}

function sheetURL(sheetID) {
    var protocol = window.location.protocol.substring(0,4) !== 'http' ? 'https://' : '//';
    return protocol + 'interactive.guim.co.uk/docsdata/' + sheetID + '.json';
}

function doStuff (data) {
   
    dataset = data.sheets.Sheet1;
    console.log(dataset);
    buildView( dataset );
    
}

function buildView( data ) {
    
   var i, html = "";
   
   var quoteStyles = {}, quoteStyle, quoteImage;
   quoteStyles["3"] = "gv-quote-third";
   quoteStyles["2"] = "gv-quote-half";
   quoteStyles["1"] = "gv-quote-wide";
   
	
	var quoteTemplate = _.template(quoteBlockHTML);
	
	
	for ( i = 0; i < dataset.length; i++ ) {
        
        if (dataset[i].displayStyle != undefined && dataset[i].displayStyle != "" ) {
            quoteStyle =   quoteStyles["WIDE"];
        } else {
             quoteStyle = quoteStyles[dataset[i]["Display type"]];
        }
        
         if (dataset[i]["Quote image"] != undefined && dataset[i]["Quote image"] != "" ) {
            quoteImage =  '<div class="gv-quote-image-holder"></div>';
        } else {
             quoteImage =  '';
        }
			
			html += quoteTemplate({ quoteId: i,
                                    quoteStyle: quoteStyle,
                                    quoteImage: quoteImage,
									quote: data[i].Fullquote,
                                    pullquote: data[i].Pullquote,
                                    source: data[i]["Quote source"],
                                    title: data[i]["Quote info"],
                                    constituency: "Title here",
                                    info: "Info text here info text here"
									 });
	
	}
	
	var $qa = $("#gv-main-content");
	
	$qa.html(html);
}

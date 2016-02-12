import reqwest from 'reqwest'
import jquery from 'jquery'
import _ from 'underscore'
import mainHTML from './text/main.html!text'
import quoteBlockHTML from './text/quote-block.html!text'
import textBlockHTML from './text/text-block.html!text'
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
    addListeners();
    
}

function buildView( data ) {
    
   var i, html = "";
   
   var blockStyles = {}, blockStyle, blockImage, quoteSource, indentBool = true;
   blockStyles["wide"] = "gv-quote-block-wide gv-large-text";
   blockStyles["wide-highlighted"] = "gv-quote-block-wide-highlighted gv-large-text gv-fill-margins";
   blockStyles["standard"] = "gv-quote-block-standard";
   blockStyles["pullquote"] = "gv-quote-block-pullquote";
   
	
	var quoteTemplate = _.template(quoteBlockHTML);
    var textTemplate = _.template(textBlockHTML);
	
	
	for ( i = 0; i < dataset.length; i++ ) {
        
        if (dataset[i]["Display type"] == undefined || dataset[i]["Display type"] == "" ) {
            blockStyle = blockStyles["standard"];
        } else {
             blockStyle = blockStyles[dataset[i]["Display type"]];
        }
        
        if (indentBool && (dataset[i]["Display type"] == "standard" || dataset[i]["Display type"] == "")) {
            blockStyle +=" gv-block-indent";
        } else {
            indentBool = false; // reset indent for wide and after!!!!
        }
        
         if (dataset[i]["Quote image"] != undefined && dataset[i]["Quote image"] != "" ) {
            blockImage =  '<div class="gv-quote-image-holder"></div>';
        } else {
             blockImage =  '';
        }
        
        quoteSource = "<strong>" + data[i]["Quote source"] + "</strong>, " + data[i]["Quote source info"];
			
			html += quoteTemplate({ blockIndex: i,
                                    blockStyle: blockStyle,
                                    blockImage: blockImage,
									mainText: data[i]["Main text"],
                                    initialText: data[i]["Initial text"],
                                    source: quoteSource,
                                    blockHeader: "",
                                    blockFooter: ""
									 });
                                     
          indentBool = !indentBool;
          
                                        
	
	}
	
	var $qa = $("#gv-main-content");
	
	$qa.html(html);
}

function addListeners() {
    $(".gv-expand-quote-button").click( function (e) {
       
        //alert ("blk");
        //$(blk).toggleClass("gv-expanded");
           var blk = $(e.target).closest(".gv-quote-block");
        

        if ( blk.length > 0) { // its a block

          $(blk).toggleClass("gv-collapsed");
        }
    });
}

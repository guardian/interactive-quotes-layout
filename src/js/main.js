import reqwest from 'reqwest'
import jquery from 'jquery'
import _ from 'underscore'
import Blazy from 'blazy'
import mainHTML from './text/main.html!text'
import quoteBlockHTML from './text/quote-block.html!text'
import textBlockHTML from './text/text-block.html!text'
import share from './lib/share'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

var dataset;
var bLazy;

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

function isMobile() {
    if ($('#mobile-dummy').css('display') == 'block') {
        return true;
    } else {
        return false;
    }
}

function doStuff (data) {
   
    dataset = data.sheets.Sheet1;
    console.log(dataset);
    lazyLoadImages();
    buildView( dataset );
    addListeners();
    
}

function lazyLoadImages() {
    
         bLazy = new Blazy(
    {
        selector: ".gv-lazy",
        offset: 200
    }
       
);

}

function updateLazyLoad() {
    
    bLazy.revalidate();
     
    window.setTimeout(function() {
    updateLazyLoad();
    }, 1000);
}

function getImageAttributes( attr ) {
    
    var i, ii, arr, arr, key, values, obj = {}; //obj = { cropRatio: [500, 500], size: [ 140, 140, 140 ] };
    
    attr = attr.split("&");
    
    if (attr.length > 1) {
    
    for ( i = 0; i < attr.length; i++ ) {
        arr = attr[i].split("=");       
        key = arr[0];
        values = arr[1].split(",");
        obj[key] = values;      
    }
    
    }
     
    return obj;
    
}

function getOptimalImage( $el, stem, params ) {
    
        var sizeStr = "", imgSize, elW = $el.width();
    
        var attr = getImageAttributes( params );
        
         if (attr["size"] != undefined ) {
        var  imgSizes = attr["size"];
    
       
        
        //var windowWidth = $(window).width();
        
       // if(windowWidth <= 500){
				//load smallest image to fit small screen
				//imgSize = imgSizes[1];
			//} else if( windowWidth <= 1050 ) {
				//load medium image to fit vertical iPad layout 
				//imgSize = imgSizes[1];
			//} else {
				//load determine image to load by size of position for desktop layout
				var elWidth = elW;
				if((elWidth <= (parseInt(imgSizes[0]) + 40)) && isMobile() ) {
					imgSize = imgSizes[0];
                    
				} else if(elW <= parseInt(imgSizes[1]) ){
					imgSize = imgSizes[1];
          
				} else {
					imgSize = imgSizes[2];
				}
			//};

       sizeStr += "/" + imgSize + ".jpg";
       
         }
       
       return stem + sizeStr;
}



function buildView( data ) {
    
   var i, html = "";
   
   var blockStyles = {}, blockStyle, blockImage, quoteSource, indentBool = true, imgSrc, imgAttr;
   blockStyles["wide"] = "gv-quote-block-wide gv-large-text";
   blockStyles["wide-highlighted"] = "gv-quote-block-wide-highlighted gv-large-text gv-fill-margins";
   blockStyles["standard"] = "gv-quote-block-standard";
   blockStyles["pullquote"] = "gv-quote-block-standard gv-quote-block-pullquote gv-large-text ";
   blockStyles["image-landscape"] = "gv-quote-block-standard gv-block-indent gv-quote-block-image gv-quote-block-image-landscape";
   blockStyles["image-portrait"] = "gv-quote-block-standard gv-block-indent gv-quote-block-image gv-quote-block-image-portrait";
	
	var quoteTemplate = _.template(quoteBlockHTML);
    var textTemplate = _.template(textBlockHTML);
    
    bLazy.destroy();
	
	
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
        
        if ( dataset[i]["Force width"] != undefined && dataset[i]["Force width"] != "") {
            blockStyle += " gv-" + dataset[i]["Force width"] + "-col-width";
        }
        
        if ( dataset[i]["Force indent"] != undefined && dataset[i]["Force indent"] != "") {
            blockStyle += " gv-" + dataset[i]["Force indent"] + "-col-indent";
        }
        
        imgSrc = data[i]["Grid image"];
        imgAttr = data[i]["Grid image params"];
        
         if (dataset[i]["Grid image"] != undefined && dataset[i]["Grid image"] != "" ) {
             blockStyle +=" gv-with-image";
            blockImage =  '<div class="gv-quote-image-holder"><img class="gv-lazy" src="assets/imgs/transparent.gif" data-src="' + imgSrc +  '" data-imgstem="' + imgSrc + '" data-params="' + imgAttr + '" alt="" /></div>';
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
    
              $('.gv-quote-block img').each(function(i, obj) {
        
        var $this = $(this);
        
        var imgStem = $(this).data("imgstem");
        var imgParams = $(this).data("params");
        var imgSrc = getOptimalImage( $this, imgStem, imgParams );
        $this.attr("data-src", imgSrc );
    
});

$(".gv-quote-block-wide-highlighted").removeClass("gv-collapsed");  
    
    
    window.setTimeout(function() {
    updateLazyLoad();
    }, 250);
    
    
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

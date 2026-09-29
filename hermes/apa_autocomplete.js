/***************************** JS & CSS files******************************************/

var base_url_home = "https://fram_ymm.apacatapult.com/";

var css_url=base_url_home+"assets/css/";
var css_array = ['apa_autocomplete_script.css?v=1.15']; //'bootstrap.min.css','font-awesome.min.css',
css_array.forEach(function(val){
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = css_url+''+val;
    document.getElementsByTagName('HEAD')[0].appendChild(link);
});

/************ autocomplete common scripts *******************/
function ApaCapitalize(string){
    return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
}

var apalanguage=['en','es','fr'];
urlINs=window.location;
pathIN = urlINs.pathname.split('/');
var APAcurrlanguage = pathIN[1] != undefined && apalanguage.indexOf(pathIN[1].toLowerCase()) != -1 ? pathIN[1].toLowerCase() :'en';

var landing_url = ''; var redirect_url = '';
var htp_mobile = new XMLHttpRequest();   // new HttpRequest instance
htp_mobile.open("GET",base_url_home+'apa_get_landingurl',true);
htp_mobile.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
htp_mobile.onload = function() {
   if(this.readyState === 4 && this.status === 200) {
      var res = JSON.parse(this.responseText);
      redirect_url = res[0].secure_url;
      landing_url = res[0].landing_url;
      search_html_write();
    }
}
htp_mobile.send();

/*var fdom = "";
fdom ='<div class="container-fluid"><div class="col-md-12"><fieldset class="form-fieldset"><div class="input-group form-group" style="height:35px"><input name="q" style="height:inherit" autocomplete="off"  type="text"  id="apatags" class="form-control search_query_adv form-input" placeholder="Enter Part Type or Part#" onkeyup="myfunction(this.value)"><input class="apa-fa-search" type="submit" value="Search" style="height:inherit" /><div class="apa-ac-main" id="searchsuggestion" style="display:none">' + '<!--<div class="apa-ac-header" id="apa-ac-header">Product Matches</div>-->' + '<div class="apa-ac-products-container APAsearchResult" id="APAsearchResult"></div></div></div></fieldset></div></div>';
document.write(fdom);*/

function ApaAutocompleteLoad(e,f) {
    var t = e;
    if ("" != t && null != t) {
        var a = new XMLHttpRequest;
        a.open("POST", base_url_home + "apa_getclientallglobal"), a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onreadystatechange = function() {

            if(f == 0){
                document.getElementById("apasearchform").action = landing_url; 
                document.getElementById("APAsearchResult").innerHTML = " "   
            }else{
                document.getElementById("apasearchformMob").action = landing_url;    
                document.getElementById("APAsearchResultMob").innerHTML = " "
            }

            if (4 == this.readyState && 200 == this.status) {

              var searchdata = [];
              var comp_searchdata = [];
              var render = '';
              var int_url = '/'+APAcurrlanguage+'/';
              var data = JSON.parse(this.responseText);
              var inputkey = e;
              searchdata = data.ressult;
              comp_searchdata = data.ressult_near;

              if(searchdata.length > 0){
                render +='<div class="APAsubtitle_tp"><div class="APAsubtitle">Exact Match:</div>';
                render +='<div class="APAsubcontent">';
                for (var key in searchdata) {

                     imgurl_in = searchdata[key]['imgurl'];
                     productsku_in = searchdata[key]['productsku'];
                     producttitle_in = searchdata[key]['producttitle'];
                     producturl = searchdata[key]['producturl'];
                     brand = searchdata[key]['brand'];
                     productprice = (searchdata[key]['productprice'] !='' && searchdata[key]['productprice'] !=null) ? searchdata[key]['productprice'] : '1.00';

                    var pattern = new RegExp(inputkey, 'gi');
                    imageurl = (imgurl_in !='' && imgurl_in !=null) ? imgurl_in : base_url_home + 'assets/no-image.jpg';

                    result = producttitle_in.replace(pattern, function (match) {
                      return "<i class='highlightedText' style=\" text-decoration: underline;font-weight: 800;color:#333;\">".concat(match, "</i>");
                    });
                    render +='<a href="'+redirect_url+int_url+producturl+'" target="_parent" tooltip-position="top"><div class="apa-ac-item"><div class="serch_img"><img alt="icon" src="'+imageurl+'"/></div><div class="search_txt"><span class="search_img_title" tooltip-position="top"><p class="apa-item-txt">'+result+'</p></span><span class="search_img_price hidden" ><p class="apa-item-producturl"><span style="font-size:12px;margin-right:2px">$</span>'+productprice+'</p></span></div></div></a>';
                    //render += '<div class="apa-ac-item"><div class="serch_img"><img src="'+imageurl+'" alt="icon"/></div><div class="search_txt"><a class="search_img_title" href="'+redirect_url+int_url+producturl+'" target="_parent" tooltip-position="top" ><p class="apa-item-txt">'+result+'</p></a><a class="search_img_price"><p class="apa-item-producturl">$'+productprice+'</p></a></div></div>';
                    
                }
                render +='</div></div>';
              }

              if(comp_searchdata.length > 0){
                  render +='<div class="APAsubtitle_in"><div class="APAsubtitle">Nearest Match:</div>';
                render +='<div class="APAsubcontent">';
                for (var key in comp_searchdata) {
                     imgurl_in = comp_searchdata[key]['imgurl'];
                     productsku_in = comp_searchdata[key]['productsku'];
                     producttitle_in = comp_searchdata[key]['producttitle'];
                     producturl = comp_searchdata[key]['producturl'];
                     brand = comp_searchdata[key]['brand'];
                     //productprice = comp_searchdata[key]['productprice'];
                     productprice = (comp_searchdata[key]['productprice'] !='' && comp_searchdata[key]['productprice'] !=null) ? comp_searchdata[key]['productprice'] : '1.00';
                    
                    var pattern = new RegExp(inputkey, 'gi');
                    imageurl = (imgurl_in !='' && imgurl_in !=null) ? imgurl_in : base_url_home + 'assets/no-image.jpg';
                    result = producttitle_in.replace(pattern, function (match) {
                      return "<i class='highlightedText' style=\" text-decoration: underline;font-weight: 800;color:#333;\">".concat(match, "</i>");
                    });
                    render +='<a href="'+redirect_url+int_url+producturl+'" target="_parent" tooltip-position="top"><div class="apa-ac-item"><div class="serch_img"><img alt="icon" src="'+imageurl+'"/></div><div class="search_txt"><span class="search_img_title" tooltip-position="top"><p class="apa-item-txt">'+result+'</p></span><span class="search_img_price hidden"><p class="apa-item-producturl"><span style="font-size:12px;margin-right:2px">$</span>'+productprice+'</p></span></div></div></a>';
                    //render += '<div class="apa-ac-item"><div class="serch_img"><img src="'+imageurl+'" alt="icon"/></div><div class="search_txt"><a class="search_img_title" href="'+redirect_url+int_url+producturl+'" target="_parent" tooltip-position="top" ><p class="apa-item-txt">'+result+'</p></a><a class="search_img_price"><p class="apa-item-producturl">$'+productprice+'</p></a></div></div>';
                    
                }
                render +='</div></div>';
              }

              if(searchdata.length == 0 && comp_searchdata.length == 0){
                render +='<div class="APAsubtitle_tp"><div class="APAsubcontent"><p style="padding: 10px 5px;margin-bottom: 0px;">There is no matches found!</p></div></div>';
              }

                if(f == 0){
                      document.getElementById("apatags").style.borderColor='#ddd';
                      document.getElementById('searchsuggestion').style.display ='block';
                      document.getElementById('APAsearchResult').innerHTML =render;
                }else{
                    document.getElementById("apatagsMob").style.borderColor='#ddd';
                    document.getElementById('searchsuggestionMob').style.display ='block';
                    document.getElementById('APAsearchResultMob').innerHTML =render;
                }


              var vv = document.getElementsByClassName("APAsubtitle_tp");
              var vi = document.getElementsByClassName("APAsubtitle_in");
              //console.log(vv,window.innerWidth);
              if(comp_searchdata.length > 0 && window.innerWidth > 1080){
                 /*(vv[0] !=undefined)? vv[0].style.width='50%' :'';
                 vi_width = (searchdata.length > 0 && vi[0] !=undefined)? '50%' : '100%' ;*/
                 (vv[0] !=undefined)? vv[0].style.width='100%' :'';
                 vi_width = (searchdata.length > 0 && vi[0] !=undefined)? '100%' : '100%' ;
                 vi[0].style.width=vi_width;
              }else{
                (vv[0] !=undefined)? vv[0].style.width='100%' :'';
                (vi[0] !=undefined)? vi[0].style.width='100%' :'';
              }




            }
        }, a.send("search_key=" + t)
    }else{
        if(f == 0){
              document.getElementById("APAsearchResult").innerHTML = "";
            document.getElementById("searchsuggestion").style.display = "none";
        }else{
            document.getElementById("APAsearchResultMob").innerHTML = "";
            document.getElementById("searchsuggestionMob").style.display = "none";
        }
    } 
}

function validateApaAutocomplete(f) {
    urlIN=new URL(landing_url);
    landingpage_url = urlIN.protocol+'//'+urlIN.hostname+'/'+APAcurrlanguage+urlIN.pathname;

    if(f == 0){
        document.getElementById("apasearchform").action = landingpage_url;
        var e = document.getElementById("apatags");
        return "" == e.value ? (e.style.borderColor = "red", event.preventDefault(), !1) : (e.style.borderColor = "#ddd", !0)
    }else{
        document.getElementById("apasearchformMob").action = landingpage_url;
        var e = document.getElementById("apatagsMob");
        return "" == e.value ? (e.style.borderColor = "red", event.preventDefault(), !1) : (e.style.borderColor = "#ddd", !0)
    }
}
function search_html_write() {

 fdom = `<div class="APAsection apa_home_search_block">`;
 fdom += `<form class="form apasearchform" id="apasearchform"  action="` + landing_url + `" onsubmit="validateApaAutocomplete(0)">`;
 fdom += `<div class="APAform-field">
                        <div class="APAinput-group">
                            <input type="hidden" name="typeofsearch" value="1"/>
                            <input name="search_query_adv" style="height:inherit" autocomplete="off"  type="text" id="apatags" class="APAform-control search_query_adv apatags form-input" placeholder="Search by FRAM/Competitor PN" >
                            <!--<input class="apa-fa-search" type="submit" value="Search" style="height:inherit" />-->
                            <button class="apa-fa-search fa fa-search" type="submit" value="submit"></button>
                            <div class="apa-ac-main searchsuggestion" style="display:none">
                                <div class="apa-ac-products-container APAsearchResult" id="APAsearchResult" style="display:none;"></div>
                            </div>
                        </div>`;
  fdom += "</div></form></div>";
  if(document.getElementById("apa_autoComplete") != undefined){
    document.getElementById("apa_autoComplete").innerHTML = fdom;
  }
 

 fdom = `<div class="APAsection apa_home_search_block">`;
 fdom += `<form class="form apasearchform" id="apasearchformMob"  action="` + landing_url + `" onsubmit="validateApaAutocomplete(1)">`;
 fdom += `<div class="APAform-field">
                        <div class="APAinput-group">
                            <input type="hidden" name="typeofsearch" value="1"/>
                            <input name="search_query_adv" style="height:inherit" autocomplete="off"  type="text" id="apatagsMob" 
                            class="APAform-control search_query_adv apatags form-input" placeholder="Enter Part Title or SKU" 
                            >
                            <!--<input class="apa-fa-search" type="submit" value="Search" style="height:inherit" />-->
                            <button class="apa-fa-search fa fa-search" type="submit" value="submit"></button>
                            <div class="apa-ac-main searchsuggestion" style="display:none">
                                <!--<div class="apa-ac-header" id="apa-ac-header">Product Matches</div>-->
                                <div class="apa-ac-products-container APAsearchResult" id="APAsearchResultMob" style="display:none;"></div>
                            </div>
                        </div>`;
  fdom += "</div></form></div>";
 //document.getElementById("apa_autoComplete_mobile").innerHTML = fdom;


}

/*document.onclick = function(e){
    if(e.target.id != undefined && e.target.id != null && e.target.id != 'searchsuggestion'){
         document.getElementById('searchsuggestion').style.display ='none';  
    }
    //if(e.target.id != 'searchsuggestionMob'){
         //document.getElementById('searchsuggestionMob').style.display ='none';  
    //}
};*/



var css_url=base_url_home+"assets/css/";
var css_array = ['apa_embeded_script.css?v=1.30'];
css_array.forEach(function(val){
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = css_url+''+val;
    document.getElementsByTagName('HEAD')[0].appendChild(link);
});

let ConvertStringToHTMLin = function (dom) {
   dom.innerHTML = dom.innerText;
};

/************ embeded widget Fitment Match and Fitment Compatability scripts *******************/
if(document.querySelector("input[name='product_id']").value != '' && document.querySelector("input[name='product_id']").value != undefined){
    var fitapp = angular.module('FitmentApp', []);
    fitapp.config(function($interpolateProvider) {
      $interpolateProvider.startSymbol('{[{');
      $interpolateProvider.endSymbol('}]}');
    });
    fitapp.controller('FitmentController', function($scope,$http,$timeout,$window,$filter,$compile) { 
        $scope.base_url = base_url_home;
        $scope.fitmentMatch_config_items = [];
        $scope.urlFitments = {};
      
        var pdptitle = document.querySelector("h1.page-title .base");
        (pdptitle != undefined) ? ConvertStringToHTMLin(pdptitle) : '';
        setTimeout(function(argument) {  
        var breadcrumbs = document.querySelector(".item.product strong");
          (breadcrumbs != undefined) ? ConvertStringToHTMLin(breadcrumbs) : '';
        },500);

        var productid = document.querySelector("input[name='product_id']").value;
        var productsku = document.querySelector("input[name='apa-product-sku']").value;

        $http({
          method  : 'GET',url     : $scope.base_url+"apa_product_ymmfield",
          headers: {'Content-Type':'application/x-www-form-urlencoded'}
        })
        .then(function(response) {
                $scope.FMFielditems =response.data.result; $scope.fitmentMatchTrigger();
        });
        $scope.getfitment_match_config = function(){
            $http({
                method  : 'GET', 
                url : $scope.base_url+"apa_product_config",
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            })
            .then(function(response) {
                  $scope.fitmentMatch_config_items =response.data.result[0];
                  matchC = $scope.fitmentMatch_config_items;
                  $scope.FMatch_mtf = matchC.match_to_fields;
                  $scope.fitmentMatch_prefix = matchC.match_prefix;
                  $scope.fitmentMatch_anchor = matchC.match_anchor;
                  $scope.fitmentMatch_separator = matchC.match_separator;
                  $scope.fitmentMatch_eft = matchC.match_enable;
                  if($scope.fitmentMatch_eft == 1){
                    dom = '<div class="APAsection apa-fitmentmatch" style="box-shadow: 0px 0px 8px 2px rgb(206, 206, 206);"><span class="apa-fitment-icon"><i class="fa fa-check-circle"></i></span>';
                    if(matchC.match_prefix !=''){
                       dom += '<span class="apa-fitment-prefix">'+matchC.match_prefix+' :</span>';
                    }
                    dom += '<span class="apa-fitment-criteria">';
                    l = 0;
                    angular.forEach($scope.FMFielditems, function (value, key) {
                        if(value.visible ==0 && value.fit_match_visible ==0 
                          && $scope.urlFitments[value.field_name] !='' 
                          && $scope.urlFitments[value.field_name] != undefined
                          ){
                          if(l > 0){
                            dom += '<span class="fitment-match-delimiter fitment-field">'+matchC.match_separator+'</span>'; 
                          }
                            dom += '<span class="fitment-match-field fitment-field">'+$scope.urlFitments[value.field_name]+'</span>';
                          l++;	
                        }
                    });
                    dom += '</span></div>';
                    //$(matchC.match_anchor).prepend(dom);
                    angular.element(document.querySelector(matchC.match_anchor)).prepend($compile(dom)($scope));
                    //preview block
                    angular.element(document.querySelector(".apa-fitmentmatch")).css({'background-color':matchC.match_bg_color});
                    angular.element(document.querySelector(".apa-fitmentmatch .apa-fitment-prefix")).css({'color':matchC.match_font_color});
                    angular.element(document.querySelector(".apa-fitmentmatch .apa-fitment-criteria")).css({'color':matchC.match_font_color});
                    angular.element(document.querySelector(".apa-fitment-icon .fa")).css({'color':matchC.match_check_color});
                    /*$('.apa-fitmentmatch').css({'background-color':matchC.match_bg_color});
                    $('.apa-fitmentmatch .apa-fitment-prefix').css({'color':matchC.match_font_color});
                    $('.apa-fitmentmatch .apa-fitment-criteria').css({'color':matchC.match_font_color});
                    $('.apa-fitment-icon .fa').css({'color':matchC.match_check_color});*/
                }




            });
        };
        $scope.fitmentMatchTrigger =function(){
          if(window.location.href.split('?')[1] != undefined && window.location.href.split('?')[1] != ''){
            var urlis = decodeURI(window.location.href).split('?');
            cnt = 0; fmcnt = 0;
            angular.forEach($scope.FMFielditems, function (value, key) {
                (value.visible ==0 && value.fit_match_visible ==0 && value.mandatory ==1 )? fmcnt++ :'';
                (urlis[1].indexOf(value.field_name+'=') !== -1)? cnt++:'';
            });
            if(cnt > 0 && cnt >= fmcnt){
              var getdata = urlis[1].split('&');
              getdata.map((res,rkey)=>{
                  if(res.split('=').length > 1){
                    ret = decodeURIComponent(res.split('=')[1].replace('**','/')).split('+').join(' ');
                    retkey = decodeURIComponent(res.split('=')[0].replace('**','/')).split('+').join(' ');
                    (ret.toLowerCase() != 'any '+retkey.toLowerCase())? $scope.urlFitments[retkey] = ret :'';
                  }
                  //console.log($scope.urlFitments,rkey,getdata.length);
                  if(rkey == (getdata.length-1)){
                    $scope.getfitment_match_config();
                  }  
              });
            }
          }
        };

         //installation instruction ymm
      $scope.fitmatQuery_CA = [];
      $scope.ymmval_home_CA = {};
      $scope.ymm_names_CA = []; $scope.ymm_fielditems_CA = []; $scope.ymm_partitems_CA = {};
      $scope.ymmhead_CA ={'en':'Part Search for Video Instructions','es':'Parte Búsqueda de Video Instrucciones','fr':'Recherche de pièces pour les instructions vidéo'};
      $scope.ymmbtn_CA  ={'en':'Search','es':'Búsqueda','fr':'Recherche'};
      $scope.language_CA=['en','es','fr'];
      $scope.stcontent = {'en' : "Enter your YEAR, MAKE, MODEL or FRAM part number, and we'll begin searching our database for compatible parts.",
'es' :"Ingrese su número de pieza A�?O, MARCA, MODELO o FRAM, y comenzaremos a buscar en nuestra base de datos las piezas compatibles.",
'fr':"Entrez votre numéro de pièce YEAR, MAKE, MODEL ou FRAM, et nous commencerons à chercher dans notre base de données les pièces compatibles."};

      urlIN=window.location;
      pathIN = urlIN.pathname.split('/');
      $scope.currlanguage_CA = pathIN[1] != undefined && $scope.language_CA.indexOf(pathIN[1].toLowerCase()) != -1 ? pathIN[1].toLowerCase() :'en';
      $scope.ymmname_CA = function(field,name) {
         fieldname = name;
        if($scope.currlanguage_CA == 'en'){
          fieldname = $scope.ymm_names_CA[field]['name'];
        }else if($scope.currlanguage_CA =='es'){
          fieldname = $scope.ymm_names_CA[field]['name_es'];
        }else if($scope.currlanguage_CA =='fr'){
          fieldname = $scope.ymm_names_CA[field]['name_fr'];
        }
        return fieldname;
      };
      $scope.ymmval_CA  = function(field,name,val) {
         fieldname = val;
         if(val.toLowerCase() == 'any '+name.toLowerCase()){
            if($scope.currlanguage == 'en'){
              fieldname = $scope.any['en']+' '+$scope.ymm_names[field]['name'];
            }else if($scope.currlanguage =='es'){
              fieldname = $scope.any['es']+' '+$scope.ymm_names[field]['name_es'];
            }else if($scope.currlanguage =='fr'){
              fieldname = $scope.any['fr']+' '+$scope.ymm_names[field]['name_fr'];
            }
         }
        return fieldname;
      };
      $scope.ymm_header_CA = function(eve,name) {
        fieldname = name;
        if(eve == 'head'){
          fieldname = $scope.ymmhead_CA[$scope.currlanguage_CA];
        }else if(eve =='btn'){
          fieldname = $scope.ymmbtn_CA[$scope.currlanguage_CA];
        }
        return fieldname;
      };
      $scope.stcbind = function() {
        return $scope.stcontent[$scope.currlanguage];
      }

      //var productsku = document.querySelector("input[name='apa-product-sku']") != undefined ? document.querySelector("input[name='apa-product-sku']").value : '';


      $scope.clearVehicle = function() {
      $scope.fitmatQuery_CA = [];
      $scope.ymm_app ='';
      $scope.ymmval_home_CA = {};
      $scope.ymm_partitems_CA = {};
      radio = document.querySelectorAll('.ymm-app-radio');
      };
     $scope.changeVehicle = function() {
      $scope.fitmatQuery_CA = [];
     };
     $scope.decoding = function(data) {
        return (data !='') ? decodeURIComponent(data) : '';
     };

      $scope.getewd_ymm_val_CA =function(field,order,sort,name,call){
        
        emptyflagCA = 0; reqCA_field = field; reqCA_field_name = name; reqCA_field_sort = sort; reqCA_order = order;
        //console.log('here',reqCA_field,reqCA_order,reqCA_field_sort,reqCA_field_name,call);
        if($scope.lastorderval_CA != order || call == 'init'){
          if(call !='init'){
            //console.log('ibbas')
             reqflagCA = 0;
            angular.forEach($scope.ymm_names_CA, function (value, key) {
              if(emptyflagCA > 0){
                  if(reqflagCA == 0 && value.type <=0){
                    reqCA_field = key; reqCA_field_sort = value.sort; reqCA_order = value.order;
                    reqCA_field_name = value.name;
                    reqflagCA++;
                  }
                  $scope.ymmval_home_CA[key] = ''; $scope.ymm_partitems_CA[key] = '';
                  emptyflagCA++;
                }
                (field == key && emptyflagCA ==0 )? emptyflagCA = 1:'';
            });
          }
          //console.log('here1',reqCA_field,reqCA_order,reqCA_field_sort,reqCA_field_name,call);
          if($scope.ymmval_home_CA[field] !='' || call == 'init'){
            //$scope.ymmval_home_CA[$scope.ymm_app_field] = $scope.ymm_app;
            $http({
               method  : 'POST', data    : {order:reqCA_order,field:reqCA_field,field_sort:reqCA_field_sort,condition:$scope.ymmval_home_CA,sku:productsku},
                 url     : $scope.base_url+"apa_ymmwidget_getfield_ca",
               headers: {'Content-Type':'application/x-www-form-urlencoded'}
            })
            .then(function(response) {

                result =response.data.result;
                $scope.ymm_partitems_CA[reqCA_field] = (result.length == 1 && result[0]['val'] =='')? []: result;
                //console.log('here2',reqCA_field,reqCA_order,reqCA_field_sort,reqCA_field_name,call);
                //console.log($scope.ymm_partitems_CA,'response');
                if($scope.ymm_partitems_CA[reqCA_field].length == 1){ 
                  $scope.ymmval_home_CA[reqCA_field] = result[0]['val'];
                  $scope.getewd_ymm_val_CA(reqCA_field,reqCA_order,reqCA_field_sort,reqCA_field_name,'');
                }  
            });
          }
        }
      };
      $scope.findparts = function(element){

        var mandatory_arr =[]; var selected_arr =[]; ymmarr = {};
        Object.keys($scope.ymm_names_CA).filter((val) => {
          if($scope.ymm_names_CA[val].mandatory == 1 && $scope.ymm_names_CA[val].type <=0){ mandatory_arr.push(val); }
        });
        cnt = 0;
        angular.forEach($scope.ymmval_home_CA, function (value, key) { (value !='')?cnt++:''; });
        if(cnt > 0){
          url_forming = ''; i = 0;
          angular.forEach($scope.ymm_names_CA, function (value, key) {
            if(value.type <=0 ){ //|| key == $scope.ymm_app_field
              selected_arr.push(key);
              ($scope.ymmval_home_CA[key] !=undefined && $scope.ymmval_home_CA[key] !='')? ymmarr[value.name.toLowerCase()] = $scope.ymmval_home_CA[key].trim() :'';
              /*if(i ==0){
                selected_arr.push(key);
                url_forming +=value.name+'='+encodeURIComponent($scope.ymmval_home_CA[key]);
              }else if($scope.ymmval_home_CA[key] !='' && $scope.ymmval_home_CA[key] != undefined){
                selected_arr.push(key);
                url_forming +='&'+value.name+'='+encodeURIComponent($scope.ymmval_home_CA[key]);
              }
              i++;*/
            }
          });
          //Year Make validation
          var combine_arr = [mandatory_arr,selected_arr];
          var res = combine_arr.reduce((p,c) => p.filter(e => c.includes(e)));
          if(mandatory_arr.length == res.length){
            //$scope.garage_store();

            addEventListener('ymmWidget',function(e) {
              console.log(e.detail);
            }, {once : true});

            const ymmWidgetEvent = new CustomEvent('ymmWidget',{detail:ymmarr,bubbles:true});
            //const ymmForm = document.getElementById('ymmGetInfoForm');
            dispatchEvent(ymmWidgetEvent);
          }         
        }
      };

      
      $scope.installation_widget = function(){
        $http({
            method  : 'POST',
            data:{sku:productsku},
            url     : $scope.base_url+"apa_ymmwidget_field_ca",
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        })
        .then(function(response) {
          $scope.ymm_fielditems_CA =response.data.result;
          //console.log(response.data.iscab[0],response.data.iscab[0]['parttype'],'sdsd');
          $scope.iscab = response.data.iscab[0] != undefined && response.data.iscab[0]['parttype'] != undefined ? response.data.iscab[0]['parttype'] : '';

          temp = {}; $scope.get_field_sort = ''; $scope.get_field = ''; $scope.get_field_name=''; tfag = 0;  $scope.get_order='';
          $scope.ymm_app_field = '';
          angular.forEach($scope.ymm_fielditems_CA, function (value, key) {
               //if(['year','make','model','engine'].indexOf(value.field_name.toLowerCase()) != -1){
                  if(tfag == 0){
                    $scope.get_field = value.field_no;
                    $scope.get_order = value.order;
                    $scope.get_field_sort = value.sort;
                    $scope.get_field_name = value.field_name;
                    tfag++;
                  }
                  temp[value.field_no] = {'name':value.field_name,'name_es':value.name_es,'name_fr':value.name_fr,'order':value.order,'sort':value.sort,'type':value.type,'visible':value.visible,'mandatory':value.mandatory} ;
                  $scope.ymmval_home_CA[value.field_no] = '';
                  $scope.ymm_partitems_CA[value.field_no] = [];
                  $scope.lastorderval_CA = value.order;
              //}
          });
          $scope.ymm_names_CA = temp;
          $scope.getewd_config_CA();
          //$scope.getewd_ymm_val_CA(get_field,get_order,get_field_sort,'init');
          $scope.getewd_ymm_val_CA($scope.get_field,$scope.get_order,$scope.get_field_sort,$scope.get_field_name,'init');
        });
      };

      $scope.ymm_app ='';
      $scope.getewd_config_CA = function(){
          $scope.ewd_setsdlab = 0;
          $scope.ewd_setsht = 1;
          $scope.ewd_setdwt = 'select';
          $scope.ewd_sethom = 0;
          $scope.ewd_setuew = 1;
        if($scope.ewd_setuew == 1){
          if($scope.ewd_sethom == 0 || ($scope.ewd_sethom == 1 && window.innerWidth > 768)){
            //
            dom = `<div class="APAcol-md-12" id="ewd_setbg_blk_CA" ng-if="visible_widget > 0 && fitmentdata.length > 0"> 
                    <dl>
                    <style>
                    #APAymmCA{padding-bottom:20px;padding-top:20px}
                   #ewd_setbg_blk_CA p {color: #555;
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 12px;
    font-style: italic;
    font-weight: 500;}
                    </style>
                    <p><em>Available written instructions for this product and some applications are below.</em></p>
<p><em>Instructions may not exactly match your vehicle.</em></p>
<p><em>For best experience, please use video instructions where applicable.</em></p>
                </dl>
                    <form id="ymmGetInfoForm" name="ymmGetInfoForm">
                    <div  id="apa-upper-embed_CA" class="APArow apa-upper-embed" >
                      <div class=" text-center" id="apa-search-header" ng-show="ewd_setsht" >
                        <h2 class="ymmHead" ng-if="fitmatQuery_CA.length == 0" ng-bind="ymm_header_CA('head','Part Search For Video Instruction')" >Part Search For Video Instruction</h2>
                      </div>`;
              dom +=`<div class="" ng-if="fitmatQuery_CA.length > 0">
                      <span class="SelectedHead">Your Selection</span> <span class="SelectedfitmatQuery_CA" ng-repeat="data in fitmatQuery_CA" ng-bind="decoding(data)"></span><span class="changeVehicle" ng-click="changeVehicle()">Change</span>
                      </div>
                      `;
              dom += `<div ng-repeat="(key,data) in ymm_names_CA" ng-if="data.type <= 0 && data.visible == 0 && fitmatQuery_CA.length == 0" class="apa-year-wrapper apa-selection-wrapper">
                          <label class="apa-label" ng-if="ewd_setsdlab == 1"></label>
                          <select id="{[{key}]}-select_CA" ng-disabled="ymm_partitems_CA[key] =='' || ymm_partitems_CA[key] ==undefined || ymm_partitems_CA[key].length == 1" ng-class="{'disabled':(ymm_partitems_CA[key] =='' || ymm_partitems_CA[key] ==undefined)}" name="{[{key}]}-select_CA" ng-model="ymmval_home_CA[key]" class="{[{key}]}-select_CA apa-select" data-field="{[{key}]}" ng-change="getewd_ymm_val_CA(key,data.order,data.sort,data.name,key)">
                            <option value="" ng-disabled="ymm_partitems_CA[key].length == 1" class="reset_{[{key}]}" ng-bind="ymmname_CA(key,data.name)">{[{data.name}]}</option>
                            <option value="{[{indata.val}]}" ng-repeat="(inkey,indata) in ymm_partitems_CA[key]" ng-bind="ymmval_CA(key,data.name,indata.val)">{[{indata.val}]}</option>
                          </select>
                        </div>
                        <div class="apa-search-icon-wrapper show" ng-if="fitmatQuery_CA.length == 0">
                          <span class="APAbtn APAbtn-sm" id="ymmGetInfo" ng-click="findparts($event)" ng-bind="ymm_header_CA('btn','Search')">Search</span>
                        </div>
                      </div>
                      </form>
                    </div>`;
                   //APAymmCA
                   //console.log($scope.urlFitments,'asfasfasf');
                   $scope.visible_widget = 1;
                   if($scope.iscab.toLowerCase() =='cabin air filter' && document.querySelector('#APAymmCA') !=undefined){
                       angular.element(document.querySelector('#APAymmCA')).append($compile(dom)($scope));
                       if(Object.keys($scope.urlFitments).length > 0){
                          $scope.visible_widget = 0;
                          angular.forEach($scope.ymm_names_CA, function (value, key) {
                              ($scope.urlFitments[value.name] !=undefined && $scope.urlFitments[value.name] !='')? $scope.ymmval_home_CA[key] = $scope.urlFitments[value.name] : '';
                          });
                          //console.log($scope.ymmval_home_CA,'sdf132434');
                          $scope.findparts();
                       }
                   }
            
          }
        }
      };

     

      

 //installation instruction end
      
//compatability grid functions
        $scope.fitmentComp_config_items = [];
        var APAcgroup = '';//document.getElementById("APAcustomer_group").value;
        var APAcgroupid = '';//document.getElementById("APAcustomer_group_id").value;
        $scope.APAcustomer_group_id =  (APAcgroupid !='' && APAcgroupid != undefined) ? APAcgroupid :'';

        $http({
            method  : 'POST', url     : $scope.base_url+"apa_product_fitment_config",
            data    : { 'product_id':productid,'productsku':productsku,'default_customer_group':$scope.APAcustomer_group_id},
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        })
        .then(function(response) {
            $scope.fitmentComp_config_items =response.data.result[0];
            compC = $scope.fitmentComp_config_items;
            $scope.FComp_dfields = compC.display_fields;
            $scope.fitmentComp_head = compC.compatibility_heading;
            $scope.fitmentComp_subhead = compC.compatibility_sub_heading;
            $scope.fitmentComp_eft = compC.compatibility_enable;
            $scope.fitmentComp_anchor = compC.compatibility_anchor;
            
            //preview block
            if($scope.fitmentComp_eft == 1){
              $scope.fitmentdata = [];
              //var productid = document.querySelector("input[name='product_id']").value;
              $http({
                    method  : 'POST', url     : $scope.base_url+"apa_product_fitment",
                    data    : {'product_id':productid,'productsku':productsku}, headers: {'Content-Type':'application/x-www-form-urlencoded'}
              })
              .then(function(response) {   
                 $scope.fitmentdata=response.data;
                 //call installation widget
                 $scope.installation_widget();

                 dom = `<div class="APAsection" >
                          <div class="apa-fitment-compatibility-wrapper">
                            <div ng-if="fitmentdata.length > 0" id="apa-fitment-compatibility-table-wrapper" class="table-responsive">
                              <h4 style="text-transform:capitalize" ng-if="fitmentComp_head !=''">{[{fitmentComp_head}]}</h4>
                              <p class="mb-3" ng-if="fitmentComp_subhead !=''">{[{fitmentComp_subhead}]}:</p>

                              <table class="APAtable" id="apa-fitment-compatibility-table" style="border-radius: 1px;"><thead><tr style="background-color:${compC.header_bg_color};color:${compC.header_font_color}"><th class="fitment-field curser_pt" ng-repeat="data in FMFielditems" ng-click="sortBy(data.field_no)" ng-if="data.fitment_visible==0 && data.visible==0" class="curser_pt" >{[{data.field_name}]}</th></tr></thead><tbody class="filterRow" ><tr><td class="fitment-field" ng-repeat="(key,data) in FMFielditems" ng-if="data.fitment_visible==0 && data.visible==0" ><input class="inputsearch APAform-control input-size-sm" type="text" ng-model="fitval" id="{[{data.field_no}]}" ng-change="fitsearch('{[{data.field_no}]}')" value="" placeholder="Search {[{data.field_name}]}" /></td></tr></tbody><tbody><tr style="background-color:${compC.tbody_bg_color};color:${compC.tbody_font_color}" ng-repeat="(key, item) in pagedItems[currentPage] | orderBy:sortKey:reverse | filter:search"><td class="fitment-field" ng-repeat="(keys,data) in FMFielditems" ng-if="data.fitment_visible==0 && data.visible==0" > {[{item[data.field_no]}]}</td></tr></tbody>
                              </table>
                            </div>
                            <div class="apa-compat-pagination-wrapper">
                              <div class="top-pagin pagi_master APAcol-sm-12" ng-if="pagenos.length >= 1 "><div class="pull-left"><span class="page-num ng-binding">Page {[{currentPage+1}]} of {[{pagedItems.length}]}</span></div><div class="pull-right"> <a class="APAbtn APAbtn-primary prevPage" ng-class="(currentPage==0) ? 'APAhidden' : 'APAshow'" href ng-click="prevPage()">« Prev</a><ul ng-if="pagenos.length > 1 "><li ng-repeat="n in pagenos | limitTo:5" ng-class="{active: n == currentPage}" ng-click="setPage()"> <a href ng-bind="n + 1">1</a></li></ul> <a class="APAbtn APAbtn-primary nextPage" ng-class="(currentPage==(pagedItems.length - 1)) ? 'APAhidden' : 'APAshow'" href ng-click="nextPage()">Next »</a></div>
                              </div>
                            </div>
                            <p class="" ng-if="pagedItems.length == 0">No data found</p>
                          </div>
                        </div>`;
                 //$($scope.fitmentComp_anchor).append($compile(dom)($scope)); 
                 angular.element(document.querySelector('#apa_tab_appln')).append($compile(dom)($scope));
                 $scope.paginationftn2($scope.fitmentdata);
              });
             
          /*Interchange Part#*/
          $scope.interchangedata = [];
          //var Interproductsku = document.querySelector("input[name='apa-product-sku']").value;
          $http({
            method  : 'POST',url     : $scope.base_url+"apa_product_interchange",
            data    : {'prod_sku':productsku},
            headers : {'Content-Type':'application/x-www-form-urlencoded'}
          })
          .then(function(response) {               
            if (1) { // here check response is null or not
              $scope.interchangedata=response.data;
              interchangeDom = `
                            <div class="APAsection" ng-if="inter_pagedItems.length >= 0">
                              <div class="apa-fitment-compatibility-wrapper">
                                <!--<h4 style="text-transform:capitalize">Interchange</h4>-->
                                <div ng-if="interchangedata.length > 0" id="apa-fitment-compatibility-table-wrapper" class="table-responsive">
                                  <table class="APAtable" id="apa-fitment-compatibility-table" style="border-radius: 1px;">
                                    <thead>
                                      <tr style="background-color:${compC.header_bg_color};color:${compC.header_font_color}">
                                        <th class="fitment-field curser_pt" ng-click="inter_sortBy('interchange_brand')" class="curser_pt">COMPETITOR NAME</th>
                                        <th class="fitment-field curser_pt" ng-click="inter_sortBy('interchange')" class="curser_pt">COMPETITOR PART #</th>
                                      </tr>
                                    </thead>
                                    <tbody class="filterRow" >
                                      <tr>
                                        <td class="fitment-field"><input class="inputsearch APAform-control input-size-sm" type="text" ng-model="intersearch.brand" id="" ng-change="inter_fitsearch('interchange_brand','brand')" value="" placeholder="Search Brand" /></td>
                                        <td class="fitment-field"><input class="inputsearch APAform-control input-size-sm" type="text" ng-model="intersearch.inter" id="" ng-change="inter_fitsearch('interchange','inter')" value="" placeholder="Search Interchange" /></td>
                                      </tr>
                                    </tbody>
                                    <tbody>
                                      <tr style="background-color:${compC.tbody_bg_color};color:${compC.tbody_font_color}" ng-repeat="(key, data) in inter_pagedItems[inter_currentPage] | orderBy:inter_sortKey:inter_reverse | filter:search" >
                                        <td class="fitment-field"> {[{data.interchange_brand}]}</td>
                                        <td class="fitment-field"> {[{data.interchange}]}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div class="apa-compat-pagination-wrapper">
                                  <div class="top-pagin pagi_master APAcol-sm-12" ng-if="inter_pagenos.length >= 1 ">
                                    <div class="pull-left">
                                      <span class="page-num ng-binding">Page {[{inter_currentPage+1}]} of {[{inter_pagedItems.length}]}</span>
                                    </div>
                                    <div class="pull-right">
                                      <a class="APAbtn APAbtn-primary prevPage" ng-class="(inter_currentPage==0) ? 'APAhidden' : 'APAshow'" href ng-click="inter_prevPage()">« Prev</a>
                                      <ul ng-if="inter_pagenos.length > 1 ">
                                        <li ng-repeat="n in inter_pagenos | limitTo:5" ng-class="{active: n == inter_currentPage}" ng-click="inter_setPage()"> <a href ng-bind="n + 1">1</a></li>
                                      </ul>
                                      <a class="APAbtn APAbtn-primary nextPage" ng-class="(inter_currentPage==(inter_pagedItems.length - 1)) ? 'APAhidden' : 'APAshow'" href ng-click="inter_nextPage()">Next »</a>
                                    </div>
                                  </div>
                                </div>
                                <p class="" ng-if="inter_pagedItems.length == 0">No data found</p>
                              </div>
                            </div>`;                  
              //angular.element(document.querySelector($scope.fitmentComp_anchor)).append($compile(interchangeDom)($scope));
              angular.element(document.querySelector('#apa_tab_compare')).append($compile(interchangeDom)($scope));
              $scope.inter_paginationftn2($scope.interchangedata);
            }else{

            }
          });
          /*Interchange Part# End*/


              /*installation instruction#*/
                  /*$scope.installation = [];
                  $http({
                    method  : 'POST',url     : $scope.base_url+"apa_product_installation",
                    data    : {'prod_sku':productsku},
                    headers : {'Content-Type':'application/x-www-form-urlencoded'}
                  })
                  .then(function(response) {               
                    if (1) { // here check response is null or not
                      $scope.installation=response.data;
                      interchangeDom = `
                                    <div class="APAsection" ng-if="installation.length >= 0">
                                      <div class="apa-fitment-compatibility-wrapper">
                                        <!--<h4 style="text-transform:capitalize">installation instruction</h4>-->
                                        <div id="apa-fitment-compatibility-table-wrapper" class="">
                                            <ul ng-if="installation.length > 0" style="list-style: none;">
                                              <li ng-repeat="data in installation" >{[{data.val}]}</li>
                                            </ul>
                                            <p class="" ng-if="installation.length == 0">No data found</p>
                                        </div>
                                      </div>
                                    </div>`;                  
                      angular.element(document.querySelector('#apa_tab_install')).append($compile(interchangeDom)($scope));
                    }else{

                    }
                  });*/
                  /*installation instruction# End*/
            }
        });

        $scope.itemsPerPage =10; $scope.sortingOrder = ''; $scope.reverse = false;
        $scope.paginationftn2 = function(items){
          $scope.nodata = false; $scope.filteredItems = []; $scope.groupedItems = []; $scope.pagedItems = []; $scope.pagenos = [];
          $scope.currentPage = 0; $scope.compdata = items;
          //pagination part start
          $scope.sortBy = function(propertyName) {
            $scope.sortKey = propertyName;   //set the sortKey to the param passed
            $scope.reverse = ($scope.sortKey === propertyName) ? !$scope.reverse : false;
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortKey, $scope.reverse);
            $scope.pagedItems = []; 
            $scope.groupToPages();
          };      
          var searchMatch = function (haystack, needle) {
            if (!needle) { return true;}
            if(haystack !== null){ return haystack.toString().toLowerCase().indexOf(needle.toString().toLowerCase()); }
          };
          // *****************init the filtered items*****************
          $scope.mysearch = function () {
              $scope.filteredItems = $filter('filter')($scope.compdata, function (item) {
                  if(item.field_6 != '') { if (searchMatch(item.field_6, $scope.query)  > -1){ return true; } }
                  return false;
              });
              if ($scope.sortingOrder !== '') { $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse); }
              $scope.currentPage = 0; $scope.groupToPages();
          };
          $scope.fitsearch = function (fieldno) {
              if($scope.fieldprev){ $scope.fieldcurr = fieldno;                            
              }else{
                $scope.fieldprev = fieldno;$scope.fieldcurr = fieldno;
              }
              if($scope.fieldprev != $scope.fieldcurr){
                //$('#'+$scope.fieldprev).val(''); 
                document.querySelector('#'+$scope.fieldprev).value='';
                $scope.fieldprev = fieldno;
              }
              query = this.fitval; 
              $scope.filteredItems = $filter('filter')($scope.compdata, function (item) {
                  if(item[fieldno] != '') { if (searchMatch(item[fieldno], query)  > -1){ return true; } }
                  return false;
              });
              if ($scope.sortingOrder !== '') { $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse); }
              $scope.currentPage = 0; $scope.groupToPages();
          };
          // *****************finish the filtered items*****************//
          $scope.groupToPages = function () {
            $scope.pagedItems = [];
            if($scope.filteredItems !=null){
              for (var i = 0; i < $scope.filteredItems.length; i++) {
                if (i % $scope.itemsPerPage === 0) {
                  $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
                } else {
                  $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                }
              }
            }
            $scope.range($scope.pagedItems.length);
            $scope.$applyAsync();
          };
          $scope.range = function (start, end) {
              var ret = [];
              if (!end) {
                  end = start; start = 0;
              }
              for (var i = start; i < end; i++) {
                  ret.push(i);
              }
              $scope.pagenos = ret;
              return ret;
          };
                      
          $scope.prevPage = function () {
              if ($scope.currentPage > 0) { $scope.currentPage--; }
          };
          $scope.nextPage = function () {
              if ($scope.currentPage < $scope.pagedItems.length - 1) { $scope.currentPage++; }
          };
          $scope.setPage = function () {
              $scope.currentPage = this.n;
          };
          $scope.mysearch();
          $scope.$watch('currentPage', function(pno,oldno){
              start =  (pno-2 > -1)? pno-2:0;
              $scope.range(start, $scope.pagedItems.length);
          });
          $scope.range($scope.pagedItems.length);
          $scope.$applyAsync();
          $scope.isLoading = false;
          $scope.isLoadingCategory = false;
        };

        

        /*Pagination for Interchange#*/
        $scope.inter_itemsPerPage =10; $scope.inter_sortingOrder = ''; $scope.inter_reverse = false;
        $scope.inter_paginationftn2 = function(items){
          $scope.inter_nodata = false; $scope.inter_filteredItems = []; $scope.inter_groupedItems = []; $scope.inter_pagedItems = []; $scope.inter_pagenos = []; $scope.intersearch = {};
          $scope.inter_currentPage = 0; $scope.inter_compdata = items;
          //pagination part start
          $scope.inter_sortBy = function(propertyName) {
            $scope.inter_sortKey = propertyName;   //set the sortKey to the param passed
            $scope.inter_reverse = ($scope.inter_sortKey === propertyName) ? !$scope.inter_reverse : false;
            $scope.inter_filteredItems = $filter('orderBy')($scope.inter_filteredItems, $scope.inter_sortKey, $scope.inter_reverse);
            $scope.inter_pagedItems = []; 
            $scope.inter_groupToPages();
          };      
          var inter_searchMatch = function (haystack, needle) {
            if (!needle) { return true;}
            if(haystack !== null){ return haystack.toString().toLowerCase().indexOf(needle.toString().toLowerCase()); }
          };
          // *****************init the filtered items*****************
          $scope.inter_mysearch = function () {
              $scope.inter_filteredItems = $filter('filter')($scope.inter_compdata, function (item) {
                  if(item.interchange != '') { if (inter_searchMatch(item.interchange, $scope.inter_query)  > -1){ return true; } }
                  return false;
              });
              if ($scope.inter_sortingOrder !== '') { $scope.inter_filteredItems = $filter('orderBy')($scope.inter_filteredItems, $scope.inter_sortingOrder, $scope.inter_reverse); }
              $scope.inter_currentPage = 0; $scope.inter_groupToPages();
          };
          $scope.inter_fitsearch = function (fieldno,serachval) {
              /*if($scope.inter_fieldprev){ $scope.inter_fieldcurr = fieldno;                            
              }else{
                $scope.inter_fieldprev = fieldno;$scope.inter_fieldcurr = fieldno;
              }
              if($scope.inter_fieldprev != $scope.inter_fieldcurr){
                //$('#'+$scope.fieldprev).val(''); 
                document.querySelector('#'+$scope.inter_fieldprev).value='';
                $scope.inter_fieldprev = fieldno;
              }*/
              
              inter_query = $scope.intersearch[serachval];
              $scope.inter_filteredItems = $filter('filter')($scope.inter_compdata, function (inter_item) {
                  if(inter_item[fieldno] != '') { if (inter_searchMatch(inter_item[fieldno], inter_query)  > -1){ return true; } }
                  return false;
              });
              if ($scope.inter_sortingOrder !== '') { $scope.inter_filteredItems = $filter('orderBy')($scope.inter_filteredItems, $scope.inter_sortingOrder, $scope.inter_reverse); }
              $scope.inter_currentPage = 0; $scope.inter_groupToPages();
          };
          // *****************finish the filtered items*****************//
          $scope.inter_groupToPages = function () {
            $scope.inter_pagedItems = [];
            if($scope.inter_filteredItems !=null){
              for (var i = 0; i < $scope.inter_filteredItems.length; i++) {
                if (i % $scope.inter_itemsPerPage === 0) {
                  $scope.inter_pagedItems[Math.floor(i / $scope.inter_itemsPerPage)] = [ $scope.inter_filteredItems[i] ];
                } else {
                  $scope.inter_pagedItems[Math.floor(i / $scope.inter_itemsPerPage)].push($scope.inter_filteredItems[i]);
                }
              }
            }
            $scope.inter_range($scope.inter_pagedItems.length);
            $scope.$applyAsync();
          };
          $scope.inter_range = function (start, end) {
              var ret = [];
              if (!end) {
                  end = start; start = 0;
              }
              for (var i = start; i < end; i++) {
                  ret.push(i);
              }
              $scope.inter_pagenos = ret;
              return ret;
          };
                      
          $scope.inter_prevPage = function () {
              if ($scope.inter_currentPage > 0) { $scope.inter_currentPage--; }
          };
          $scope.inter_nextPage = function () {
              if ($scope.inter_currentPage < $scope.inter_pagedItems.length - 1) { $scope.inter_currentPage++; }
          };
          $scope.inter_setPage = function () {
              $scope.inter_currentPage = this.n;
          };
          $scope.inter_mysearch();
          $scope.$watch('inter_currentPage', function(pno,oldno){
              start =  (pno-2 > -1)? pno-2:0;
              $scope.inter_range(start, $scope.inter_pagedItems.length);
          });
          $scope.inter_range($scope.inter_pagedItems.length);
          $scope.$applyAsync();
          $scope.inter_isLoading = false;
          $scope.inter_isLoadingCategory = false;
        };
        /*Pagination for Interchange# End*/

    });
}

angular.bootstrap(document.getElementById("APAproductDESC"), ['FitmentApp']);

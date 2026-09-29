var css_url=base_url_home+"assets/css/";
var css_array = ['apa_embeded_script.css?v=1.29'];
css_array.forEach(function(val){
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = css_url+''+val;
    document.getElementsByTagName('HEAD')[0].appendChild(link);
});


/***************************** embeded widget ymme scripts ******************************************/
    var ewdapp = angular.module('ewdymmApp', []);
    ewdapp.config(function($interpolateProvider) {
      $interpolateProvider.startSymbol('{[{');
      $interpolateProvider.endSymbol('}]}');
    });
    ewdapp.controller('ewdymmController', function($scope,$http,$timeout,$window,$filter,$compile) {
      $scope.base_url = base_url_home;
      $scope.ymmval_home = {};
      $scope.stencil_url = redirect_url;
	    $scope.fitmatQuery = [];
      $scope.ymmquerystring =[];
      $scope.ymm_names = []; $scope.ymm_namesLang = []; $scope.ymm_fielditems = []; $scope.ymm_partitems = {};
      
      $scope.ymmhead ={'en':'Parts Search','es':'Búsqueda de Piezas','fr':'Recherche de Pièces'};
      $scope.ymmbtn  ={'en':'Search','es':'Búsqueda','fr':'Recherche'};
      $scope.language=['en','es','fr'];
      $scope.stcontent = {'en' : "Enter your YEAR, MAKE, MODEL or FRAM part number, and we'll begin searching our database for compatible parts.",
'es' :"Ingrese su número de pieza A�?O, MARCA, MODELO o FRAM, y comenzaremos a buscar en nuestra base de datos las piezas compatibles.",
'fr':"Entrez votre numéro de pièce YEAR, MAKE, MODEL ou FRAM, et nous commencerons à chercher dans notre base de données les pièces compatibles."};
      
      $scope.any  ={'en':'Any','es':'Cualquier','fr':"N'importe Quel"};

      urlIN=window.location;
      pathIN = urlIN.pathname.split('/');
      $scope.currlanguage = pathIN[1] != undefined && $scope.language.indexOf(pathIN[1].toLowerCase()) != -1 ? pathIN[1].toLowerCase() :'en';
      $scope.ymmname = function(field,name) {
         fieldname = name;
        if($scope.currlanguage == 'en'){
          fieldname = $scope.ymm_names[field]['name'];
        }else if($scope.currlanguage =='es'){
          fieldname = $scope.ymm_names[field]['name_es'];
        }else if($scope.currlanguage =='fr'){
          fieldname = $scope.ymm_names[field]['name_fr'];
        }
        return fieldname;
      };
      $scope.ymmval = function(field,name,val) {
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


      $scope.ymm_header = function(eve,name) {
        fieldname = name;
        if(eve == 'head'){
          fieldname = $scope.ymmhead[$scope.currlanguage];
        }else if(eve =='btn'){
          fieldname = $scope.ymmbtn[$scope.currlanguage];
        }
        return fieldname;
      };

      $scope.stcbind = function() {
        return $scope.stcontent[$scope.currlanguage];
      }

      $http({

          method  : 'GET', url     : $scope.base_url+"apa_ymmwidget_field",

        headers: {'Content-Type':'application/x-www-form-urlencoded'}
      })
      .then(function(response) {
        $scope.ymm_fielditems =response.data.result;
        temp = {}; tempname = {}; $scope.get_field_sort = ''; $scope.get_field = ''; $scope.get_field_name=''; tfag = 0;  $scope.get_order='';
        $scope.ymm_app_field = '';
        angular.forEach($scope.ymm_fielditems, function (value, key) {
             if(tfag == 0 && value.type <=0){
                $scope.get_field = value.field_no;
                $scope.get_order = value.order;
                $scope.get_field_sort = value.sort;
                $scope.get_field_name = value.field_name;
                tfag++;
              }
              temp[value.field_no] = {'name':value.field_name,'name_es':value.name_es,'name_fr':value.name_fr,'order':value.order,'sort':value.sort,'type':value.type,'visible':value.visible,'mandatory':value.mandatory} ;
              tempname[value.field_name] = {'field':value.field_no,'name_es':value.name_es,'name_fr':value.name_fr};
              $scope.ymmval_home[value.field_no] = '';
              $scope.ymm_partitems[value.field_no] = [];
              if( value.field_name.toLowerCase() == 'application' ){
                $scope.ymm_app_field = value.field_no;
              }
              if( value.type <=0 ){
              	$scope.lastorderval = value.order;
                $scope.lastorderfield = value.field_no;
              	$scope.ymmquerystring.push({'name':value.field_name,'mandatory':value.mandatory});
              }
        });
        $scope.ymm_names = temp; $scope.ymm_namesLang = tempname;
     	$scope.getewd_config();
        //$scope.getewd_ymm_val(get_field,get_order,get_field_sort,'init');
      });
      $scope.ymm_app ='';
      $scope.getYMM = function(ymm_applcation){
        if($scope.ymm_app != ymm_applcation){
          $scope.clearVehicle();
          $scope.ymm_app = ymm_applcation;
          //console.log($scope.ymm_app,'sdsdf');
          $scope.getewd_ymm_val($scope.get_field,$scope.get_order,$scope.get_field_sort,$scope.get_field_name,'init');
        }
      }

      $scope.ewd_config_items = [];
      $scope.getewd_config = function(){
        $http({
            method  : 'GET',

           url     : $scope.base_url+"apa_ymmwidget_config",
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
          })
          .then(function(response) {
            $scope.ewd_config_items =response.data.result[0];
            $scope.ymm_applcations =response.data.ymm_app;
            ewdc = $scope.ewd_config_items;
            $scope.ewd_setsdlab = ewdc.show_labels;
            $scope.ewd_setsht =ewdc.widget_heading;
            $scope.ewd_setcontainer =ewdc.widget_anchor;
            $scope.ewd_setdwt = ewdc.dropdown_select_text;
            $scope.ewd_sethom = ewdc.hide_on_mobile;
            $scope.ewd_setuew = ewdc.widget_enable;
            if($scope.ewd_setuew == 1){
              if($scope.ewd_sethom == 0 || ($scope.ewd_sethom == 1 && window.innerWidth > 768)){
                dom = `<div class="APAcol-md-12" id="ewd_setbg_blk"><div class="" id="apa-upper-embed" ><div class="APAcol-sm-3" id="apa-search-header" ng-show="ewd_setsht" style="margin-right:-40px;"><h2 class="ymmHead" ng-if="fitmatQuery.length == 0" ng-bind="ymm_header('head','Parts search')">Parts search</h2></div>
                  <div class="APAcol-sm-8 pl-0 pr-0">
                  <form class="mt-5 mb-0">
                        
                        <label class="radio-inline mr-15"
                                ng-repeat="(key,data) in ymm_applcations" ng-if="data.is_visible > 0 && fitmatQuery.length == 0 "
                              > <input type="radio"  ng-click="getYMM(data.field)"  ng-model="ymm_app" class="ymm-app-radio" name="optradio" value="{[{data.field}]}" /> {[{data.field}]} 
                              </label>


                  </form>
                  </div>
                  <div class="APAcol-sm-1" >
                    <a class="garage_icon text-center" ng-if="fitmatQuery.length == 0" ng-click="clearVehicle()" >Clear</a>
                  </div>`;
                dom +=`<div class="" ng-if="fitmatQuery.length > 0"><span class="SelectedHead">Your Selection</span> <span class="SelectedfitmatQuery" ng-repeat="data in fitmatQuery" ng-bind="decoding(data)"></span><span class="changeVehicle" ng-click="changeVehicle()">Change</span></div>

                <div class="apa-search-icon-wrapper show" ng-if="fitmatQuery.length == 0">`;
                    //   <span ng-if="ewd_setsdlab == 1">
                    // <label class="apa-label"  >&nbsp;</label><br></span>
                    dom += `<span class="APAbtn APAbtn-sm" ng-click="findparts()" ng-bind="ymm_header('btn','Search')">Search</span>
                  </div>
                  <div ng-repeat="(key,data) in ymm_names" ng-if="data.type <= 0 && data.visible == 0 && fitmatQuery.length == 0" class="apa-year-wrapper apa-selection-wrapper"><label class="apa-label" ng-if="ewd_setsdlab == 1">
                  </label><select id="{[{key}]}-select" ng-disabled="ymm_partitems[key] =='' || ymm_partitems[key] ==undefined || ymm_partitems[key].length == 1" ng-class="{'disabled':(ymm_partitems[key] =='' || ymm_partitems[key] ==undefined)}" name="{[{key}]}-select" ng-model="ymmval_home[key]" class="{[{key}]}-select apa-select" data-field="{[{key}]}" ng-change="getewd_ymm_val(key,data.order,data.sort,data.name,key)">
                    <option value="" ng-disabled="ymm_partitems[key].length == 1" class="reset_{[{key}]}" ng-bind="ymmname(key,data.name)">{[{data.name}]}</option>
                    <option value="{[{indata.val}]}" ng-repeat="(inkey,indata) in ymm_partitems[key]" ng-bind="ymmval(key,data.name,indata.val)">{[{indata.val}]}</option></select></div></div></div>`;
                //$('#'+ewdc.widget_anchor).html($compile(dom)($scope));
                angular.element(document.querySelector('#'+ewdc.widget_anchor)).append($compile(dom)($scope));
  	            
                //call default application
                if($scope.ymm_applcations.length > 0){
                  $scope.getYMM($scope.ymm_applcations[0]['field']);
                }
                //call
  	            $scope.FitmentQuery();
                //preview part
              	angular.element(document.querySelector('#ewd_setbg_blk')).css({'background-color':ewdc.widget_bg_color});
                angular.element(document.querySelector('#ewd_setbg_blk')).css({'color':ewdc.widget_font_color});
                /*angular.element(document.querySelector('#ewd_setbg_blk')).css({'minHeight':ewdc.widget_height+'px'});*/
                angular.element(document.querySelector('#ewd_setbg_blk')).css({'width':'100%'});
                angular.element(document.querySelector('#ewd_setbg_blk')).css({'maxWidth':ewdc.widget_width+'px'});
                if(angular.element(document.querySelector('#ewd_setbg_blk')).find('h2').length > 0){
                  angular.element(document.querySelector('#ewd_setbg_blk')).find('h2')[0].css({'color':ewdc.widget_font_color});
                  angular.element(document.querySelector('#apa-search-header')).find('h2')[0].html(ewdc.widget_heading);
                }
               /* $('#ewd_setbg_blk').css({'background-color':ewdc.widget_bg_color});
                $('#ewd_setbg_blk h2').css({'color':ewdc.widget_font_color});
                $('#ewd_setbg_blk').css({'color':ewdc.widget_font_color});
                $('#ewd_setbg_blk').css({'minHeight':ewdc.widget_height+'px'});
                $('#ewd_setbg_blk').css({'width':'100%'});
                $('#ewd_setbg_blk').css({'maxWidth':ewdc.widget_width+'px'});
                $('#apa-search-header h2').html(ewdc.widget_heading); */

              }
            }
        });
      };
      groupBy = function(array, key)  {
        return array.reduce(function(result, currentValue)  {
          (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
          );
          return result;
        }, {});
     }
      $scope.FitmentQuery = function(){
      	$scope.fitmatQuery = []; fitmatQueryin = [];
      	if(window.location.href.split('?')[1] != undefined && window.location.href.split('?')[1] !=''){
         var urlis = decodeURI(window.location.href).split('?');
            if(urlis[1].indexOf('typeofsearch=') !== -1){
             //rest code
            }else{
            	//getdata = urlis[1].split('=').join(': ');
              let url = new URL(window.location.href);
              let urlParams = new URLSearchParams(url.search);
              angular.forEach(urlParams, function (value, key) {
                keyname = $scope.ymm_namesLang[key] != undefined ? $scope.ymmname($scope.ymm_namesLang[key]['field'],key)  : key;
                //val = $scope.ymm_namesLang[key] != undefined ? $scope.ymmval($scope.ymm_namesLang[key]['field'],key,value)  : value;
                value.toLowerCase() != 'any '+key.toLowerCase() ? fitmatQueryin.push(keyname+': '+value) : ''; 
              })
            	
              //validation
            	vflag = 0; vmandatory=0;
            	angular.forEach($scope.ymmquerystring, function (value, key) {
            		(value.mandatory > 0)? vmandatory++:'';
            		(urlis[1].indexOf(value.name)>= 0)? vflag++:'';
            	})
            	$scope.fitmatQuery = (vflag >= vmandatory)? fitmatQueryin :[];
            }
       }
	 };
	 $scope.clearVehicle = function() {
    $scope.fitmatQuery = [];
    $scope.ymm_app ='';
    $scope.ymmval_home = {};
    $scope.ymm_partitems = {};
    radio = document.querySelectorAll('.ymm-app-radio');
    };
   $scope.changeVehicle = function() {
    $scope.fitmatQuery = [];
   };
   $scope.decoding = function(data) {
      return (data !='') ? decodeURIComponent(data) : '';
   };

      $scope.getewd_ymm_val =function(field,order,sort,name,call){
        emptyflag = 0; req_field = field; req_field_name = name; req_field_sort = sort; req_order = order;
        if(($scope.lastorderval != order || call == 'init') && $scope.ymm_app !=''){
          if(call !='init'){
          	 reqflag = 0;
            angular.forEach($scope.ymm_names, function (value, key) {
              if(emptyflag > 0){
                  if(reqflag == 0 && value.type <=0){
                    req_field = key; req_field_sort = value.sort; req_order = value.order;
                    req_field_name = value.name;
                    reqflag++;
                  }
                  $scope.ymmval_home[key] = ''; $scope.ymm_partitems[key] = '';
                  emptyflag++;
                }
                (field == key && emptyflag ==0 )? emptyflag = 1:'';
            });
          }
          if($scope.ymmval_home[field] !='' || call == 'init'){
            $scope.ymmval_home[$scope.ymm_app_field] = $scope.ymm_app;
            //console.log($scope.ymmval_home);
            $http({
                method  : 'POST', data    : {order:req_order,field:req_field,field_sort:req_field_sort,condition:$scope.ymmval_home},

               url     : $scope.base_url+"apa_ymmwidget_getfield",
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            })
            .then(function(response) {
                    result =response.data.result;
                    $scope.ymm_partitems[req_field] = (result.length == 1 && result[0]['val'] =='')? []: result;
                   
                    if($scope.ymm_partitems[req_field].length == 1){ // && result[0]['val'].toLowerCase() == 'any '+req_field_name.toLowerCase()
                      $scope.ymmval_home[req_field] = result[0]['val'];
                      $scope.getewd_ymm_val(req_field,req_order,req_field_sort,req_field_name,'');
                      //angular.element(document.querySelector('.reset_'+req_field)).attr("disabled", true);
                    }  

                   //Garage loader
                   /*if($scope.garage_reqqq_field == field){
                      $scope.garage_reqqq_field = req_field;
                      $scope.garage_loader();
                   }*/
            });
          }
        }
      };
      $scope.findparts = function(){
        //YMM mandatory field arr
      	var mandatory_arr =[];
      	var selected_arr =[];
      	Object.keys($scope.ymm_names).filter((val) => {
      		if($scope.ymm_names[val].mandatory == 1 && $scope.ymm_names[val].type <=0){
      			mandatory_arr.push(val);
      		}
      	})

        cnt = 0;
        angular.forEach($scope.ymmval_home, function (value, key) {
            (value !='')?cnt++:'';
        });
        if(cnt > 0){
          url_forming = ''; i = 0;
          angular.forEach($scope.ymm_names, function (value, key) {
            if(value.type <=0 || key == $scope.ymm_app_field){
              if(i ==0){
              	selected_arr.push(key);
                url_forming +=value.name+'='+encodeURIComponent($scope.ymmval_home[key]);
              }else if($scope.ymmval_home[key] !='' && $scope.ymmval_home[key] != undefined){
              	selected_arr.push(key);
                url_forming +='&'+value.name+'='+encodeURIComponent($scope.ymmval_home[key]);
              }
              i++;
            }
          });

          //Year Make validation
      		//console.log($('#ymmCategoryId').val())
      		ymmCategoryId=''; ymmCategoryUrl=''; ymmCategoryName='';
      		if(document.querySelector("#ymmCategoryId") !=null && document.querySelector("#ymmCategoryId").value != undefined ){
      			ymmCategoryId = document.querySelector("#ymmCategoryId").value.trim();  //($('#ymmCategoryId').val()).trim();
      			ymmCategoryUrl = document.querySelector("#ymmCategoryUrl").value.trim(); //($('#ymmCategoryUrl').val()).trim();
      			ymmCategoryName = document.querySelector("#ymmCategoryName").value.trim();//($('#ymmCategoryName').val()).trim();
      		}
          var combine_arr = [mandatory_arr,selected_arr];
        	var res = combine_arr.reduce((p,c) => p.filter(e => c.includes(e)));
          	if(mandatory_arr.length == res.length){
                	//$scope.garage_store();
                  urlIN=new URL(landing_url);
                  //console.log(urlIN.protocol,urlIN.hostname,urlIN.pathname,urlIN.search);
                  $scope.landingpage_url = urlIN.protocol+'//'+urlIN.hostname+'/'+$scope.currlanguage+urlIN.pathname;
                	if(ymmCategoryUrl !='' && ymmCategoryUrl != undefined){
                		window.location.href = ymmCategoryUrl+"?"+url_forming;
                	}else{
      	  			    window.location.href = $scope.landingpage_url+"?"+url_forming;
                	}
          	}
      		/*if(url_forming.search("Year") == -1 && url_forming.search("Make") == -1){
      			return false;
      			// alert('Please Select Year & Make');
      		}*/
        }
      };
    });
angular.bootstrap(document.getElementById("apa-ymm-container"), ['ewdymmApp']);

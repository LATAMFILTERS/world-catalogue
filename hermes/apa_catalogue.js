/***************************** catalogue page scripts ******************************************/
var app = angular.module('myApp', []);
app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
app.controller('myCtrl', function($scope,$http,$timeout,$window,$filter) { 
      $scope.base_url = base_url_home;
      $scope.stencil_url = redirect_url;
      $scope.landingpage_url = landing_url;
      $scope.isLoading = false; $scope.isLoadingCategory = true;
      $scope.globalsearchdata=''; $scope.globalsearchdata_ymm=''; $scope.globalsearchdata_ymm_application=''; $scope.globalsearchdata_category=''; $scope.globalsearchdata_vin = ''; $scope.globalsearchdata_ef = '';
      $scope.searchtype =''; $scope.part_is='';$scope.year_is='';$scope.make_is='';$scope.model_is='';$scope.submodel_is='';
      $scope.fitmentsearch = false;  $scope.categoryIgnore = [];
      //category init start
      $scope.categorysearch = false; $scope.reqCategory_id = ''; $scope.reqCategory_name  = ''; $scope.reqCategory_url = '';
      //category init end
      $scope.fitmentNames = []; $scope.fitmentFielditems = [];  $scope.bigcCategory = []; $scope.catalogueCategory = [];
      $scope.ymmval = {}; $scope.resultconfig = [];

      var APAcustomer_name = (document.getElementById("APAcustomer_name") !=undefined) ?  document.getElementById("APAcustomer_name").value : '';
      var APAcustomer_email = (document.getElementById("APAcustomer_email") !=undefined) ?document.getElementById("APAcustomer_email").value : '';
      var APAcustomer_phone = (document.getElementById("APAcustomer_phone") !=undefined) ? document.getElementById("APAcustomer_phone").value : '';

      $scope.APAcustomer = {'name':APAcustomer_name,'email':APAcustomer_email,'phone':APAcustomer_phone};

      $scope.language=['en','es','fr'];
      $scope.stcontent = {'en' : "Enter your YEAR, MAKE, MODEL or FRAM part number, and we'll begin searching our database for compatible parts.",
'es' :"Ingrese su nÃºmero de pieza AÃ?O, MARCA, MODELO o FRAM, y comenzaremos a buscar en nuestra base de datos las piezas compatibles.",
'fr':"Entrez votre numÃ©ro de piÃ¨ce YEAR, MAKE, MODEL ou FRAM, et nous commencerons Ã  chercher dans notre base de donnÃ©es les piÃ¨ces compatibles."};
      
      $scope.print = {'en' : "Print Result",'es' :"Imprimir Resultados",'fr':"Imprimer les RÃ©sultats"};
      $scope.qualifiers = {'en' : "Qualifiers",'es' :"Calificadores",'fr':"Qualificatifs"};
      $scope.viewbtn = {'en' : "VIEW DETAILS",'es' :"VER DETALLES",'fr':"VOIR LES DÃ?TAILS"};
      $scope.wherebtn = {'en' : "WHERE TO SHOP",'es' :"DÃ?NDE COMPRAR",'fr':"OÃ? MAGASINER"};
      $scope.ptlabel = {'en' : "Product Type",'es' :"Tipo de producto",'fr':"Type de produit"};

      urlIN=window.location;
      pathIN = urlIN.pathname.split('/');
      $scope.currlanguage = pathIN[1] != undefined && $scope.language.indexOf(pathIN[1].toLowerCase()) != -1 ? pathIN[1].toLowerCase() :'en';

      $scope.stcbind = function() {
        return $scope.stcontent[$scope.currlanguage];
      }

      $scope.stcontentbind = function(text,flag) {
        (flag =='view') ?  text = $scope.viewbtn[$scope.currlanguage] :'';
        (flag =='where') ?  text = $scope.wherebtn[$scope.currlanguage] :'';
        (flag =='pt') ?  text = $scope.ptlabel[$scope.currlanguage] :'';
        (flag =='print') ?  text = $scope.print[$scope.currlanguage] :'';
        (flag =='qua') ?  text = $scope.qualifiers[$scope.currlanguage] :'';
        return text;
      }
      
      $http({
          method  : 'GET',url     : $scope.base_url+"apa_catalogue_category",
          headers: {'Content-Type':'application/x-www-form-urlencoded'}
      })
      .then(function(response) {
          $scope.bigcCategory =response.data.category;
          temp_category = {};
          angular.forEach($scope.bigcCategory, function (value, key) {
              reverse = (value.sort == 0)? 'name' :'-name';
              temp_category[value.category_no] = {'name':value.category_name,'order':value.order,'sort':value.sort,'reverse':reverse};
              if(key == ($scope.bigcCategory.length-1)){
                $scope.catalogueCategory = temp_category; 
              }
          });
          $scope.fitmentFielditems =response.data.ymm;
          temp = {};
          $scope.Options_Notes = {};

          angular.forEach($scope.fitmentFielditems, function (value, key) {
              //console.log('options',$scope.Options_Notes,value.field_name.toLowerCase());
              if(value.field_name.toLowerCase() == 'options' || value.field_name.toLowerCase() == 'notes'){
                $scope.Options_Notes[value.field_name.toLowerCase()] = value.field_no;
              }
              reverse = (value.sort == 0)? 'name' :'-name';
              if(value.type >=0 ){
                temp[value.field_no] = {'type':value.type,'name':value.field_name,'order':value.order,'sort':value.sort,'reverse':reverse,'fit_match_visible':value.fit_match_visible,'visible':value.visible};
              }
              if(key == ($scope.fitmentFielditems.length-1)){
                $scope.fitmentNames = temp; 
                $scope.trigger();
              }
          });   
          
          $scope.resultconfig =response.data.config[0]; resulttype= $scope.resultconfig['results_type'];
          $scope.categoryIgnore =response.data.category_hide;   
      });
      $scope.apaGridChange=function(count){
        //$('.apaGrid').removeClass('active'); $('#apaGrid'+count).addClass('active');
            document.querySelector(".apaGrid").classList.remove('active');
        document.querySelector('#apaGrid'+count).classList.add('active'); 
        $scope.resultconfig['results_type'] = count;
      };
      $scope.flip = 0;
      $scope.mobilefilter=function(e){
          //$('.filter-toggle').toggleClass("open");
          angular.element(document.querySelector(".filter-toggle")).toggleClass("open");
          if(angular.element(document.querySelector(".filter-toggle")).hasClass("open")){
            document.querySelector("#accordion").style.setProperty( 'display', 'block', 'important' );
            /*document.querySelector(".panel-collapse").classList.remove('show'); //.classList.remove('show');
            angular.element(document.querySelector("#accordion >div .accordion-toggle")).addClass('collapsed'); //.classList.add('collapsed');
            document.querySelector("#accordion >div:first-child .accordion-toggle").click();*/
          }else{
            document.querySelector("#accordion").style.setProperty( 'display', 'none', 'important' );
          }
          /*tmp = angular.element("#accordion")[0].toggle($scope.flip++ % 2 === 0 ); //$('#accordion').toggle($scope.flip++ % 2 === 0 );
          if($scope.flip % 2 != 0){
            //accordion-toggle
            $('#accordion')[0].style.setProperty( 'display', 'block', 'important' );
            $(".panel-collapse").removeClass('show');
            $('#accordion >div .accordion-toggle').addClass('collapsed');
            $('#accordion >div:first-child .accordion-toggle').click();
            //$('.show-more').hide();
          }else{
            $('#accordion')[0].style.setProperty( 'display', 'none', 'important' );
          }*/
      };

      //add to compare
      $scope.toCompare=function(event){
        id=event.target.getAttribute('proId');
        if(id !="" && id!=null && id!=undefined){
          addToCompare(id);
        }
      }

      $scope.asideFilter=function(event){
        id=event.target.getAttribute('panelID');
        document.querySelector('#'+id).classList.toggle('show'); //$('#'+id).toggleClass("show");
        angular.element(event.target).toggleClass('collapsed'); //$(event.target).toggleClass("collapsed");
      }
      //$('.mobile-sort').hide();
      document.querySelector('.mobile-sort').classList.add('hidden');
      $scope.mobilesort=function(e){
        //document.querySelector('.sort-toggle').classList.toggle('open');
        //$('.sort-toggle').toggleClass("open"); $('.mobile-sort').toggle();
        angular.element(document.querySelector('.sort-toggle')).toggleClass('open');
        if(angular.element(document.querySelector(".sort-toggle")).hasClass("open")){
            document.querySelector('.mobile-sort').classList.remove('hidden');
        }else{
            document.querySelector('.mobile-sort').classList.add('hidden');
        }
      };

      //getdata without fitment
      $scope.datafilter_category = {}; $scope.datafilter_fitment = {}; $scope.datafilter_attribute = {};
      $scope.searchfilter=function(e,webcategory){
           //scroll to top click
              $scope.scrollto();

           searchtype = (e=='exact')? 1 : 0;
           $scope.searctypecat = searchtype;
           $scope.isLoading = true; $scope.isLoadingCategory = true;
           $scope.disabled = false;
           $scope.datafilter_category = {}; $scope.datafilter_fitment = {}; $scope.datafilter_attribute = {};
            angular.forEach($scope.fitmentNames, function (value, key) {
                $scope.datafilter_fitment[key] = '';               
            });
            angular.forEach($scope.catalogueCategory, function (value, key) {
                 $scope.datafilter_category[key] = '';
            });

           $scope.datafilter_price= ''; $scope.fitmentquery ={}; $scope.categorquery ={}; $scope.attrquery ={};
           $scope.nogetdata = false; $scope.data_filter=false;
           $scope.filter_products_count = 0;
           //webcategory assign
           $scope.webcategory =  (webcategory!='')? webcategory : '';
           $http({
              method  : 'POST',url     : $scope.base_url+"apa_catalogue_keyword_webcategory",
              datatype:'JSON', data    : {brand:$scope.brand,search_keyword:$scope.globalsearchdata,searchtype:searchtype,searchoem:$scope.searchoem,webcategory:$scope.webcategory,'customer':$scope.APAcustomer},
              headers: {'Content-Type':'application/x-www-form-urlencoded'}
           })
           .then(function(res) {
              response = res.data; //JSON.parse(res);
                $scope.filter_products_near = response.result_near;
                $scope.filter_products_count = response.result_count;
                $scope.msgis = false;
                  if($scope.webcategory ==''){
                    $scope.filter_category_near = response.category_result_near;
                    $scope.filter_category = response.category_result;
                  }
                  if($scope.filter_products_near.length > 0){
                      if(searchtype == 1){
                        $scope.msgis = true; $scope.disabled = true;
                        $scope.searchtype = 0; $scope.searctypecat = 0;
                      }
                      $scope.filter_products_org = response.result_near; $scope.filter_products = response.result_near;
                  }else{
                      $scope.filter_products_org = response.result; $scope.filter_products = response.result;
                  }   
                $scope.sidebarfilter('');
                $scope.paginationftn($scope.filter_products);
           });
           
           if(window.innerWidth < 768){ $scope.flip = 0; //$('#accordion')[0].style.setProperty( 'display', 'none', 'important' );
             document.querySelector('#accordion') != undefined && document.querySelector('#accordion') != null ? document.querySelector('#accordion').style.setProperty( 'display', 'none', 'important' ) :'';
           }  
      };
      //getdata with efamily
      $scope.searchfilter_efamily=function(webcategory){
           //scroll to top click
              $scope.scrollto();

           $scope.isLoading = true; $scope.isLoadingCategory = true;
           $scope.disabled = false;
          $scope.datafilter_category = {}; $scope.datafilter_fitment = {}; $scope.datafilter_attribute = {};
            angular.forEach($scope.fitmentNames, function (value, key) {
                $scope.datafilter_fitment[key] = '';               
            });
            angular.forEach($scope.catalogueCategory, function (value, key) {
                 $scope.datafilter_category[key] = '';
            });
          $scope.datafilter_price= ''; $scope.fitmentquery ={}; $scope.categorquery ={}; $scope.attrquery ={};
           $scope.nogetdata = false; $scope.data_filter=false;
           $scope.filter_products_count = 0;
           //webcategory assign
           $scope.webcategory =  (webcategory!='')? webcategory : '';


           //Make for Engine Family //Engine Manufacturer
           ($scope.efamily_make !=undefined && $scope.efamily_make !='')? $scope.datafilter_attribute['Make for Engine Family'] = $scope.efamily_make : '';            
           if($scope.efamily !=undefined && $scope.efamily !=''){
            $scope.datafilter_attribute['Engine Family'] = $scope.efamily;
            $scope.data_filter =true;
            $scope.attrquery = $scope.datafilter_attribute;
           }

           $http({
              method  : 'POST',url     : $scope.base_url+"apa_catalogue_efamily",
              datatype:'JSON', data    : { webcategory:$scope.webcategory,'customer':$scope.APAcustomer,'efamily' : $scope.efamily,'emake':$scope.efamily_make},
              headers: {'Content-Type':'application/x-www-form-urlencoded'}
           })
           .then(function(res) {
              response = res.data; //JSON.parse(res);
                $scope.filter_products_near = response.result_near;
                $scope.filter_products_count = response.result_count;
                $scope.msgis = false;
                  if($scope.webcategory ==''){
                      $scope.filter_category_near = response.category_result_near;
                      $scope.filter_category = response.category_result;
                    }
                  if($scope.filter_products_near.length > 0){
                          $scope.filter_products_org = response.result_near;
                          $scope.filter_products = response.result_near;
                  }else{
                          $scope.filter_products_org = response.result;
                          $scope.filter_products = response.result;
                  }   
                $scope.sidebarfilter('');
                $scope.paginationftn($scope.filter_products);
           });
         if(window.innerWidth < 768){ 
          $scope.flip = 0; //$('#accordion')[0].style.setProperty( 'display', 'none', 'important' )
          document.querySelector('#accordion') != undefined && document.querySelector('#accordion') != null ? document.querySelector('#accordion').style.setProperty( 'display', 'none', 'important' ) :'';
         }
      };

      //getdata with fitment
      $scope.searchfilter_fitment=function(webcategory){
           //scroll to top click
              $scope.scrollto();

           $scope.isLoading = true; $scope.isLoadingCategory = true;
           $scope.disabled = false;
          $scope.datafilter_category = {}; $scope.datafilter_fitment = {}; $scope.datafilter_attribute = {};
            angular.forEach($scope.fitmentNames, function (value, key) {
                $scope.datafilter_fitment[key] = '';               
            });
            angular.forEach($scope.catalogueCategory, function (value, key) {
                 $scope.datafilter_category[key] = '';
            });
          $scope.datafilter_price= ''; $scope.fitmentquery ={}; $scope.categorquery ={}; $scope.attrquery ={};
           $scope.nogetdata = false; $scope.data_filter=false;
           $scope.filter_products_count = 0;
           //webcategory assign
           $scope.webcategory =  (webcategory!='')? webcategory : '';

           $http({
              method  : 'POST',url     : $scope.base_url+"apa_catalogue_fitment_webcategory",
              datatype:'JSON', data    : { ymmval:$scope.ymmval,webcategory:$scope.webcategory,'customer':$scope.APAcustomer},
              headers: {'Content-Type':'application/x-www-form-urlencoded'}
           })
           .then(function(res) {
              response = res.data; //JSON.parse(res);
                $scope.filter_products_near = response.result_near;
                $scope.filter_products_count = response.result_count;
                $scope.msgis = false;
                  if($scope.webcategory ==''){
                      $scope.filter_category_near = response.category_result_near;
                      $scope.filter_category = response.category_result;
                    }
                  if($scope.filter_products_near.length > 0){
                          $scope.filter_products_org = response.result_near;
                          $scope.filter_products = response.result_near;
                  }else{
                          $scope.filter_products_org = response.result;
                          $scope.filter_products = response.result;
                  }   
                $scope.sidebarfilter('');
                $scope.paginationftn($scope.filter_products);
           });
         if(window.innerWidth < 768){ 
          $scope.flip = 0; //$('#accordion')[0].style.setProperty( 'display', 'none', 'important' )
          document.querySelector('#accordion') != undefined && document.querySelector('#accordion') != null ? document.querySelector('#accordion').style.setProperty( 'display', 'none', 'important' ) :'';
         }
      };
      //getdata with category
      $scope.searchfilter_category=function(webcategory){
         //scroll to top click
              $scope.scrollto();
              
           $scope.isLoading = true; $scope.isLoadingCategory = true;
           $scope.disabled = false;
            $scope.datafilter_category = {}; $scope.datafilter_fitment = {}; 

            $scope.datafilter_attribute = {};

            angular.forEach($scope.fitmentNames, function (value, key) {
                $scope.datafilter_fitment[key] = '';               
            });
            angular.forEach($scope.catalogueCategory, function (value, key) {
                 $scope.datafilter_category[key] = '';
            });
           $scope.datafilter_price= ''; $scope.fitmentquery ={}; $scope.categorquery ={}; $scope.attrquery ={};
           $scope.nogetdata = false; $scope.data_filter=false; 
           $scope.filter_products_count = 0;
           ymmvalis = (Object.keys($scope.ymmval).length > 0)?$scope.ymmval:[];

           $scope.webcategory =  (webcategory!='')? webcategory : '';

           $http({
            method  : 'POST',url     : $scope.base_url+"apa_catalogue_searchkeyword_category",
            datatype:'JSON', 
            data    : { 
                category_name:$scope.reqCategory_name, category_id:$scope.reqCategory_id,ymmval:ymmvalis,'customer':$scope.APAcustomer  //category_url:$scope.reqCategory_url
              },
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
         })
         .then(function(res) {
            response = res.data; //JSON.parse(res);
              $scope.filter_products_near = response.result_near;
              $scope.filter_products_count = response.result_count;
              $scope.msgis = false;
                if($scope.filter_products_near.length > 0){
                        $scope.filter_products_org = response.result_near;
                        $scope.filter_products = response.result_near;
                }else{
                        $scope.filter_products_org = response.result;
                        $scope.filter_products = response.result;
                }   
              $scope.sidebarfilter('');
              $scope.paginationftn($scope.filter_products);
         });
         if(window.innerWidth < 768){ 
         $scope.flip = 0; //$('#accordion')[0].style.setProperty( 'display', 'none', 'important' ) 
         document.querySelector('#accordion') != undefined && document.querySelector('#accordion') != null ? document.querySelector('#accordion').style.setProperty( 'display', 'none', 'important' ) :'';
         }
      };  
    
    $scope.efamily = ''; $scope.efamily_make = ''; $scope.brand= '';
    $scope.trigger = function(){ 

      //$scope.customer_id = (document.querySelector("#catapult_user_id").value != undefined && document.querySelector("#catapult_user_id").value != '') ? document.querySelector("#catapult_user_id").value : '';

      $scope.customer_id = '';
      $scope.fitmatch_query = ''; $scope.full_query  ='';
      if(window.location.href.split('?')[1] != undefined && window.location.href.split('?')[1] !=''){
         var urlis = decodeURI(window.location.href).split('?');
            if(urlis[1].indexOf('typeofsearch=') !== -1){
              var getdata = urlis[1].split('&');
               getdata.map((res)=>{  
                (res.split('=')[0] =='typeofsearch') ? $scope.searchtype = res.split('=')[1] : ''; 
                (res.split('=')[0] =='search_query_adv') ? $scope.globalsearchdata = decodeURIComponent(res.split('=')[1].split('+').join(' ')) :'';
                (res.split('=')[0] =='searchoem') ? $scope.searchoem = res.split('=')[1] : ''; 

                  if(res.split('=')[0] == 'cid'){
                        $scope.ymmCategoryId = res.split('=')[1];
                        $scope.webcategory = res.split('=')[1];
                  }
                  if(res.split('=')[0] == 'cname'){
                        $scope.ymmCategoryName = decodeURIComponent(res.split('=')[1]);
                  }
                  if(res.split('=')[0] == 'clevel'){
                        $scope.ymmCategoryLevel = res.split('=')[1];
                  }

              });
            }else if(urlis[1].indexOf('efamily=') !== -1){
                var getdata = urlis[1].split('&');
                  getdata.map((res)=>{  
                                        //for efamily
                    (res.split('=')[0] =='efamily') ? $scope.efamily = res.split('=')[1].split('+').join(' ') :'';
                    (res.split('=')[0] =='Make') ? $scope.efamily_make = res.split('=')[1].split('+').join(' ') :'';
                  });
                  $scope.globalsearchdata_ef = '"'+$scope.efamily_make+'" "'+$scope.efamily+'"';
            }else if(urlis[1].indexOf('bname=') !== -1){
                var getdata = urlis[1].split('&');
                  getdata.map((res)=>{  
                    (res.split('=')[0] =='bname') ? $scope.brand = res.split('=')[1].split('+').join(' ') :'';
                  });
                  $scope.globalsearchdata = 'Brand : '+$scope.brand;
            }else{
              var getdata = urlis[1].split('&');
              getdata.map((res)=>{ 
                  if(res.split('=')[0] == 'cid'){
                    $scope.ymmCategoryId = res.split('=')[1];
                    $scope.webcategory = res.split('=')[1];
                  }
                  if(res.split('=')[0] == 'cname'){
                    $scope.ymmCategoryName = decodeHTML(res.split('=')[1]);
                  }
                  if(res.split('=')[0] == 'clevel'){
                    $scope.ymmCategoryLevel = res.split('=')[1];
                  }  
               });

               cnt = 0;
               angular.forEach($scope.fitmentFielditems, function (value, key) {
                  if(value.type <=0 && urlis[1].indexOf(value.field_name+'=') !== -1){
                    cnt++;
                  }
               });
               if(cnt > 0){
                  $scope.fitmatch_query = '?';
                  $scope.full_query = urlis[1];
                  $scope.globalsearchdata_ymm = ''; $scope.globalsearchdata_ymm_application ='';

                    
                  getdata.map((res)=>{  
                    //for vin number
                    (res.split('=')[0] =='search_query_vin') ? $scope.globalsearchdata_vin = res.split('=')[1].split('+').join(' ') :'';
                     angular.forEach($scope.fitmentFielditems, function (value, key) {
                        if(res.split('=')[0] == value.field_name){
                          if(value.field_name.toLowerCase() == 'application'){
                            $scope.globalsearchdata_ymm_application +=' '+decodeURIComponent(res.split('=')[1].replace('**','/')).split('+').join(' ');
                          }else{
                              ret = decodeURIComponent(res.split('=')[1].replace('**','/')).split('+').join(' ');
                              //console.log(ret.toLowerCase(),'any '+value.field_name.toLowerCase());
                              (ret.toLowerCase() !='any '+value.field_name.toLowerCase()) ? $scope.globalsearchdata_ymm +=' '+ret : '';
                          }
                          
                          $scope.ymmval[value.field_no] = decodeURIComponent(res.split('=')[1].replace('**','/').trim()).split('+').join(' ');
                        };
                         //fit match concat
                        if(value.fit_match_visible == 0){
                          (res.split('=')[0] == value.field_name) ? $scope.fitmatch_query += res.concat('&') :''; //'&'+res.split('=')[0]+'='+encodeURIComponent(res.split('=')[1]):'';
                        }
                      });
                  });
                  $scope.globalsearchdata_ymm = $scope.globalsearchdata_ymm.trim();
                  $scope.fitmatch_query = $scope.fitmatch_query.slice(0, -1);
                  $scope.fitmentsearch = true;
               }   
            }
       }
      var search_meta_keyowrd = '';
      ymmCategoryId =( $scope.ymmCategoryId !=undefined && $scope.ymmCategoryId !='')? $scope.ymmCategoryId : ''; 
      ymmCategoryUrl = '';
      ymmCategoryName =( $scope.ymmCategoryName !=undefined && $scope.ymmCategoryName !='')? $scope.ymmCategoryName : ''; 
      
      /*if(document.querySelector("#ymmCategoryId") !=null && document.querySelector("#ymmCategoryId").value != undefined ){
         ymmCategoryId =document.querySelector('#ymmCategoryId').value.trim();
         ymmCategoryUrl = document.querySelector('#ymmCategoryUrl').value.trim();
         ymmCategoryName = document.querySelector('#ymmCategoryName').value.trim();
      }*/

      if($scope.globalsearchdata !='' ){
        $scope.nogetdata = false;
        search_meta_keyowrd = $scope.globalsearchdata;
        if($scope.searchtype == 1 &&  $scope.searchtype !=''){
          $scope.searctypecat = 1; //$('#radio-excat-catalogue').prop('checked',true);
          $scope.searchfilter('exact','');
        }else if($scope.searchtype == 0 &&  $scope.searchtype !=''){
          $scope.searctypecat = 0; //$('#radio-near-catalogue').prop('checked',true);
          //$('.form-radio-catalogue').val('near');
          document.querySelector('.form-radio-catalogue').value="near";
          $scope.searchfilter('near','');
        }else if( $scope.brand !='' &&  $scope.searchtype ==''){
          $scope.searctypecat = 1;
          $scope.searchfilter('exact','');
        }
      }else if($scope.globalsearchdata_ef !=''){
          $scope.nogetdata = false;
          search_meta_keyowrd = $scope.globalsearchdata_ef;
          $scope.searchfilter_efamily('');
      }else if($scope.globalsearchdata_ymm !='' && $scope.globalsearchdata_ymm !=undefined && (ymmCategoryId =='' || ymmCategoryId == undefined)){
        $scope.nogetdata = false;
        $scope.searchfilter_fitment('');
        search_meta_keyowrd = $scope.globalsearchdata_ymm;
      }else if(ymmCategoryId !='' && ymmCategoryId != undefined){
        if($scope.globalsearchdata_ymm !='' && $scope.globalsearchdata_ymm !=undefined){
          search_meta_keyowrd = $scope.globalsearchdata_ymm; // $scope.globalsearchdata_ymm='';
        }
        
        
        document.querySelector('#ymmCategoryId').value=ymmCategoryId;
        document.querySelector('#ymmCategoryUrl').value=ymmCategoryUrl;
        document.querySelector('#ymmCategoryName').value= ymmCategoryName;

        $scope.reqCategory_name = ymmCategoryName; $scope.reqCategory_id = ymmCategoryId; $scope.reqCategory_url = ymmCategoryUrl;
        $scope.globalsearchdata_category = $scope.reqCategory_name.trim();
        $scope.categorysearch = true; $scope.fitmentsearch = true; $scope.nogetdata = false;
        $scope.searchfilter_category(ymmCategoryId);
      }else{
        $scope.nogetdata = true; $scope.data_filter = false;
        $scope.datafilter_price = '';
        $scope.isLoading = false;
        $scope.isLoadingCategory = false;
      }
      //for meta keyword
       /*title_tmp = document.querySelector('title').text;
       document.title = title_tmp+' - '+search_meta_keyowrd;
       keywords_tmp =  document.querySelector('meta[name="keywords"]').content;
       description_tmp =  document.querySelector('meta[name="description"]').content;
       document.querySelector('meta[name="keywords"]').setAttribute("content",keywords_tmp+','+search_meta_keyowrd);
       document.querySelector('meta[name="description"]').setAttribute("content",description_tmp+' '+search_meta_keyowrd);*/
    };

    
    var decodeHTML = function (html) {
      var txt = document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
    };
    categoryTrigger = function(reqCatId,reqCatName,reqCatUrl){
      $scope.reqCategory_name = decodeHTML(reqCatName); $scope.reqCategory_id = reqCatId; $scope.reqCategory_url = reqCatUrl;
      document.querySelector('#ymmCategoryId').value=reqCatId;
      document.querySelector('#ymmCategoryUrl').value=reqCatUrl;
      document.querySelector('#ymmCategoryName').value= decodeHTML(reqCatName);
      /*$('#ymmCategoryId').val(reqCatId);
      $('#ymmCategoryUrl').val(reqCatUrl);
      $('#ymmCategoryName').val(reqCatName);*/

      /*$scope.globalsearchdata_category =  decodeURI(encodeURI($scope.reqCategory_name.trim()));
      $scope.categorysearch = true; $scope.fitmentsearch = true; $scope.nogetdata = false;
      $scope.searchfilter_category();*/
    }
    //$scope.searchfilter('');
    item_sort_mobile=function(sort){
       $scope.isLoading = true; $scope.isLoadingCategory = true;
       $scope.$applyAsync();
       $scope.paginationftn($scope.filter_products);
       if(sort=='Relevance'){
        $scope.reverse = false; $scope.sortingOrder =''; 
       }else if(sort=='Low to High'){
        $scope.reverse = false; $scope.sortingOrder ='productprice'//'saleprice';
       }
       else if(sort=='High to Low'){
        $scope.reverse = true; $scope.sortingOrder ='productprice';
       }
       if(sort=='A to Z'){
        $scope.reverse = false; $scope.sortingOrder ='page_title';
       }
       else if(sort=='Z to A'){
        $scope.reverse = true; $scope.sortingOrder ='page_title';
       }
       $scope.sortingOrder !='' ? $scope.sortBy($scope.sortingOrder) : '';
       $scope.mobilesort();

    }
    item_sort = function(e,eve){
        sort = e.value;
        //document.querySelector('.select_sortby').value= sort;
      var vx, i;
      vx = document.querySelectorAll(".select_sortby");
      for (i = 0; i < vx.length; i++) { vx[i].value = sort }
        (eve == 'foot') ? $scope.scrollto() : '';
        item_sort_mobile(sort);
    }
    item_perpage = function(e,eve){
      //limit = $(e).find('option:selected').val(); //limit = $('#select_limit option:selected').val();
      limit = e.value;
      //document.querySelector('.select_limit').value= limit;
      var vx, i;
      vx = document.querySelectorAll(".select_limit");
      for (i = 0; i < vx.length; i++) { vx[i].value = limit }
      //$('.select_limit').val(limit); 
      $scope.itemsPerPage = limit;
      (eve == 'foot') ? $scope.scrollto() : '';
      item_sort_mobile($scope.sortingOrder); //$scope.paginationftn($scope.filter_products);
    }

    setPage_drop = function(e,eve){
        $scope.currentPage = parseInt(e.value);
        $scope.tolimit = (($scope.currentPage+1)*$scope.itemsPerPage);
        $scope.fromlimit = ($scope.tolimit - $scope.itemsPerPage +1);
      var vx, i;
      vx = document.querySelectorAll(".pgn-gotoPage");
      for (i = 0; i < vx.length; i++) { vx[i].value = $scope.currentPage }
      (eve == 'foot') ? $scope.scrollto() : '';
      $scope.getcurrentproducts($scope.pagedItems[$scope.currentPage]);
    }

    $scope.datafilter = function(event,label,datas){
      console.log(event,label,datas);
      field_val = event.target.getAttribute('field');
      name_val = event.target.getAttribute('val');
      cat_name_val = event.target.getAttribute('name');
      var i=0;
      if(field_val =='price'){
         $scope.datafilter_price = name_val;
         i++;
      }else if(label =='attribute'){
        $scope.datafilter_attribute[field_val] = name_val;
         i++;
      }else{
        if(label == 'category'){
          angular.forEach($scope.catalogueCategory, function (value, key) {
              if(key == field_val){
                $scope.datafilter_category[key] = name_val;
                i++;
              }
          });
        }else{
          angular.forEach($scope.fitmentNames, function (value, key) {
              if(key == field_val){
                $scope.datafilter_fitment[key] = name_val;
                i++;
              }               
          });
        }
      } 
      $scope.data_filter = ( i > 0) ? true : false;
      $scope.productfilter(1);
      $scope.scrollto();
    };

    /*  webcategory ftns
    $scope.datafilter_webcategory = function(event){
      field_val = event.target.getAttribute('field');
      name_val = event.target.getAttribute('val');
      $scope.webcategory = name_val;
      if($scope.globalsearchdata !=''){
        $scope.searchfilter('exact',$scope.webcategory);
      }else if($scope.globalsearchdata_ymm !=''){
        $scope.searchfilter_fitment($scope.webcategory);
      }
    };
   $scope.backtocategory = function(){
      window.location.reload();
    };
    $scope.dataunfilter = function(event,label){
      field_val = event.target.getAttribute('field');
      if(field_val =='all'){
         //window.location.reload(); 
          angular.forEach($scope.catalogueCategory, function (value, key) {
               $scope.datafilter_category[key] = '';
          });
          angular.forEach($scope.fitmentNames, function (value, key) {
              $scope.datafilter_fitment[key] = '';               
          });
         $scope.data_filter=false; $scope.productfilter(0); 
      }else {
        if(field_val =='price'){
         $scope.datafilter_price = '';
        }else{
          if(label == 'category'){
            angular.forEach($scope.catalogueCategory, function (value, key) {
                 (key == field_val)?$scope.datafilter_category[key] = '':'';
            });
          }else{
            angular.forEach($scope.fitmentNames, function (value, key) {
                (key == field_val)?$scope.datafilter_fitment[key] = '':'';               
            });
          }
        }
        i = 0;
        angular.forEach($scope.datafilter_category, function (value, key) {
             (value != '')? i++ :'';
        });
        angular.forEach($scope.datafilter_fitment, function (value, key) {
           (value != '')? i++ :'';               
        });
        if($scope.datafilter_price =='' && i == 0){
           //window.location.reload();
           $scope.data_filter=false; $scope.productfilter(0); 
        }else{
          $scope.data_filter=true; $scope.productfilter(0); 
        }
      }
    };*/

    $scope.dataunfilter = function(event,label){
      field_val = event.target.getAttribute('field');
      i = 0;
      if(field_val =='all'){
         window.location.reload(); 
      }else {
        if(field_val =='price'){
         $scope.datafilter_price = '';
        }else if(label =='attribute'){
          //$scope.datafilter_attribute[field_val]='';
          delete $scope.datafilter_attribute[field_val];
        }else{
          if(label == 'category'){
            angular.forEach($scope.catalogueCategory, function (value, key) {
                 (key == field_val) ? $scope.datafilter_category[key] = '':'';
            });
          }else{
            angular.forEach($scope.fitmentNames, function (value, key) {
                (key == field_val)? $scope.datafilter_fitment[key] = '':'';               
            });
          }
        }

        angular.forEach($scope.datafilter_attribute, function (value, key) { (value != '')? i++ :''; });
        angular.forEach($scope.datafilter_category, function (value, key) { (value != '')? i++ :''; });
        angular.forEach($scope.datafilter_fitment, function (value, key) { (value != '')? i++ :''; });

        if($scope.datafilter_price =='' && i == 0){
          window.location.reload();
        }else{
          $scope.data_filter=true; $scope.productfilter(0); 
        }
      }
    };
    function search(user){
        return Object.keys(this).every((key) => user[key] === this[key]);
    }

    function arrayunique(a,b) {
      res = a.filter(function(obj) { return b.indexOf(obj) != -1; });
      return res;
    }
    $scope.productfilter = function(flag){
          $scope.isLoading = true; $scope.isLoadingCategory = true;
          var allaskus = [];  var catskus = []; var price_sku = []; var attrskus = [];
          var allproducts = $scope.filter_products_org;
          var productlevel = {};
          angular.forEach($scope.datafilter_category, function (value, key) {
              (value != '')?productlevel[key] = value :'';
          });
          $scope.categorquery = productlevel;
          var attrlevel = $scope.datafilter_attribute;
          //console.log(attrlevel,'here');
          $scope.attrquery = attrlevel;

          /*var attrlevel = {};
          angular.forEach($scope.datafilter_attribute, function (value, key) {
              var attrlevel = (value != '') ? [{ 'Attributename':key , 'Attributevalue':value }] : {};
          });
          $scope.attrquery = attrlevel;*/

          //fitmemnt part
          var fitmentlevel = {}; var fitskus = [];
          angular.forEach($scope.datafilter_fitment, function (value, key) {
             (value != '')? fitmentlevel[key] = value :'';              
          });
          $scope.fitmentquery = fitmentlevel;

          var tmpQuery = {};
          angular.extend(tmpQuery,$scope.ymmval,$scope.fitmentquery);

          allproducts.map((mapdata) => { 
             /*if(Object.keys(productlevel).length > 0){
               mapdata.categorytree.filter(search, $scope.categorquery).length > 0 ? catskus.push(mapdata.productsku):'';
             }
             if(Object.keys(fitmentlevel).length > 0){
                //new code 22-05-2020
                if(Object.keys($scope.ymmval).length > 0){
                    tmpQuery = angular.extend($scope.ymmval,$scope.fitmentquery);
                    mapdata.fitment.filter(search, tmpQuery).length > 0 ? fitskus.push(mapdata.productsku):'';
                }else{
                    mapdata.fitment.filter(search, $scope.fitmentquery).length > 0 ? fitskus.push(mapdata.productsku):'';
                }
                //new code 22-05-2020
             }*/
             mapdata.categorytreein =  [
                {
                    "category1_id": "-1",
                    "category2": "",
                    "category3": "",
                    "category4": "",
                    "category0": mapdata.producttype,
                    "category1": "",
                    "category3_id": "-1",
                    "category4_id": "-1",
                    "category2_id": "-1",
                    "category0_id": mapdata.sd_sort
                }
            ];

             if(Object.keys(productlevel).length > 0){
               mapdata.categorytreein.filter(search, $scope.categorquery).length > 0 ? catskus.push(mapdata.productsku):'';
             }
             
             if(Object.keys(attrlevel).length > 0){
                var c = 0; tcnt = 0;
                angular.forEach(attrlevel, function (value, key) {
                  //console.log(mapdata.attribute,value);
                  if(value != '' && mapdata.attribute !='' && mapdata.attribute !=null){
                    var aquery = { 'Attributename':key , 'Attributevalue':value };
                    mapdata.attribute.filter(search, aquery).length > 0 ? c++ :'';
                  }
                  tcnt++;
                  //console.log(Object.keys(attrlevel).length,tcnt,c,'sdfsdf');
                  (tcnt == Object.keys(attrlevel).length && tcnt == c) ? attrskus.push(mapdata.productsku) : '';
                });
             }

             if(Object.keys(fitmentlevel).length > 0){
                //$scope.fitmentquery //ptmpQuery
                mapdata.fitment.filter(search, $scope.fitmentquery).length > 0 ? fitskus.push(mapdata.productsku):'';
             }

             allaskus.push(mapdata.productsku);
            /*priceval  = (mapdata.saleprice <= 0)? parseFloat(mapdata.productprice) : parseFloat(mapdata.saleprice);
            ($scope.datafilter_price =='Less than $100' && priceval < 100) ? price_sku.push(mapdata.productsku) :'';
            ($scope.datafilter_price =='$100 and $200' && priceval < 201 && priceval > 99 ) ? price_sku.push(mapdata.productsku):'';
            ($scope.datafilter_price =='Greater than $200' && priceval > 200) ? price_sku.push(mapdata.productsku):''; */
          });
            
           
         /* console.log('sas sdsdf sdsdfd');
          console.log(catskus);
          console.log(fitskus);
          console.log(attrskus);
          console.log(price_sku);
          console.log('sas sdsdf sdsdfd');*/
          if(Object.keys(productlevel).length > 0 || 
            Object.keys(attrlevel).length > 0 || 
            Object.keys(fitmentlevel).length > 0 || 
            price_sku.length > 0 ){
              var filterskus  = allaskus;
              res1 = Object.keys(productlevel).length > 0 ? arrayunique(filterskus,catskus) : filterskus;
              res2 = Object.keys(fitmentlevel).length > 0 ? arrayunique(res1,fitskus) : res1;
              res3 = Object.keys(attrlevel).length > 0 ? arrayunique(res2,attrskus) : res2;
              var filter_sku = price_sku.length > 0 ? arrayunique(res3,price_sku) : res3;
          }
          /*if(Object.keys(productlevel).length > 0 && Object.keys(fitmentlevel).length > 0 ){
            var filter_sku_tmp = catskus.filter(function(obj) { return fitskus.indexOf(obj) != -1; });
            var filter_sku =  (price_sku.length > 0) ? filter_sku_tmp.filter(function(obj) { return price_sku.indexOf(obj) != -1; }) : filter_sku_tmp;
          }else if(Object.keys(productlevel).length > 0){
            var filter_sku_tmp = catskus;
            var filter_sku =  (price_sku.length > 0) ? filter_sku_tmp.filter(function(obj) { return price_sku.indexOf(obj) != -1; }) : filter_sku_tmp; 
          }else if(Object.keys(fitmentlevel).length > 0){
            var filter_sku_tmp = fitskus;
            var filter_sku =  (price_sku.length > 0) ? filter_sku_tmp.filter(function(obj) { return price_sku.indexOf(obj) != -1; }) : filter_sku_tmp; 
          }else{
            var filter_sku = price_sku; 
          }*/
          $scope.filteredItems_new = $filter('filter')($scope.filter_products_org, function (item) {
             return filter_sku.indexOf(item.productsku) > -1;
          });

          $scope.filter_products  = $scope.filteredItems_new;
          $scope.sidebarfilter('p');
          $scope.sorting =''; $scope.reverse = false; 
          //$scope.sortingOrder ='page_title';
          $scope.sortingOrder = ($scope.globalsearchdata !='' && $scope.globalsearchdata !=undefined)? 'page_title' : 'productsku';
          $scope.itemsPerPage = 12;
          $scope.paginationftn($scope.filter_products);
    };

     ////////////////////////
     groupBy = function(array, key)  {
        return array.reduce(function(result, currentValue)  {
          (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
          );
          return result;
        }, {});
     }  

     $scope.callattribute = function(attr_array){
      if(attr_array.length > 0){
        attrGroupedByname = groupBy(attr_array, 'Attributename');
        finalarray = {};  var k=0;                 
        for (var attr in attrGroupedByname) {  
          //check whether existing selected attr or not
          cnt = 0;
          for(selectedkey in $scope.input){
            ($scope.input[selectedkey].attr == attr)? cnt++ : '';
          }
          if(cnt == 0){
              attrGroupedByvalue = groupBy(attrGroupedByname[attr], 'Attributevalue');
              var result = [];
              angular.forEach(attrGroupedByvalue, function(val, index) {
                  order =  parseFloat(index);
                  result.push({'order':order,'val':val,'index':index});
              });
              value = result;
              //finalarray.push({attr,value});
              finalarray[attr] = {'value':value,'idval':'Attr_'+k};
              /*attrGroupedByvalue = groupBy(attrGroupedByname[attr], 'Attribute_value');   
              finalarray[attr] = {'attr_val':attrGroupedByvalue,'len':Object.keys(attrGroupedByvalue).length };*/
          }
          k++;
        }
        $scope.attribute_list = finalarray;
        //console.log($scope.attribute_list);
      }else{
        $scope.attribute_list = {};
      }
     };
     ////////////////////////
     $scope.catLang = {};$scope.categoryLangue = {}; $scope.filtersort = {};
    $scope.sidebarfilter = function(eFrom){

          var filterproduct = $scope.filter_products;
          categoryarray = {}; categoryLang = {}; var attrarray = [];
          angular.forEach($scope.catalogueCategory, function (value, key) {
              categoryarray[key] = [];
              //categoryLang[key] = [];
          }); 
                mappingarray = {};
          angular.forEach($scope.fitmentNames, function (value, key) {
              mappingarray[key] = [];
          }); 
          var price_range_less = [];var price_range_mid = [];var price_range_high = []; var category_hide = $scope.categoryIgnore;

          var tmpQuery = {};
          angular.extend(tmpQuery,$scope.ymmval,$scope.fitmentquery);

          filterproduct.map((data, k)=>{ 

        data.categorytreein =  [
    {
        "category1_id": "-1",
        "category2": "",
        "category3": "",
        "category4": "",
        "category0": data.producttype,
        "category1": "",
        "category3_id": "-1",
        "category4_id": "-1",
        "category2_id": "-1",
        "category0_id": data.sd_sort
    }
];

            $scope.filtersort[data.page_title] =  parseInt(data.sd_sort);

            (data.attribute != undefined && data.attribute.length > 0) ? attrarray  = attrarray.concat(data.attribute) : ''; 

            //category
              uniquecategory = {};
              angular.forEach($scope.catalogueCategory, function (value, key) {
                  uniquecategory[key] = [];
              }); 
              /*if($scope.categorquery !=''){*/ 
              if(Object.keys($scope.categorquery).length > 0){
                  data.categorytreein.filter(search, $scope.categorquery).map((catdata)=>{
                        //if(category_hide.indexOf(catdata['category0_id']) == -1 ){
                            angular.forEach($scope.catalogueCategory, function (value, key) {
                               catdata[key] != null && catdata[key] != '' ? uniquecategory[key].push(catdata[key]) :'';
                            });
                        //}
                  });
              }else{
                  data.categorytreein.map((catdata,key) => {
                    //if(category_hide.indexOf(catdata['category0_id']) == -1 ){
                      angular.forEach($scope.catalogueCategory, function (value, key) {                      
                           if(eFrom !=undefined && eFrom !='p' && catdata[key] != null && catdata[key] != '')
                           {
                            categoryLang[catdata[key]] == undefined ? categoryLang[catdata[key]] =  [] : '';  
                            categoryLang[catdata[key]] = data.productsku;
                           }
                           catdata[key] != null && catdata[key] != '' ? uniquecategory[key].push(catdata[key]) :'';
                      }); 
                    //} 
                  });
              }
              tempCat = uniquecategory;
              angular.forEach(tempCat, function (value, key) {
                    [...new Set(uniquecategory[key])].filter(Boolean).map((data)=> categoryarray[key].push(data));
              }); 
            //fitment
                uniquefilter = {};
                angular.forEach($scope.fitmentNames, function (value, key) {
                     uniquefilter[key] = [];
                }); 
                //new code 22-05-2020
                /*if($scope.fitmentquery !=''){
                    if(Object.keys($scope.ymmval).length > 0){
                            tmpQuery = angular.extend($scope.ymmval,$scope.fitmentquery);
                            data.fitment.filter(search, tmpQuery).map((catdata)=>{
                              angular.forEach($scope.fitmentNames, function (value, key) {
                                   catdata[key] != null && catdata[key] != '' ? uniquefilter[key].push(catdata[key]) :'';
                              });
                            });
                        }else{
                            data.fitment.filter(search, $scope.fitmentquery).map((catdata)=>{
                              angular.forEach($scope.fitmentNames, function (value, key) {
                                   catdata[key] != null && catdata[key] != '' ? uniquefilter[key].push(catdata[key]) :'';
                              });
                            });
                        }
                }else{
                    if(Object.keys($scope.ymmval).length > 0){
                        data.fitment.filter(search, $scope.ymmval).map((catdata)=>{
                          angular.forEach($scope.fitmentNames, function (value, key) {
                               catdata[key] != null && catdata[key] != '' ? uniquefilter[key].push(catdata[key]) :'';
                          });
                        });
                    }else{
                        data.fitment.map((catdata,key) => {
                            angular.forEach($scope.fitmentNames, function (value, key) {
                               catdata[key] != null && catdata[key] != '' ? uniquefilter[key].push(catdata[key]) :'';
                            }); 
                        });
                    }
                }*/
              //new code 22-05-2020

              //new code 22-04-2021 
                if(Object.keys(tmpQuery).length > 0){
                    data.fitment.filter(search, tmpQuery).map((catdata)=>{
                        angular.forEach($scope.fitmentNames, function (value, key) {
                             if(catdata[key] != null && catdata[key] != ''){
                                catdata[key].trim() != '' ? uniquefilter[key].push(catdata[key].trim()) :'';
                             }
                             //catdata[key] != null && catdata[key] != '' && catdata[key]!= ' ' && catdata[key]!= '  ' ? uniquefilter[key].push(catdata[key]) :'';
                        });
                    });
                }else{
                    data.fitment.map((catdata,key) => {
                        angular.forEach($scope.fitmentNames, function (value, key) {
                             if(catdata[key] != null && catdata[key] != ''){
                                catdata[key].trim() != '' ? uniquefilter[key].push(catdata[key].trim()) :'';
                             }
                        }); 
                    });
                }
              //new code 22-04-2021  
               temps = uniquefilter;
               angular.forEach(temps, function (value, key) {
                    [...new Set(uniquefilter[key])].filter(Boolean).map((data)=> mappingarray[key].push(data));
               }); 

             /* priceval  = (data.saleprice <= 0)? parseFloat(data.productprice) : parseFloat(data.saleprice);
              if(priceval < 100){
                price_range_less.push(data.productsku);
              }else if(priceval >= 100 && priceval <= 200){
                price_range_mid.push(data.productsku);
              }else{
                price_range_high.push(data.productsku);
              }*/

              (filterproduct.length-1 == k) ? $scope.callattribute(attrarray) : '';
          });
          
          //category sku for langswtich  
          if(eFrom !=undefined && eFrom !='p'){
            $scope.catLang = categoryLang;
            skusin = Object.values(categoryLang).length > 0 ? Object.values(categoryLang) : [];
            //console.log(skusin);
            $http({
                method  : 'POST',url     : $scope.base_url+"apa_categoryLanguage",
                datatype:'JSON', 
                data    : { sku:skusin,lang:$scope.currlanguage},
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
             })
             .then(function(res) {
                  if(res.data !=undefined && res.data.length > 0 ){
                     angular.forEach(res.data, function (value, key) {
                        langg = value.description != '' ?  value.description.split('##') : [];
                        if($scope.categoryLangue[value.sku] == undefined ) {
                         $scope.categoryLangue[value.sku] = [];
                         $scope.categoryLangue[value.sku] = langg;
                        }  
                     });
                  }
                  //$scope.categoryLang = res.data !=undefined && res.data.length > 0 ? groupBy(res.data, 'sku') : {};
              //console.log($scope.catLang,$scope.categoryLangue); 
             });
          }
           
          // price range
          $scope.price_range_less = price_range_less; $scope.price_range_mid = price_range_mid; $scope.price_range_high = price_range_high;
          pcnt = 0;
          ($scope.price_range_less.length > 0)? pcnt++ :'';
          ($scope.price_range_mid.length > 0)?  pcnt++ :'';
          ($scope.price_range_high.length > 0)? pcnt++ :''; 
            $scope.priceview =  pcnt;
          // category
            $scope.bigCategory_array = {};
           
            angular.forEach($scope.catalogueCategory, function (value, key) {
                var cat_cntarr = [];

                [...new Set(categoryarray[key].sort())].map((mapdata) => { cat_cntarr.push({"name" : mapdata ,"sort" :  ($scope.filtersort[mapdata] != undefined ?  $scope.filtersort[mapdata] : ''), "sku" :  ($scope.catLang[mapdata] != undefined ?  $scope.catLang[mapdata] : '')  , "count_parts" : categoryarray[key].filter((filterdata) => filterdata !=null && filterdata !='' ? filterdata == mapdata :'').length})  });
                $scope.bigCategory_array[key] = cat_cntarr;
            }); 
             console.log(categoryarray,$scope.bigCategory_array,'asdasd');
          //fitment
            $scope.fitment_array = {};
            angular.forEach($scope.fitmentNames, function (value, key) {
                var cntarr = [];
                [...new Set(mappingarray[key].sort())].map((mapdata) => { cntarr.push({"name" : mapdata , "count_parts" : mappingarray[key].filter((filterdata) => filterdata !=null && filterdata !='' ? filterdata == mapdata :'').length})  });
                $scope.fitment_array[key] = cntarr;
            }); 
    };
    $scope.filterlangCat = {};
    $scope.catLangbind = function(data) {
      sku= data.sku != undefined ? data.sku:'';
      text= data.name != undefined ? data.name:'';
      count= data.count_parts != undefined ? data.count_parts: 0;
      //$scope.filterlangCat[sku] =[];
      lang_text = text;
      if(sku !=undefined && sku !='' && $scope.categoryLangue[sku] !=undefined){
        tmp_text = '';  splitlang = {};
        angular.forEach($scope.categoryLangue[sku], function (val, k) {
          (val.toLowerCase()).indexOf($scope.currlanguage+'::') != -1 ? tmp_text = val : '';
          langtext = val.split('::');
          splitlang[langtext[0].toLowerCase()] = langtext[1];
          //$scope.filterlangCat[sku].push({lang:langtext[0].toLowerCase(),text:langtext[1]});
        });
        splitlang['en'] != undefined ? $scope.filterlangCat[splitlang['en']] = splitlang : '';
        (tmp_text !='' && tmp_text.split('::')[1] !=undefined)?  lang_text = tmp_text.split('::')[1] : '';
      }
      //console.log(data,sku,text,count);
      lang_text = count > 0 ? lang_text+'<em class="cnt-sec" field="category0" val="'+text+'">('+count+')<em>': lang_text;
      return lang_text;
    }

    $scope.catLangFbind = function(lang_text) {
      //console.log($scope.filterlangCat,lang_text,'sdsd');
      return ($scope.filterlangCat[lang_text] !=undefined && $scope.filterlangCat[lang_text][$scope.currlanguage] !=undefined)? $scope.filterlangCat[lang_text][$scope.currlanguage] : lang_text;
    }

    $scope.itemsPerPage =12; $scope.sortingOrder = 'page_title'; $scope.reverse = false;
    $scope.paginationftn = function(items){
      
      $scope.itemsPerPage = ($scope.globalsearchdata_ymm !='') ? $scope.filter_products.length : 12;

      $scope.sortingOrder = ($scope.globalsearchdata !='' && $scope.globalsearchdata !=undefined)? 'page_title' : 'productsku';

      $scope.nodata = false; $scope.currentPage = 0; $scope.interdata = items;
      $scope.filteredItems = []; $scope.groupedItems = []; $scope.pagedItems = []; $scope.pagenos = []; $scope.pagenos_drop = [];
        //pagination part start
        $scope.sortBy = function(propertyName) {
            $scope.sortKey = propertyName; //$scope.reverse = ($scope.sortKey === propertyName) ? !$scope.reverse : false;
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortKey, $scope.reverse);
            $scope.groupToPages();
            //call currentpage data
            inproducts = ($scope.pagedItems.length > 0 )?$scope.pagedItems[0]:[];
            $scope.getcurrentproducts(inproducts);
        };
        var searchMatch = function (haystack, needle) {
          if (!needle) {  return true; }
          if(haystack !== null){ return haystack.toString().toLowerCase().indexOf(needle.toString().toLowerCase());}
        };
        //*****************init the filtered items*****************
        $scope.mysearch = function () {
            /*$scope.filteredItems = $filter('filter')($scope.interdata, function (item) {
                if(item.page_title != '') {
                  if (searchMatch(item.page_title, $scope.query)  > -1){ return true; }
                }
                return false;
            });*/
            if ($scope.sortingOrder !== '') {
                
                /*$scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse);*/
                $scope.filteredItems = $filter('orderBy')($scope.interdata, ['sd_sort','bd_sort','productsku']);
            }
            $scope.currentPage = 0; $scope.groupToPages();
            //console.log($scope.filteredItems);
        };
        // calculate page in place
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
          $scope.$applyAsync();
        };
        $scope.range = function (start, end) {
            var ret = [];
            if (!end) { end = start; start = 0; }
            for (var i = start; i < end; i++) { ret.push(i); }
            $scope.pagenos = ret;
            return ret;
        };
                      
        $scope.tolimit = (($scope.currentPage+1)*$scope.itemsPerPage);
        $scope.fromlimit = ($scope.tolimit - $scope.itemsPerPage +1);
        $scope.prevPage = function (eve) {
            if ($scope.currentPage > 0) { $scope.currentPage--; }
            $scope.tolimit = (($scope.currentPage+1)*$scope.itemsPerPage);
            $scope.fromlimit = ($scope.tolimit - $scope.itemsPerPage +1);
          //scroll to top click
           (eve == 'foot') ? $scope.scrollto() : '';
          //call current page products
            $scope.getcurrentproducts($scope.pagedItems[$scope.currentPage]);
           
        };
        $scope.nextPage = function (eve) {
            if ($scope.currentPage < $scope.pagedItems.length - 1) { $scope.currentPage++; }
            $scope.tolimit = (($scope.currentPage+1)*$scope.itemsPerPage);
            $scope.fromlimit = ($scope.tolimit - $scope.itemsPerPage +1);
          //scroll to top click
          (eve == 'foot') ? $scope.scrollto() : '';
                //call current page products
            $scope.getcurrentproducts($scope.pagedItems[$scope.currentPage]);
        };
        $scope.setPage = function (eve) {
            $scope.currentPage = this.n;
            $scope.tolimit = (($scope.currentPage+1)*$scope.itemsPerPage);
            $scope.fromlimit = ($scope.tolimit - $scope.itemsPerPage +1);
          //scroll to top click
           (eve == 'foot') ? $scope.scrollto() : '';
            //call current page products
            $scope.getcurrentproducts($scope.pagedItems[$scope.currentPage]);
        };


        $scope.mysearch();
        $scope.$watch('currentPage', function(pno,oldno){
            start =  (pno-2 > -1)? pno-2:0;
            $scope.range(start, $scope.pagedItems.length);
        });
        $scope.range($scope.pagedItems.length);

        /***********/
           if($scope.pagedItems.length > 0){
            var retin = [];
            for (var ii = 0; ii < $scope.pagedItems.length; ii++) { retin.push(ii); }
            $scope.pagenos_drop = retin; 
           }
        /***********/
        //call current page products
        inproducts = ($scope.pagedItems.length > 0 )?$scope.pagedItems[0]:[];
        $scope.getcurrentproducts(inproducts);
        //pagination part end
        if($scope.pagedItems.length < 1){
          $scope.splitlink =  $scope.globalsearchdata.split(' ');
          $scope.nodata = true;
        }
        $scope.$applyAsync();
        //$scope.isLoading = false;
        //$scope.isLoadingCategory = false;
    };

      $scope.scrollto = function(){
        var element = document.getElementById("APAMain-div");
        element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        //document.querySelector("#scrollToTopFloatingButton").click();
      };

    $scope.currProducts = {}; $scope.currProducts['qty'] = {}; $scope.c_price = {};
    $scope.getcurrentproducts = function(inproducts){
        $scope.isLoading = true; $scope.isLoadingCategory = true;
        productid_arr = []; productsku_arr = [];
        angular.forEach(inproducts, function (value, key) {
            productid_arr.push(value.productid);
            productsku_arr.push(value.productsku);
        });
        $scope.currProducts = {}; $scope.currProducts['qty'] = {}; $scope.c_price = {};

        skeyword = $scope.globalsearchdata !=undefined && $scope.globalsearchdata !='' ? $scope.globalsearchdata : '';
        $http({
          method  : 'POST',url     : $scope.base_url+"apa_catalogue_product",
          datatype:'JSON', 
          data    : { products:productid_arr, //product_sku:productsku_arr,
            ymm:$scope.ymmval,on:$scope.Options_Notes,
            customer_id:$scope.customer_id,baseurl: redirect_url,lang:$scope.currlanguage,'keyword': skeyword},
          headers: {'Content-Type':'application/x-www-form-urlencoded'}
       })
       .then(function(res) {
          response = res.data; //JSON.parse(res);
          if(response.result != undefined && response.result.length > 0){
              $scope.notesdata = (response.no_data !=undefined && response.no_data.length) > 0 ? groupBy(response.no_data, 'productsku') : {};
              $scope.grade = (response.grade !=undefined && response.grade.length) > 0 ? groupBy(response.grade, 'productsku') : {};
              $scope.optionsdata = (response.op_data !=undefined && response.op_data.length) > 0 ? groupBy(response.op_data, 'productsku') : {};
              //$scope.fabdata = (response.fab !=undefined && response.fab.length) > 0 ? groupBy(response.fab, 'productsku') : {};
              $scope.fabdataIn = (response.fabIn !=undefined && response.fabIn.length) > 0 ? groupBy(response.fabIn, 'productsku') : {};
              //$scope.langdata = (response.lang !=undefined && response.lang.length) > 0 ? groupBy(response.lang, 'productsku') : {};
              $scope.branddata = (response.brand !=undefined && response.brand.length) > 0 ? groupBy(response.brand, 'productsku') : {};
              $scope.shodata = (response.sho !=undefined && response.sho.length) > 0 ? groupBy(response.sho, 'productsku') : {};
              $scope.innotes= (response.innotes !=undefined && response.innotes.length) > 0 ? groupBy(response.innotes, 'productsku') : {};

              angular.forEach(response.result, function (value, key) {
                value.notes = ($scope.notesdata[value.productsku] !=undefined) ? $scope.notesdata[value.productsku] : [];
                value.options = ($scope.optionsdata[value.productsku] !=undefined) ? $scope.optionsdata[value.productsku] : []; 
                //value.fab = ($scope.fabdata[value.productsku] !=undefined) ? $scope.fabdata[value.productsku] : [];
                value.grade = ($scope.grade[value.productsku] !=undefined) ? $scope.grade[value.productsku][0]['val'] : '';
                value.fab = ($scope.fabdataIn[value.productsku] !=undefined 
                  && $scope.fabdataIn[value.productsku][0]['description'] !=undefined)? $scope.fabdataIn[value.productsku][0]['description'] : '';
                /*if($scope.langdata[value.productsku] !=undefined){
                  ($scope.langdata[value.productsku][0]['brand'] !=undefined) ? value.brand = $scope.langdata[value.productsku][0]['brand'] : '';
                  ($scope.langdata[value.productsku][0]['shortdesc'] !=undefined) ? value.page_title = $scope.langdata[value.productsku][0]['shortdesc'] : '';
                }*/
                ($scope.branddata[value.productsku] !=undefined) ? value.brand = $scope.branddata[value.productsku][0]['val'] : '';
                ($scope.shodata[value.productsku] !=undefined) ? value.page_title = $scope.shodata[value.productsku][0]['val'] : '';

                value.innotes = ($scope.innotes[value.productsku] !=undefined) ?  $scope.innotes[value.productsku] : [];
                $scope.currProducts[value.productid] = value;
              })
          }
          if(response.result_inventory != undefined && response.result_inventory.length > 0){
              angular.forEach(response.result_inventory, function (value, key) {
                $scope.currProducts['qty'][value.productsku] = value.qty;
              })
          }
          
          $scope.c_price = response.c_price = (response.c_price != undefined && Object.keys(response.c_price).length > 0) ? response.c_price : []; 
          
          $scope.isLoading = false; $scope.isLoadingCategory = false;
          $scope.$applyAsync();
          //console.log($scope.currProducts);
       });
    };
    $scope.htmltotext = function(html,limit){
      var div = document.createElement("div");
      div.innerHTML = html;
      str = div.innerText.trim(); 
      return (str.length > limit) ? str.substr(0,limit)+'...' : str;  
    };



    $scope.get_attribute = function(products){
        $scope.$ctrl.DLfilter='';
        input = ($scope.input.length > 0) ? $scope.input:'';

         catskus_org = $scope.catskus_part; 
         var catskus = []; //var price_sku = [];
         var allproducts = $scope.filteredItems_part;
          filter_parts = $scope.attribute_list_part;
          filter_catskus = [];
          if(input !=''){
            input.map(function(mapdata)  {
              for (var key in filter_parts[mapdata.attr]['value']){
                  //console.log(mapdata.attr =='Position' , $scope.selected_webcategory == 'Universal Joints' , filter_parts[mapdata.attr]['value'][key]['wd'] == $scope.selected_wd)
                 if(mapdata.attr =='Position' && $scope.selected_webcategory == 'Universal Joints' && filter_parts[mapdata.attr]['value'][key]['wd'] == $scope.selected_wd  ){
                    //console.log(filter_parts[mapdata.attr]['value'][key]['index']);
                    (filter_parts[mapdata.attr]['value'][key]['index'] == mapdata.val) ? filter_parts[mapdata.attr]['value'][key]['val'].map(function(skudata){ 
                       catskus.push(skudata) 
                    }) :'';
                 }else{
                    (filter_parts[mapdata.attr]['value'][key]['index'] == mapdata.val) ? filter_parts[mapdata.attr]['value'][key]['val'].map(function(skudata){ 
                      catskus.push(skudata.Part_number) 
                     }) :'';
                 }

              }    
           });

            catskus.map(function (data) { 
              catskus.filter(function (filterdata) { return filterdata == data; }).length == input.length ? filter_catskus.push(data) : '';
            });
          }else{ catskus = catskus_org; 
            filter_catskus = catskus;
          }
          // /catskus = [...new Set(catskus)]; 
          //console.log(catskus)
          //catskus.map((data)=>{ (catskus.filter((filterdata) => filterdata == data ).length == input.length) ? filter_catskus.push(data):'' });

          attr_array = response.attr; 
          var k=0;
          attrGroupedByname = groupBy(attr_array, 'Attributename');
          finalarray = {};                   
          for (var attr in attrGroupedByname) {  
            //check whether existing selected attr or not
            cnt = 0;
            for(selectedkey in $scope.input){
              ($scope.input[selectedkey].attr == attr)? cnt++ : '';
            }
            if(cnt == 0){
                attrGroupedByvalue = groupBy(attrGroupedByname[attr], 'Attributevalue');
                var result = [];
                angular.forEach(attrGroupedByvalue, function(val, index) {
                    order =  parseFloat(index);
                    result.push({'order':order,'val':val,'index':index});
                });
                value = result;
                //finalarray.push({attr,value});
                finalarray[attr] = {'value':value};
                /*attrGroupedByvalue = groupBy(attrGroupedByname[attr], 'Attribute_value');   
                finalarray[attr] = {'attr_val':attrGroupedByvalue,'len':Object.keys(attrGroupedByvalue).length };*/
            }
            k++;
          }

          $scope.attribute_list = finalarray;
          $scope.filteredItems_attr = $filter('filter')(allproducts, function (item) {
             return filter_catskus.indexOf(item.productsku) > -1;
          });
          $scope.filter_products  = $scope.filteredItems_attr;

          //reset sorting and limit
          $scope.reverse = false;
          //$scope.sortingOrder ='page_title'; 
          $scope.sortingOrder = ($scope.globalsearchdata !='' && $scope.globalsearchdata !=undefined)? 'page_title' : 'productsku';
          $scope.itemsPerPage = $scope.global_limit;

          /*$('.select_sortby').val($scope.global_sort);
          $('.select_limit').val($scope.global_limit);
          $('.panel-collapse').removeClass('show');
          $('#attr_0').addClass('show');
          $('.attrlinks').addClass('collapsed');
          $('#attrlink_0').removeClass('collapsed');
          $scope.paginationftn($scope.filter_products);*/
                 
          if($scope.innerWidth < 768){ $scope.flip = 0; $('#accordion')[0].style.setProperty( 'display', 'none', 'important' ) }
      };

      $scope.printToCart_old = function() {
        var innerContents ='';
        if (document.getElementById('print-section-div') != undefined){
           innerContents = document.getElementById('print-section-div').innerHTML;
        }else{
           innerContents = document.getElementById('print-section').innerHTML; 
        }

        //innerContents = document.getElementById('print-section').innerHTML; 
        
        var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        $scope.base_url_in = $scope.base_url;
        //$scope.base_url_in = 'http://localhost/FirstBrand/'; <link rel="stylesheet" type="text/css" href="'+$scope.base_url_in+'assets/css/apa_print.css" media="print" >

        popupWinindow.document.write('<html><head></head><body class="print-body" onload="window.print()">' + innerContents + '</body></html>');
        popupWinindow.document.close();
      }

      $scope.printToCart = function () {
        var contents ='';
        if (document.getElementById('print-section-div') != undefined){
           contents = document.getElementById('print-section-div').innerHTML;
        }else{
           contents = document.getElementById('print-section').innerHTML; 
        }

        var body = document.getElementsByTagName("BODY")[0];

        //Create a dynamic IFRAME.
        var frame1 = document.createElement("IFRAME");
        frame1.name = "frame1";
        frame1.setAttribute("style", "position:absolute;top:-1000000px");
        body.appendChild(frame1);

        //Create a Frame Document.
        var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
        frameDoc.document.open();

        //Create a new HTML document.
        frameDoc.document.write('<html><head><title>Part Search Results</title>');
        frameDoc.document.write(`<style>
        
@page {
  size: A4;
  margin: 11mm 17mm 17mm 17mm;
}
@print {
    @page :footer {
        display: none
    }
  
    @page :header {
        display: none
    }
}
@media print {
    
    .content-block, p {
      page-break-inside: avoid;
    }
   @page {
        margin-top: 0;
        margin-bottom: 0;
    }
    body {
        padding-top: 72px;
        padding-bottom: 72px ;
    }

}</style>`);
        frameDoc.document.write('</head><body class="print-body"><div class="APAcontainer">');
        
        $scope.base_url_in = $scope.base_url;
        //$scope.base_url_in = 'http://localhost/FirstBrand/';

        //Append the external CSS file.
        //frameDoc.document.write('<link href="'+$scope.base_url_in+'assets/css/apa_print.css" media="print" rel="stylesheet" type="text/css" />');

        //Append the DIV contents.
        frameDoc.document.write(contents);
        frameDoc.document.write('</div></body></html>');
        frameDoc.document.close();

        $window.setTimeout(function () {
            $window.frames["frame1"].focus();
            $window.frames["frame1"].print();
            body.removeChild(frame1);
        }, 500);
    };


});    
app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      var defaultSrc = attrs.src;
      element.bind('error', function() {
        if(attrs.errSrc) {
            element.attr('src', attrs.errSrc);
        }
        else if(attrs.src) {
            element.attr('src', defaultSrc);
        }
      });
    }
  }
});
app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });
app.filter('trustAsHtml',['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }]);

angular.bootstrap(document.getElementById("searchcatalog"), ['myApp']);


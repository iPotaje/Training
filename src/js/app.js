angular
.module("theApp", ['ui.grid', 'ui.router', 'templates', 'ui.grid.selection'])
.config(function($locationProvider, $urlRouterProvider, $stateProvider)
{
  $stateProvider
    .state('root',
    {
        url: '/',
        abstract : true,
        views :{
          '':{
            templateUrl : 'base.htm'
          },
          'header@root':{
            templateUrl: 'header.htm'
          },
          'footer@root':{
            templateUrl:'footer.htm'
          }
        }
    })
    .state('home',
    {
        url: "",
        parent: 'root',
        views:{
          'main@root':{
            templateUrl: "home.htm",
            controller : 'WebListController'
          }
        }
    })
    .state('form',
    {
        url: "",
        parent: 'home',
        views:{
          'form@root':{
            templateUrl: "form.htm",
            controller : "FormController"
          }
        }
    })
    .state('addForm',
    {
        url: "addForm",
        parent: 'form',
        views:{
          'form@form':{
            templateUrl: "addform.htm",
            controller : 'AddFormController'
          }
        }
    })
    .state('viewForm',
    {
        url: "viewForm/:id",
        parent: 'form',
        views:{
          'form@form':{
            templateUrl: "viewform.htm",
            controller : 'ViewFormController'
          }
        }
    })
    .state('deleteForm',
    {
        url: "deleteForm/:id",
        parent: 'form',
        views:{
          'form@form':{
            templateUrl: "deleteform.htm",
            controller : 'DeleteFormController'
          }
        }
    })
    .state('deleteMulti',
    {
        url: "deleteMulti",
        parent: 'form',
        views:{
          'form@form':{
            templateUrl: "deleteform.htm",
            controller : 'DeleteMultiController'
          }
        }
    })
    .state('editForm',
    {
        url: "editForm/:id",
        parent: 'form',
        views:{
          'form@form':{
            templateUrl: "addform.htm",
            controller : 'EditFormController'
          }
        }
    })
    ;
    $urlRouterProvider.otherwise('/');
})
;

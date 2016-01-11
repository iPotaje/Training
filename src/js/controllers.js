var db = new Nedb({
    filename: 'library.db',
    autoload: true
  });

angular
.module("theApp")
.value("db", db)
.controller("WebListController", function($sce, $scope, $rootScope, $timeout, $state, uiGridSelectionService)
{
  $rootScope.to_trusted = function(html_code) {
    return $sce.trustAsHtml(html_code);
  }
  $scope.showMe = function(row){
     alert(row.entity._id);
     console.log(row);
     $state.go("viewForm", {id:row.entity._id});
  };

  $scope.gridOptions = {
    enableSorting: true,
    enableRowSelection: true,
    enableSelectAll: true,
    multiSelect: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 35,
    columnDefs: [
      { name: 'title', maxWidth: 220},
      { name: 'url', displayName: "URL" },
      { name: 'id', visible: false },
      { name: 'botones', displayName: "", enableSorting: false, enableColumnMenu: false, minWidth: 124,maxWidth: 130,
        cellTemplate:'<div class="text-center"><button title="View" class="btn primary" ui-sref="viewForm({id:row.entity._id})"><i class="icon ion-eye"></i></button>'
                      + '&nbsp;<button title="Edit" class="btn primary" ui-sref="editForm({id:row.entity._id})"><i class="icon ion-edit"></i></button>'
                      + '&nbsp;<button title="Delete" class="btn primary" ui-sref="deleteForm({id:row.entity._id})"><i class="icon ion-close-round"></i></button></div>'
      }
    ]
  };
  db.find({}, function(err, docs)
  {
    $timeout(function(){
      $scope.gridOptions.data = docs;
    },5);
  });
  $scope.deleteSelectedRows = function(){
    $rootScope.toDelete = $scope.gridApi.selection.getSelectedRows();
    $state.go("deleteMulti");
    // for(var i = 0; i < selection.length; i++)
    // {
    //   db.remove({_id: selection[i]._id});
    // }
  };
  $scope.gridOptions.onRegisterApi = function(gridApi){
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope,function(row){
      var msg = 'row selected ' + row.isSelected;
      console.log(msg);
    });

    gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
      var msg = 'rows changed ' + rows.length;
      console.log(msg);
    });
  };
})

.controller("FormController", function($scope, db, $timeout, $state)
{
  $timeout(function (){
      $('#theForm').modal('show');
  },100);

  $('#theForm').on('hidden.bs.modal', function (e) {
    $state.go('home', {}, { reload: true });
  });
})

.controller("AddFormController", function($scope, db, $timeout, $state)
{
  $scope.formTitle = "Form Add";
  $scope.title = "";
  $scope.url = "";
  $scope.saveFormBtn = function ()
  {
    console.log($scope.title + " : " + $scope.url);
    db.insert({title: $scope.title, url: $scope.url}, function(err, docs)
    {
      if (err)console.log(err);
    });
    $('#theForm').modal('hide');
    db.find({}, function(err, docs)
    {
      if(err)console.log(err);
    });
  }
})

.controller("ViewFormController", function($scope, db, $timeout, $stateParams)
{
  db.findOne({_id: $stateParams.id}, function(err, doc)
  {
    $scope.title  = doc.title;
    $scope.url    = doc.url;
  });
})

.controller("EditFormController", function($scope, db, $timeout, $stateParams)
{
  $scope.formTitle = "Form Edit";
  db.findOne({_id: $stateParams.id}, function(err, doc)
  {
    $scope.title  = doc.title;
    $scope.url    = doc.url;
  });
  $scope.saveFormBtn = function ()
  {
    $('#theForm').modal('hide');
    db.update({_id: $stateParams.id}, {title: $scope.title, url: $scope.url})
  };
})

.controller("DeleteFormController", function($scope, db, $timeout, $stateParams)
{
  $scope.formTitle = "Are you sure you want to delete the following record?";
  db.findOne({_id: $stateParams.id}, function(err, doc)
  {
    $scope.message = '<p>' + doc.title + '</p><p>' + doc.url + '</p>';
  });

  $scope.deleteRecord = function () {
    $('#theForm').modal('hide');
    db.remove({_id: $stateParams.id});
  }
})

.controller("DeleteMultiController", function($rootScope, $scope, db, $timeout, $stateParams)
{
  var selection = $rootScope.toDelete;
  $rootScope.toDelete = Array();

  if(selection.length > 0){
    $scope.formTitle = "Are you sure you want to delete the following records?";
    $scope.message = "";
    for(var i = 0; i < selection.length; i++)
    {
      if (i > 0) $scope.message += ", ";
      $scope.message += selection[i].title;
    }
  }else {
    $scope.formTitle = "Before you must select any record!";
  }
  $scope.deleteRecord = function () {
    $('#theForm').modal('hide');
    for(var i = 0; i < selection.length; i++)
    {
      // console.log(selection[i]);
      db.remove({_id: selection[i]._id})
    }
  }
})

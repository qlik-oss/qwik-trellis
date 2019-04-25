var qlik = window.require('qlik');
import chartTypes from './chartTypes.js';
import $ from 'jquery';

export default ['$scope', '$element', function ($scope, $element) {
  $scope.layoutId = $scope.layout.qInfo.qId;
  var enigma = $scope.component.model.enigmaModel;
  var app = qlik.currApp($scope);
  $scope.sessionIds = [];
  setupStyles().then(function () {
    createTrellisObjects();
  });
  $scope.mobileMode = window.innerWidth < 650;

  $scope.layout.getScope = function () {
    return $scope;
  };

  $scope.$watch("layout.prop.columns", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      setupStyles().then(function () {
        createTrellisObjects();
      });
    }
  });

  $scope.$watch("mobileMode", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      setupStyles().then(function () {
        createTrellisObjects();
      });
    }
  });

  $scope.$watch("layout.prop.slideMode", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      setupStyles().then(function () {
        createTrellisObjects();
      });
    }
  });

  $scope.$watch("layout.qStateName", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      setupStyles().then(function () {
        createTrellisObjects();
      });
    }
  });

  function setupStyles() {
    return new Promise(function (resolve, reject) {
      if (!$scope.layout.qHyperCube.qDimensionInfo[0]) {
        resolve();
      }

      // Create hypercube
      getCube($scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0]).then(function (cube) {
        $scope.currentCube = cube;
        $scope.colNum = parseInt($scope.layout.prop.columns);
        if ($scope.currentCube) {
          if ($scope.currentCube.length < $scope.colNum) {
            $scope.colNum = $scope.currentCube.length - 1;
          }
        }
        $scope.rowNum = Math.ceil($scope.currentCube.length / $scope.colNum);
        var rowPercent = 100 / $scope.rowNum;
        var px = $scope.rowNum + 1;
        rowPercent = 'calc(' + rowPercent.toString() + '%' + ' - ' + px.toString() + 'px)';
        $scope.rowHeight = {
          "height": rowPercent
        };
        resolve();
      });
    });
  }

  $scope.$watch("layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0]", async function (newValue, oldValue) {
    if (!$scope.layout.prop.vizId) {
      $scope.showMasterVizSelect = true;
      $scope.masterVizs = await getMasterItems();
    }
    if (newValue !== oldValue && $scope.layout.qHyperCube.qDimensionInfo[0]) {
      try {
        // Create hypercube
        getCube($scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0]).then(function (cube) {
          $scope.currentCube = cube;
          createTrellisObjects();
        });
        $scope.rowNum = Math.ceil($scope.currentCube.length / $scope.colNum);
        var rowPercent = 100 / $scope.rowNum;
        var px = $scope.rowNum + 1;
        rowPercent = 'calc(' + rowPercent.toString() + '%' + ' - ' + px.toString() + 'px)';
        $scope.rowHeight = {
          "height": rowPercent
        };
      }
      catch (err) {
        // Destroy existing session objects        
        if ($scope.sessionIds.length) {
          for (var i = 0; i < $scope.sessionIds.length; i++) {
            enigma.app.destroySessionObject($scope.sessionIds[i]);
          }
          $scope.showCharts = false;
        }
      }
    }
  });

  $scope.$watch("layout.prop.vizId", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      createTrellisObjects();
    }
  });

  $scope.$watch("layout.prop.advanced", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      createTrellisObjects();
    }
  });
  $scope.$watch("layout.prop.maxCharts", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      setupStyles().then(async function () {
        createTrellisObjects();
      });
    }
  });

  $scope.$watch("layout.qHyperCube.qDataPages[0].qMatrix[0][0].qText", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      try {
        // Create hypercube
        getCube($scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0]).then(function (cube) {
          $scope.currentCube = cube;
          createTrellisObjects();
        });
      }
      catch (err) {
        // Destroy existing session objects
        if ($scope.sessionIds.length) {
          for (var i = 0; i < $scope.sessionIds.length; i++) {
            enigma.app.destroySessionObject($scope.sessionIds[i]);
          }
          $scope.showCharts = false;
        }
      }
    }
  });

  $scope.$watch("layout.prop.showAllDims", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      createTrellisObjects();
    }
  });

  $scope.$watch("layout.prop.label", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      createTrellisObjects();
    }
  });

  $scope.$watch("layout.prop.labelMes", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      createTrellisObjects();
    }
  });

  $scope.$watch("layout.prop.autoRange", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      createTrellisObjects();
    }
  });

  $scope.onMasterVizSelected = function (masterViz) {
    enigma.app.getObject($scope.layoutId).then(function (obj) {
      var params = {
        "qPatches": [
          {
            "qOp": 0,
            "qPath": "/prop/vizId",
            "qValue": `"${masterViz}"`
          }
        ],
        "qSoftPatch": false
      };
      obj.applyPatches(params).then(function () {
        $scope.showMasterVizSelect = false;
      });
    });
  };

  $scope.prevSlide = function () {
    $scope.$watch(function () {
      $scope.slideIndex = $scope.slideIndex - 1;
      var dots = $element.find(".qlik-trellis-dot");
      for (var i = 0; i < dots.length; i++) {
        if ($scope.slideIndex == i) {
          $(dots[i]).addClass("qlik-trellis-active");
        }
        else {
          $(dots[i]).removeClass("qlik-trellis-active");
        }
      }
    });
    qlik.resize();
  };

  $scope.nextSlide = function () {
    $scope.$watch(function () {
      $scope.slideIndex = $scope.slideIndex + 1;
      var dots = $element.find(".qlik-trellis-dot");
      for (var i = 0; i < dots.length; i++) {
        if ($scope.slideIndex == i) {
          $(dots[i]).addClass("qlik-trellis-active");
        }
        else {
          $(dots[i]).removeClass("qlik-trellis-active");
        }
      }
    });
    qlik.resize();
  };

  function getCube(dimDef) {
    return new Promise(function (resolve, reject) {
      try {
        enigma.app.getObject($scope.layoutId).then(function (object) {
          object.getFullPropertyTree().then(function (properties) {
            var extProps = JSON.parse(JSON.stringify(properties));
            var qSortCriterias = extProps.qProperty.qHyperCubeDef.qDimensions[0].qDef.qSortCriterias;
            var qNullSuppression = extProps.qProperty.qHyperCubeDef.qDimensions[0].qNullSuppression;
            var dimDefMes = dimDef.replace('=', '');
            app.createCube({
              "qDimensions": [{
                "qDef": {
                  "qFieldDefs": [dimDef],
                  "qSortCriterias": qSortCriterias
                },
                "qNullSuppression": qNullSuppression
              }],
              "qMeasures": [{
                "qDef": {
                  "qDef": `Count({1}${dimDefMes})`,
                  "qLabel": "dim"
                }
              }],
              "qSortCriterias": qSortCriterias,
              "qInitialDataFetch": [{
                qHeight: 50,
                qWidth: 2
              }]
            }, function (reply) {
              var cube = [];
              var i;
              for (i = 0; i < reply.qHyperCube.qDataPages[0].qMatrix.length; i++) {
                if (reply.qHyperCube.qDataPages[0].qMatrix[i][0].qText != "-") {
                  cube.push(reply.qHyperCube.qDataPages[0].qMatrix[i]);
                }
              }
              if (cube.length > parseInt($scope.layout.prop.maxCharts)) {
                $scope.$watch(function () {
                  $scope.showError = true;
                  $scope.errorMsg = "Too many dimension values!";
                  $scope.showCharts = false;
                });
                if ($scope.sessionIds.length > 0 && enigma && enigma.app) {
                  for (i = 0; i < $scope.sessionIds.length; i++) {
                    enigma.app.destroySessionObject($scope.sessionIds[i]);
                  }
                }
                throw Error("Too many dimension values!");
              }
              else {
                resolve(cube);
              }
              resolve(cube);
              enigma.app.destroySessionObject(reply.qInfo.qId);
            });
          });
        });
      }
      catch (err) {
        reject(err);
      }
    });
  }

  async function createTrellisObjects() {
    // Get viz object
    if ($scope.currentCube) {
      if ($scope.currentCube.length < $scope.colNum) {
        $scope.colNum = $scope.currentCube.length - 1;
      }
      // Destroy existing session objects
      for (var i = 0; i < $scope.sessionIds.length; i++) {
        await enigma.app.destroySessionObject($scope.sessionIds[i]);
      }
      return enigma.app.getObject($scope.layout.prop.vizId).then(function (vizObject) {
        $scope.vizObject = vizObject;
        $scope.vizObject.getProperties().then(async function (vizProp) {
          // Modify properties of master item viz
          $scope.vizProp = JSON.parse(JSON.stringify(vizProp));
          $scope.vizProp.qInfo.qId = "";
          $scope.vizProp.qInfo.qType = $scope.vizProp.visualization;
          $scope.qtcProps = $scope.vizProp.qInfo.qType in chartTypes
            ? chartTypes[$scope.vizProp.qInfo.qType] : chartTypes['default'];
          $scope.sessionIds = [];
          var objects = "";
          let propPromises = [];
          for (var q = 0; q < $scope.currentCube.length; q++) {
            var dimName = $scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];
            var dimValue = $scope.currentCube[q][0].qText;
            if ($scope.qtcProps) {
              var promise = getAndSetMeasures($scope.vizProp, dimName, dimValue, $scope.qtcProps);
              propPromises.push(promise);
            }
          }

          return Promise.all(propPromises).then(function (props) {
            let chartPromises = [];
            for (var q = 0; q < $scope.currentCube.length; q++) {
              var dimName = $scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];
              var dimValue = $scope.currentCube[q][0].qText;
              var promise = createChart(props[q], dimName, dimValue, q);
              chartPromises.push(promise);
            }

            return Promise.all(chartPromises).then(function (viz) {
              if ($scope.qtcProps.autoRange) {
                $scope.maxValues = [];
                for (var v = 0; v < viz.length; v++) {
                  $scope.sessionIds.push(viz[v].id);

                  for (var m = 0; m < viz[v].model.layout.qHyperCube.qMeasureInfo.length; m++) {
                    $scope.maxValues.push(viz[v].model.layout.qHyperCube.qMeasureInfo[m].qMax);
                  }
                  $scope.max = 0;
                  for (var t = 0; t < $scope.maxValues.length; t++) {
                    if ($scope.maxValues[t] > $scope.max) {
                      $scope.max = $scope.maxValues[t];
                    }
                  }
                }

                let objectPromises = [];
                for (var x = 0; x < $scope.sessionIds.length; x++) {
                  var promise = enigma.app.getObject($scope.sessionIds[x]);
                  objectPromises.push(promise);
                }

                return Promise.all(objectPromises).then(function (obj) {
                  objects = obj;
                  let propPromises = [];
                  for (var ob = 0; ob < objects.length; ob++) {
                    var promise = objects[ob].getProperties();
                    propPromises.push(promise);
                  }

                  return Promise.all(propPromises).then(function (propPromise) {
                    let setPropPromises = [];
                    for (var p = 0; p < propPromise.length; p++) {
                      var props = JSON.parse(JSON.stringify(propPromise[p]));
                      if ($scope.layout.prop.autoRange && props.measureAxis) {
                        props.measureAxis.autoMinMax = false;
                        props.measureAxis.minMax = "max";
                        props.measureAxis.max = Math.round($scope.max * 1.1);
                        var promise = objects[p].setProperties(props);
                        setPropPromises.push(promise);
                      }
                    }

                    return Promise.all(setPropPromises).then(function () {
                      var dots = $element.find(".qlik-trellis-dot");
                      $(dots[0]).addClass("qlik-trellis-active");
                      $scope.$watch(function () {
                        $scope.showCharts = true;
                        $scope.showError = false;
                        $scope.slideIndex = 0;
                      });
                      qlik.resize();
                      return showCharts(viz);
                    });
                  });
                });
              }
              else {
                var dots = $element.find(".qlik-trellis-dot");
                $(dots[0]).addClass("qlik-trellis-active");
                $scope.$watch(function () {
                  $scope.showCharts = true;
                  $scope.showError = false;
                  $scope.slideIndex = 0;
                });
                qlik.resize();
                return showCharts(viz);
              }
            });
          });
        });
      });
    }
  }

  function createMeasure(m, dimName, dimValue, showAll, type) {
    return new Promise(function (resolve, reject) {
      if (type == 'measureBased') {
        var aggr = ["Sum(", "Avg(", "Count(", "Min(", "Max("];
        var currentMes = '';
        var formula = m;
        // Loop through all possible aggregation types
        for (var i = 0; i < aggr.length; i++) {
          var form = '';
          if (i == 0) {
            form = formula;
          } else {
            form = currentMes;
          }
          var mes = '';
          var split = form.split(aggr[i]);
          // Check to see if form contains aggr
          if (split.length != 1) {
            // loop through split
            for (var s = 0; s < split.length; s++) {
              // check for set analysis in next
              var next = s + 1;
              // ensure not last item
              if (split[next]) {
                // check if includes < and inject partial set
                if (split[next].includes('{<')) {
                  mes += split[s] + aggr[i] + "$(vDimSet)";
                }
                // else inject full set
                else {
                  mes += split[s] + aggr[i] + "$(vDimSetFull)";
                }
              }
              // Last item
              else {
                mes += split[s];
              }
            }
            currentMes = mes;
          } else {
            currentMes = form;
          }
        }
        if ($scope.layout.prop.showAllDims && showAll) {
          currentMes += " + 0*Sum({1}1)";
        }
        currentMes = currentMes.replaceAll('$(vDimSetFull)', "{<" + `[${dimName}]={'${dimValue}'}` + ">}");
        currentMes = currentMes.replaceAll('$(vDimSet)', `,[${dimName}]={'${dimValue}'}`);
        currentMes = currentMes.replaceAll('$(vDim)', `'${dimValue}'`);
        resolve(currentMes);
      }
      else {
        var d = m.replace(/=/g, "");
        var dimension = `=If([${dimName}] = '${dimValue}', ${d})`;
        resolve(dimension);
      }
    });
  }

  function getMasterMeasure(masterItemIdPath) {
    return new Promise(function (resolve, reject) {
      try {
        enigma.app.getMeasure(masterItemIdPath).then(function (mesObject) {
          mesObject.getMeasure().then(function (mes) {
            resolve(mes.qDef);
          });
        });
      }
      catch (err) {
        reject(err);
      }
    });
  }

  async function getAndSetMeasures(vizProp, dimName, dimValue, qtcProps) {
    return new Promise(async function (resolve, reject) {
      var props = JSON.parse(JSON.stringify(vizProp)); // Copies the property-object
      var paths = qtcProps.paths;
      var showAll = qtcProps.showAll;
      try {
        // Loop through paths
        for (let p = 0; p < paths.length; p++) {
          let path = paths[p];
          if (path.path1(props)) {
            // Loop through first path
            for (let i = 0; i < path.path1(props).length; i++) {
              // check for multiple loops
              if (path.loopsCount == 1) {
                // Make general check
                if (!path.generalCheck(props, i)) {
                  // Nothing to do here
                  continue;
                }

                // is lib item 
                if (path.libCheck(props, i)) {
                  // get lib item
                  let measure = await getMasterMeasure(path.libDef.get(props, i));
                  // get modified measure
                  let modMeasure = await createMeasure(
                    measure, dimName, dimValue, showAll, $scope.qtcProps.type);
                  // set modified measure
                  path.libDefMes(props, i);
                  path.def.set(props, i, modMeasure);
                }
                // is not lib item
                else {
                  // get measure
                  let measure = path.def.get(props, i);
                  // get modified measure
                  let modMeasure = await createMeasure(
                    measure, dimName, dimValue, showAll, $scope.qtcProps.type);
                  // set modified measure
                  path.libDefMes(props, i);
                  path.def.set(props, i, modMeasure);
                }
              }
              // Multiple loops
              else {
                // Check if path 2 exists
                if (path.path2(props, i)) {
                  // Loop through number of loops
                  for (let j = 0; j < path.path2(props, i).length; j++) {
                    // Make general check
                    if (!path.generalCheck(props, i)) {
                      // Nothing to do here
                      continue;
                    }

                    // Check if lib item
                    if (path.libCheck(props, i, j)) {
                      // get lib item
                      let measure = await getMasterMeasure(path.libDef.get(props, i, j));
                      // get modified measure
                      let modMeasure = await createMeasure(
                        measure, dimName, dimValue, showAll, $scope.qtcProps.type);
                      // set modified measure
                      path.libDef.set(props, i, j, path.libDefMes(props, i, j));
                      path.def.set(props, i, j, modMeasure);
                    }
                    // Normal measure
                    else {
                      // get measure
                      let measure = path.def.get(props, i, j);
                      // get modified measure
                      let modMeasure = await createMeasure(
                        measure, dimName, dimValue, showAll, $scope.qtcProps.type);
                      // set modified measure
                      path.libDef.set(props, i, j, path.libDefMes(props, i, j));
                      path.def.set(props, i, j, modMeasure);
                    }
                  }
                }
              }
            }
          }
        }
        resolve(props);
      }
      catch (err) {
        resolve(props);
      }
    });
  }

  function getMasterItems() {
    return new Promise(function (resolve, reject) {
      app.getList('masterobject').then(function (model) {
        // Close the model to prevent any updates.
        app.destroySessionObject(model.layout.qInfo.qId);
        // This is a bit iffy, might be smarter to reject and handle empty lists on the props instead.
        if (!model.layout.qAppObjectList.qItems) {
          return resolve({ value: '', label: 'No MasterObjects' });
        }
        // Resolve an array with master objects.
        resolve(model.layout.qAppObjectList.qItems);
      });
    });
  }

  function createChart(vizProp, dimName, dimValue, i) {
    return new Promise(function (resolve, reject) {
      try {
        var propsString = JSON.stringify(vizProp);
        if (!$scope.layout.prop.advanced) {
          var props = JSON.parse(propsString);
          props.showTitles = true;
          props.title = dimValue;
        }
        else {
          propsString = propsString.replaceAll('$(vDimSetFull)', "{<" + `[${dimName}]={'${dimValue}'}` + ">}");
          propsString = propsString.replaceAll('$(vDimSet)', `,[${dimName}]={'${dimValue}'}`);
          propsString = propsString.replaceAll('$(vDim)', `'${dimName}'`);
          propsString = propsString.replaceAll('$(vDimValue)', `'${dimValue}'`);
          props = JSON.parse(propsString);
        }
        // Auto Range
        if (props.measureAxis) {
          if ($scope.layout.prop.autoRange) {
            props.measureAxis.measureMax = $scope.maxAxis;
            props.measureAxis.autoMinMax = false;
          }
        }
        // Dim Axis
        if (props.dimensionAxis) {
          if ($scope.layout.prop.label == 'left') {
            let leftCharts = [];
            let chartInt = 0;
            for (let v = 0; v < $scope.rowNum; v++) {
              if (v == 0) {
                leftCharts.push(chartInt);
              }
              else {
                chartInt = parseInt(chartInt) + parseInt($scope.colNum);
                leftCharts.push(chartInt);
              }
            }
            let label = false;
            for (let c = 0; c < leftCharts.length; c++) {
              if (i == leftCharts[c]) {
                label = true;
              }
            }
            if (!label) {
              props.dimensionAxis.show = 'none';
            }
          }
          if ($scope.layout.prop.label == 'right') {
            let rightCharts = [];
            let chartInt = $scope.colNum - 1;
            for (let v = 0; v < $scope.rowNum; v++) {
              if (v == 0) {
                rightCharts.push(chartInt);
              }
              else {
                chartInt = parseInt(chartInt) + parseInt($scope.colNum);
                rightCharts.push(chartInt);
              }
            }
            let label = false;
            for (let c = 0; c < rightCharts.length; c++) {
              if (i == rightCharts[c]) {
                label = true;
              }
            }
            if (!label) {
              props.dimensionAxis.show = 'none';
            }
          }
          if ($scope.layout.prop.label == 'top') {
            if (i >= $scope.colNum) {
              props.dimensionAxis.show = 'none';
            }
          }
          if ($scope.layout.prop.label == 'bottom') {
            if (i < $scope.colNum * $scope.rowNum - $scope.colNum) {
              props.dimensionAxis.show = 'none';
            }
          }
        }
        // Mes Axis
        if (props.measureAxis) {
          if ($scope.layout.prop.labelMes == 'left') {
            let leftCharts = [];
            let chartInt = 0;
            for (let v = 0; v < $scope.rowNum; v++) {
              if (v == 0) {
                leftCharts.push(chartInt);
              }
              else {
                chartInt = parseInt(chartInt) + parseInt($scope.colNum);
                leftCharts.push(chartInt);
              }
            }
            let label = false;
            for (let c = 0; c < leftCharts.length; c++) {
              if (i == leftCharts[c]) {
                label = true;
              }
            }
            if (!label) {
              props.measureAxis.show = 'none';
            }
          }
          if ($scope.layout.prop.labelMes == 'right') {
            let rightCharts = [];
            let chartInt = $scope.colNum - 1;
            for (let v = 0; v < $scope.rowNum; v++) {
              if (v == 0) {
                rightCharts.push(chartInt);
              }
              else {
                chartInt = parseInt(chartInt) + parseInt($scope.colNum);
                rightCharts.push(chartInt);
              }
            }
            let label = false;
            for (let c = 0; c < rightCharts.length; c++) {
              if (i == rightCharts[c]) {
                label = true;
              }
            }
            if (!label) {
              props.measureAxis.show = 'none';
            }
          }
          if ($scope.layout.prop.labelMes == 'top') {
            if (i >= $scope.colNum) {
              props.measureAxis.show = 'none';
            }
          }
          if ($scope.layout.prop.labelMes == 'bottom') {
            if (i < $scope.colNum * $scope.rowNum - $scope.colNum) {
              props.measureAxis.show = 'none';
            }
          }
        }
        // Alternate State
        if (!props.qStateName) {
          // No qStateName on master object, so make it inherit qStateName of the trellis
          props.qStateName = $scope.layout.qStateName || '';
        }

        app.visualization.create(props.visualization, null, props).then(function (vis) {
          resolve(vis);
        });
      }
      catch (err) {
        reject(err);
      }
    });
  }

  function showCharts(viz) {
    var qwikCells = $scope.layout.prop.slideMode || $scope.mobileMode
      ? $element.find('.qlik-trellis-slide') : $element.find('.qlik-trellis-cell');
    var tasks = [];
    for (let i = 0; i < viz.length; i++) {
      tasks.push(viz[i].show(qwikCells[i]));
    }
    return Promise.all(tasks);
  }

  String.prototype.replaceAll = function (searchStr, replaceStr) {
    var str = this;
    // no match exists in string?
    if (str.indexOf(searchStr) === -1) {
      // return string
      return str;
    }
    // replace and remove first match, and do another recursirve search/replace
    return (str.replace(searchStr, replaceStr)).replaceAll(searchStr, replaceStr);
  };
}];
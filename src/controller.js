var qlik = window.require('qlik');
import chartTypes from './chartTypes.js';
import helper from './helper.js';
import $ from 'jquery';
import popoverTemplate from './popover.ng.html';

export default ['$scope', '$element', function ($scope, $element) {
  $scope.layoutId = $scope.layout.qInfo.qId;
  var enigma = $scope.component.model.enigmaModel;
  var app = qlik.currApp($scope);
  $scope.sessionIds = [];
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

  $scope.$watch("layout.qHyperCube.qDimensionInfo", function (newValue, oldValue) {
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

  $scope.$watch("layout.prop.maxCharts", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      setupStyles().then(async function () {
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

  $scope.$watchCollection("[sortCriterias1, sortCriterias2, nullSuppression1, nullSuppression2]", function (newValue, oldValue) {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
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

      $scope.setBorderProps();

      // Create hypercube
      let secondFieldDef;
      if ($scope.layout.qHyperCube.qDimensionInfo[1]) {
        secondFieldDef = $scope.layout.qHyperCube.qDimensionInfo[1].qGroupFieldDefs[0];
      }
      getCube($scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0], secondFieldDef).then(function (cube) {
        $scope.currentCube = cube;
        $scope.currentCubeLength = $scope.layout.qHyperCube.qDimensionInfo[1] ? $scope.currentCube[0].cube1.length * $scope.currentCube[0].cube2.length : $scope.currentCube.length;
        if (typeof secondFieldDef == 'undefined') {
          $scope.colNum = parseInt($scope.layout.prop.columns);
          if ($scope.currentCube) {
            if ($scope.currentCubeLength < $scope.colNum) {
              $scope.colNum = $scope.currentCubeLength;
            }
          }
          $scope.rowNum = Math.ceil($scope.currentCubeLength / $scope.colNum);
        }
        else {
          let rowArray = cube[0].cube1.map(item => item[0].qText);
          let colArray = cube[0].cube2.map(item => item[0].qText);

          // Check if browser is Internet explorer
          const isIE = /*@cc_on!@*/false || !!document.documentMode;
          if (isIE) {
            try {
              // Remove duplicates from rowArray
              let rowArrayLen = rowArray.length;
              while (rowArrayLen > 0) {
                for (let i = 0; i < rowArrayLen; i++) {
                  if (rowArray[rowArrayLen] === rowArray[i]) {
                    rowArray.splice(i, 1);
                  }
                }
                rowArrayLen--;
              }

              // Remove duplicates from colArray
              let colArrayLen = colArray.length;
              while (colArrayLen > 0) {
                for (let i = 0; i < colArrayLen; i++) {
                  if (colArray[colArrayLen] === colArray[i]) {
                    colArray.splice(i, 1);
                  }
                }
                colArrayLen--;
              }

              $scope.rowValues = rowArray;
              $scope.colValues = colArray;
            } catch (e) {
              console.error(e);
            }
          } else {
            $scope.rowValues = [...new Set(rowArray.map(item => item))];
            $scope.colValues = [...new Set(colArray.map(item => item))];
          }
          $scope.colNum = $scope.colValues.length;
          $scope.rowNum = $scope.rowValues.length;
        }
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
      helper.getMasterItems().then(function (items) {
        $scope.masterVizs = items;
        $scope.showMasterVizSelect = true;
      });
    }
    if (newValue !== oldValue && $scope.layout.qHyperCube.qDimensionInfo[0]) {
      try {
        setupStyles().then(function () {
          createTrellisObjects();
        });
      }
      catch (err) {
        // Destroy existing session objects
        destroyTrellisObjects();
      }
    }
  });

  $scope.$watch("layout.qHyperCube.qDimensionInfo[1].qGroupFieldDefs[0]", async function (newValue, oldValue) {
    if (newValue !== oldValue && $scope.layout.qHyperCube.qDimensionInfo[0]) {
      try {
        setupStyles().then(function () {
          createTrellisObjects();
        });
      }
      catch (err) {
        // Destroy existing session objects
        destroyTrellisObjects();
      }
    }
  });



  $scope.$watch("layout.prop.vizId", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        $scope.showMasterVizSelect = false;
        createTrellisObjects();
      } else {
        $scope.showMasterVizSelect = true;
        destroyTrellisObjects();
      }
    }
  });

  $scope.$watch("layout.prop.advanced", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      createTrellisObjects();
    }
  });

  $scope.$watchCollection('[layout.prop.customTitle, layout.prop.customTitleColDef, layout.prop.customTitleRowDef, layout.prop.customValuesRowDef]', function () {
    try {
      $scope.customTitleColDef = JSON.parse($scope.layout.prop.customTitleColDef);
      $scope.customValuesColDef = JSON.parse($scope.layout.prop.customValuesColDef);
      $scope.customTitleRowDef = JSON.parse($scope.layout.prop.customTitleRowDef);
      $scope.customValuesRowDef = JSON.parse($scope.layout.prop.customValuesRowDef);
    }
    catch (err) {
      /* eslint-disable no-console */
      console.error("It looks like your custom title properties are not formatted correctly!");
    }
  });

  $scope.showAddMasterItemsDialog = function (event) {
    var items = $scope.masterVizs;
    $scope.masterItemPopover = window.qvangularGlobal.getService("luiPopover").show({
      template: popoverTemplate,
      alignTo: event.target,
      closeOnEscape: true,
      closeOnOutside: true,
      input: {
        items: items,
        onClick: function (item) {
          try {
            if (item.value) {
              $scope.onMasterVizSelected(item.value);
            }
          }
          finally {
            $scope.masterItemPopover.close();
          }
        }
      }
    });
    $scope.masterItemPopover.closed.then(function () {
      $(window).off('resize.popover', $scope.onMasterItemPopoverResize);
    });
    $(window).on('resize.popover', $scope.onMasterItemPopoverResize);
  };

  $scope.onMasterItemPopoverResize = function () {
    if ($scope.masterItemPopover) {
      $scope.masterItemPopover.close();
    }
  };


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

  $scope.$watch("layout.prop.border", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue == true) {
        $scope.setBorderProps();
      }
      else {
        $scope.borderProps = {};
      }
    }
  });

  $scope.$watch("layout.prop.borderWidth", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.setBorderProps();
    }
  });

  $scope.$watch("layout.prop.borderColor.color", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.setBorderProps();
    }
  });

  $scope.$watch("layout.prop.borderStyle", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.setBorderProps();
    }
  });

  $scope.$watch("layout.prop.customBorderSwitch", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.setBorderProps();
    }
  });

  $scope.$watch("layout.prop.customBorder", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.setBorderProps();
    }
  });


  $scope.setBorderProps = function () {
    if ($scope.layout.prop.customBorderSwitch) {
      try {
        $scope.borderProps = JSON.parse($scope.layout.prop.customBorder);
      }
      catch (err) {
        /* eslint-disable no-console */
        console.error("It looks like your custom border properties are not formatted correctly!");
      }
    }
    else {
      if ($scope.layout.prop.border) {
        $scope.borderProps = {
          "border": `${$scope.layout.prop.borderWidth}px`,
          "border-color": $scope.layout.prop.borderColor ? $scope.layout.prop.borderColor.color : $scope.layout.prop.borderColor,
          "border-style": $scope.layout.prop.borderStyle
        };
      }
    }
  };

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
    qlik.resize();
  };

  $scope.nextSlide = function () {
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
    qlik.resize();
  };

  function getCube(dimDef, dimDef2) {
    return new Promise(async function (resolve, reject) {
      let cube = [];
      if (!$scope.layout.qHyperCube.qDimensionInfo[1]) {
        let params = {
          "qDimensions": [{
            "qDef": {
              "qFieldDefs": [dimDef],
              "qSortCriterias": $scope.sortCriterias1
            },
            "qNullSuppression": $scope.nullSuppression1
          }],
          "qMeasures": [{
            "qDef": {
              "qDef": `Sum({1}1)`
            }
          }],
          "qSortCriterias": $scope.sortCriterias,
          "qInitialDataFetch": [{
            qHeight: 500,
            qWidth: 2
          }]
        };
        let reply = await app.createCube(params);
        console.log(reply);
        for (var i = 0; i < reply.layout.qHyperCube.qDataPages[0].qMatrix.length; i++) {
          cube.push(reply.layout.qHyperCube.qDataPages[0].qMatrix[i]);
        }
        if (cube.length > parseInt($scope.layout.prop.maxCharts)) {
          $scope.showError = true;
          $scope.errorMsg = "Too many dimension values! You can change the maximum amount of dimension values setting in Appearance -> Trellis Options -> Maximum number of charts";
          destroyTrellisObjects();
          throw Error($scope.errorMsg);
        } else {
          $scope.showError = false;
          $scope.errorMsg = "";
          $scope.showCharts = true;
        }
        resolve(cube);
      }
      else {
        let cube1 = [];
        let params1 = {
          "qDimensions": [{
            "qDef": {
              "qFieldDefs": [dimDef],
              "qSortCriterias": $scope.sortCriterias1
            },
            "qNullSuppression": $scope.nullSuppression1
          }],
          "qMeasures": [{
            "qDef": {
              "qDef": `Sum({1}1)`
            }
          }],
          "qSortCriterias": $scope.sortCriterias,
          "qInitialDataFetch": [{
            qHeight: 500,
            qWidth: 2
          }]
        };
        let reply1 = await app.createCube(params1);
        for (var r = 0; r < reply1.layout.qHyperCube.qDataPages[0].qMatrix.length; r++) {
          cube1.push(reply1.layout.qHyperCube.qDataPages[0].qMatrix[r]);
        }
        enigma.app.destroySessionObject(reply1.id);

        let cube2 = [];
        let params2 = {
          "qDimensions": [{
            "qDef": {
              "qFieldDefs": [dimDef2],
              "qSortCriterias": $scope.sortCriterias2
            },
            "qNullSuppression": $scope.nullSuppression2
          }],
          "qMeasures": [{
            "qDef": {
              "qDef": `Sum({1}1)`
            }
          }],
          "qSortCriterias": $scope.sortCriterias,
          "qInitialDataFetch": [{
            qHeight: 500,
            qWidth: 2
          }]
        };
        let reply2 = await app.createCube(params2);
        for (var s = 0; s < reply2.layout.qHyperCube.qDataPages[0].qMatrix.length; s++) {
          cube2.push(reply2.layout.qHyperCube.qDataPages[0].qMatrix[s]);
        }
        enigma.app.destroySessionObject(reply2.id);
        if ((cube1.length * cube2.length) > parseInt($scope.layout.prop.maxCharts)) {
          $scope.showError = true;
          $scope.errorMsg = "Too many dimension values!";
          destroyTrellisObjects();
          throw Error("Too many dimension values!");
        } else {
          $scope.showError = false;
          $scope.errorMsg = "";
          $scope.showCharts = true;
        }
        cube.push({ 'cube1': cube1, 'cube2': cube2 });
        resolve(cube);
      }
    });
  }

  function destroyTrellisObjects() {
    if ($scope.sessionIds.length) {
      for (var i = 0; i < $scope.sessionIds.length; i++) {
        enigma.app.destroySessionObject($scope.sessionIds[i]);
      }
      $scope.showCharts = false;
    }
  }

  async function createTrellisObjects() {
    // Get viz object
    if ($scope.currentCube && $scope.layout && $scope.layout.prop && $scope.layout.prop.vizId) {
      if ($scope.currentCubeLength < $scope.colNum) {
        $scope.colNum = $scope.currentCubeLength;
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
          if (!$scope.layout.qHyperCube.qDimensionInfo[1]) {
            for (var q = 0; q < $scope.currentCubeLength; q++) {
              let dimName;
              if ($scope.layout.qHyperCube.qDimensionInfo[0].calculatedDim) {
                dimName = $scope.layout.qHyperCube.qDimensionInfo[0].baseDim;
              }
              else {
                dimName = $scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];
              }
              let dimValue = $scope.currentCube[q][0].qText;
              let dimName2;
              let dimValue2;

              if ($scope.qtcProps && !$scope.layout.prop.advanced) {
                var promise = getAndSetMeasures($scope.vizProp, dimName, dimValue, dimName2, dimValue2, $scope.qtcProps);
                propPromises.push(promise);
              }
              else {
                propPromises.push($scope.vizProp);
              }
            }
          }
          else {
            for (var r = 0; r < $scope.currentCube[0].cube1.length; r++) {
              for (var c = 0; c < $scope.currentCube[0].cube2.length; c++) {
                let dimName;
                if ($scope.layout.qHyperCube.qDimensionInfo[0].calculatedDim) {
                  dimName = $scope.layout.qHyperCube.qDimensionInfo[0].baseDim;
                }
                else {
                  dimName = $scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];
                }
                let dimValue = $scope.currentCube[0].cube1[r][0].qText;

                let dimName2;
                if ($scope.layout.qHyperCube.qDimensionInfo[1].calculatedDim) {
                  dimName2 = $scope.layout.qHyperCube.qDimensionInfo[1].baseDim;
                }
                else {
                  dimName2 = $scope.layout.qHyperCube.qDimensionInfo[1].qGroupFieldDefs[0];
                }
                let dimValue2 = $scope.currentCube[0].cube2[c][0].qText;
                if ($scope.qtcProps && !$scope.layout.prop.advanced) {
                  var promise2 = getAndSetMeasures($scope.vizProp, dimName, dimValue, dimName2, dimValue2, $scope.qtcProps);
                  propPromises.push(promise2);
                }
                else {
                  propPromises.push($scope.vizProp);
                }
              }
            }
          }

          return Promise.all(propPromises).then(function (props) {
            let chartPromises = [];
            let twoDimensions = $scope.layout.qHyperCube.qDimensionInfo[1] ? true : false;
            if (!twoDimensions) {
              for (var q = 0; q < $scope.currentCubeLength; q++) {
                let dimName;
                if ($scope.layout.qHyperCube.qDimensionInfo[0].calculatedDim) {
                  dimName = $scope.layout.qHyperCube.qDimensionInfo[0].baseDim;
                }
                else {
                  dimName = $scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];
                }
                var dimValue = $scope.currentCube[q][0].qText;
                let dimName2;
                let dimValue2;
                var promise = createChart(props[q], dimName, dimValue, dimName2, dimValue2, q);
                chartPromises.push(promise);
              }
            }
            else {
              let chartNum = 0;
              for (var r = 0; r < $scope.currentCube[0].cube1.length; r++) {
                for (var c = 0; c < $scope.currentCube[0].cube2.length; c++) {
                  let dimName;
                  if ($scope.layout.qHyperCube.qDimensionInfo[0].calculatedDim) {
                    dimName = $scope.layout.qHyperCube.qDimensionInfo[0].baseDim;
                  }
                  else {
                    dimName = $scope.layout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];
                  }
                  let dimValue = $scope.currentCube[0].cube1[r][0].qText;

                  let dimName2;
                  if ($scope.layout.qHyperCube.qDimensionInfo[1].calculatedDim) {
                    dimName2 = $scope.layout.qHyperCube.qDimensionInfo[1].baseDim;
                  }
                  else {
                    dimName2 = $scope.layout.qHyperCube.qDimensionInfo[1].qGroupFieldDefs[0];
                  }
                  let dimValue2 = $scope.currentCube[0].cube2[c][0].qText;
                  var promise2 = createChart(props[chartNum], dimName, dimValue, dimName2, dimValue2, chartNum);
                  chartPromises.push(promise2);
                  chartNum += 1;
                }
              }
            }


            return Promise.all(chartPromises).then(function (viz) {
              for (var v = 0; v < viz.length; v++) {
                $scope.sessionIds.push(viz[v].id);
              }

              if ($scope.qtcProps.autoRange) {
                $scope.maxValues = [];
                for (var v = 0; v < viz.length; v++) {
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
                    return enigma.app.getUndoInfoObject().then(function (undoInfo) {
                      return undoInfo.startGroup().then(function (undoGroupId) {
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
                          $scope.showCharts = true;
                          $scope.showError = false;
                          $scope.slideIndex = 0;
                          qlik.resize();
                          return showCharts(viz).then(function () {
                            return undoInfo.endGroup(undoGroupId);
                          });
                        });
                      });
                    });
                  });
                });
              } else {
                var dots = $element.find(".qlik-trellis-dot");
                $(dots[0]).addClass("qlik-trellis-active");
                $scope.showCharts = true;
                $scope.showError = false;
                $scope.slideIndex = 0;
                qlik.resize();
                return showCharts(viz);
              }
            });

          });
        });
      });
    }
  }

  function createMeasure(m, dimName, dimValue, dimName2, dimValue2, showAll, type) {
    return new Promise(function (resolve, reject) {
      // List of in scope aggregations
      const aggr = ["Sum", "Avg", "Count", "Min", "Max"];

      // Replace string values with text
      m = m.replace(/\s+/g, 'REMOVE_SPACES');
      m = m.replace(/[\[]/g, 'START_BRACKET');
      m = m.replace(/[\]]/g, 'END_BRACKET');

      // Ensure whitespace for anything wrapped in single quotes is preserved
      let singleQuotes = m.match(/'(.*?)'/g);
      for (let c in singleQuotes) {
        let singleQuote = singleQuotes[c];
        let singleQuoteNew = singleQuote.replace(/REMOVE_SPACES/g, ' ');
        let regex = new RegExp(singleQuote, "g");
        m = m.replace(regex, singleQuoteNew);
      }
      // Ensure whitespace for anything wrapped in a square brackets is preserved
      let squareBrackets = m.match(/\START_BRACKET.*?END_BRACKET/g);
      for (let s in squareBrackets) {
        let squareBracket = squareBrackets[s];
        let squareBracketNew = squareBracket.replace(/REMOVE_SPACES/g, ' ');
        let regex = new RegExp(squareBracket, "g");
        m = m.replace(regex, squareBracketNew);
      }
      // Ensure whitespace for anything wrapped in quotes is preserved
      let quotes = m.match(/"(.*?)"/g);
      for (let q in quotes) {
        let quote = quotes[q];
        let quoteNew = quote.replace(/REMOVE_SPACES/g, ' ');
        let regex = new RegExp(quote, "g");
        m = m.replace(regex, quoteNew);
      }

      // Replace placeholder text values
      m = m.replace(/REMOVE_SPACES/g, '');
      m = m.replace(/START_BRACKET/g, '[');
      m = m.replace(/END_BRACKET/g, ']');

      // Convert all aggregations to have same case
      for (let a in aggr) {
        let regex = new RegExp(`${aggr[a]}\\(`, 'gi');
        m = m.replace(regex, `${aggr[a]}(`);
      }

      // Inject partial set analysis when set exists with {<
      let sets = m.match(/{<(.*?)>}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/{</, '{<$(vDimSetAuto)');
        m = m.replaceAll(sets[s], newSet);
      }
      // Inject partial set analysis when set exists with {$<
      sets = m.match(/{\$<(.*?)>}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/{\$</, '{$<$(vDimSetAuto)');
        m = m.replaceAll(sets[s], newSet);
      }

      // Inject partial set analysis when set exists with {1<
      sets = m.match(/{1<(.*?)>}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/{1</, '{1<$(vDimSetAuto)');
        m = m.replaceAll(sets[s], newSet);
      }

      // Inject partial set analysis when set exists with {0<
      sets = m.match(/{0<(.*?)>}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/{0</, '{0<$(vDimSetAuto)');
        m = m.replaceAll(sets[s], newSet);
      }

      // Inject partial set analysis when set exists with {$1<
      sets = m.match(/{\$1<(.*?)>}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/{\$1</, '{$1<$(vDimSetAuto)');
        m = m.replaceAll(sets[s], newSet);
      }

      // Inject partial set analysis when set exists with {$}
      sets = m.match(/{\$(.*?)}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/{\$}/, '{$<$(vDimSetPartialAuto)>}');
        m = m.replaceAll(sets[s], newSet);
      }

      // Inject partial set analysis when set exists with {1}
      sets = m.match(/\({1(.*?)}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/\{1\}/, '{1<$(vDimSetPartialAuto)>}');
        m = m.replaceAll(sets[s], newSet);
      }

      // Inject partial set analysis when set exists with {0}
      sets = m.match(/\({0(.*?)}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/\{0\}/, '{0<$(vDimSetPartialAuto)>}');
        m = m.replaceAll(sets[s], newSet);
      }

      // Inject partial set analysis when set exists with {$1}
      sets = m.match(/{\$1(.*?)}/g);
      for (let s in sets) {
        let newSet = sets[s].replace(/\{\$1\}/, '{$1<$(vDimSetPartialAuto)>}');
        m = m.replaceAll(sets[s], newSet);
      }


      /* for (let a in aggr) {
        let regex = new RegExp(`\${aggr}\\(\\w+\\)`.replace('${aggr}', aggr[a]), 'g');
        let noSets = m.match(new RegExp(regex));
        for (let n in noSets) {
          let newNoSet = noSets[n].replace(`${aggr[a]}(`, `${aggr[a]}($(vDimSetFullAuto)`);
          m = m.replaceAll(noSets[n], newNoSet);
        }
      } */

      // Inject full set analysis when no set exists
      for (let a in aggr) {
        let tmpM = '';
        let split = m.split(aggr[a] + '(');
        let setType;
        for (let i in split) {
          // Not last item
          if (i < split.length - 1) {
            let next = (parseInt(i) + parseInt(1));
            // Check to see if m contains set
            let setTypes = ["{<", "{$<", "{1<", "{0<", "{$1<", "{$}", "{1}", "{0}", "{$1}"];
            for (let s in setTypes) {
              if (split[next].substring(0, setTypes[s].length).includes(setTypes[s])) {
                setType = setTypes[s];
                break;
              }
            }
            // Does not include Set
            if (typeof setType == 'undefined') {
              tmpM += split[i] + aggr[a] + '($(vDimSetFullAuto)';
            }
            // Does include {<
            else {
              tmpM += split[i] + aggr[a] + '(';
            }
          }
          // Last item
          else {
            tmpM += split[i];
          }
        }
        m = tmpM;
      }

      // Add dummy formula to show all dimensions
      if ($scope.layout.prop.showAllDims && showAll) {
        m += " + 0*Sum({1}1)";
      }
      if (typeof dimName2 != 'undefined') {
        m = m.replaceAll('$(vDimSetFullAuto)', `{<[${dimName}]={'${dimValue}'}, [${dimName2}]={'${dimValue2}'}>}`);
        m = m.replaceAll('$(vDimSetPartialAuto)', `,[${dimName}]={'${dimValue}'}, [${dimName2}]={'${dimValue2}'}`);
        m = m.replaceAll('$(vDimSetAuto)', `'${dimValue}'`);
      }
      else {
        m = m.replaceAll('$(vDimSetFullAuto)', "{<" + `[${dimName}]={'${dimValue}'}` + ">}");
        m = m.replaceAll('$(vDimSetPartialAuto)', `[${dimName}]={'${dimValue}'}`);
        m = m.replaceAll('$(vDimSetAuto)', `[${dimName}]={'${dimValue}'},`);
      }
      resolve(m);
    });
  }

  function getMasterMeasure(masterItemIdPath) {
    return new Promise(function (resolve, reject) {
      try {
        enigma.app.getMeasure(masterItemIdPath).then(function (mesObject) {
          resolve(mesObject);
        });
      }
      catch (err) {
        reject(err);
      }
    });
  }

  async function getAndSetMeasures(vizProp, dimName, dimValue, dimName2, dimValue2, chartTypeProps) {
    const paths = chartTypeProps.paths;
    const showAll = chartTypeProps.showAll;
    return new Promise(async function (resolve, reject) {
      var props = JSON.parse(JSON.stringify(vizProp)); // Copies the property-object
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
                  let m = await getMasterMeasure(path.libDef.get(props, i));
                  let mes = await m.getMeasure();
                  let measure = mes.qDef;
                  // get modified measure
                  let modMeasure = await createMeasure(
                    measure, dimName, dimValue, dimName2, dimValue2, showAll, $scope.qtcProps.type);
                  // set modified measure
                  path.libDefMes(props, i);
                  path.def.set(props, i, modMeasure);
                  path.libPropTransfer(props, i, mes);
                }
                // is not lib item
                else {
                  // get measure
                  let measure = path.def.get(props, i);
                  // get modified measure
                  let modMeasure = await createMeasure(
                    measure, dimName, dimValue, dimName2, dimValue2, showAll, $scope.qtcProps.type);
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
                      let m = await getMasterMeasure(path.libDef.get(props, i));
                      let mes = await m.getMeasure();
                      let measure = mes.qDef;
                      // get modified measure
                      let modMeasure = await createMeasure(measure, dimName, dimValue, dimName2, dimValue2, showAll, $scope.qtcProps.type);
                      // set modified measure
                      path.libDef.set(props, i, j, path.libDefMes(props, i, j));
                      path.def.set(props, i, j, modMeasure);
                    }
                    // Normal measure
                    else {
                      // get measure
                      let measure = path.def.get(props, i, j);
                      // get modified measure
                      let modMeasure = await createMeasure(measure, dimName, dimValue, dimName2, dimValue2, showAll, $scope.qtcProps.type);
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

  function createChart(vizProp, dimName, dimValue, dimName2, dimValue2, i) {
    return new Promise(function (resolve, reject) {
      try {
        var propsString = JSON.stringify(vizProp);
        if ($scope.layout.prop.advanced) {
          if (typeof dimName2 != 'undefined') {
            propsString = propsString.replaceAll('$(vDimSetFull)', `{<[${dimName}]={'${dimValue}'}, [${dimName2}]={'${dimValue2}'}>}`);
            propsString = propsString.replaceAll('$(vDimSet)', `,[${dimName}]={'${dimValue}'}, [${dimName2}]={'${dimValue2}'}`);
            propsString = propsString.replaceAll('$(vDim)', `'${dimValue}'`);
          }
          else {
            propsString = propsString.replaceAll('$(vDimSetFull)', "{<" + `[${dimName}]={'${dimValue}'}` + ">}");
            propsString = propsString.replaceAll('$(vDimSet)', `,[${dimName}]={'${dimValue}'}`);
            propsString = propsString.replaceAll('$(vDim)', `'${dimName}'`);
            propsString = propsString.replaceAll('$(vDimValue)', `'${dimValue}'`);
          }
        }
        var props = JSON.parse(propsString);
        props.showTitles = true;
        if (typeof dimName2 == 'undefined') {
          if ($scope.mobileMode || $scope.layout.slideMode) {
            props.title = `${dimName}: ${dimValue}`;
          }
          else {
            props.title = dimValue;
          }
        }
        else {
          if ($scope.mobileMode || $scope.layout.prop.slideMode) {
            props.showTitles = true;
            props.title = `${dimName}: ${dimValue}, ${dimName2}: ${dimValue2}`;
          }
          else {
            props.showTitles = false;
          }
          try {
            $scope.customTitleColDef = JSON.parse($scope.layout.prop.customTitleColDef);
            $scope.customValuesColDef = JSON.parse($scope.layout.prop.customValuesColDef);
            $scope.customTitleRowDef = JSON.parse($scope.layout.prop.customTitleRowDef);
            $scope.customValuesRowDef = JSON.parse($scope.layout.prop.customValuesRowDef);
          }
          catch (err) {
            throw Error("It looks like your custom tite properties are not formatted correctly!");
          }
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
    var trellisCells = $scope.layout.prop.slideMode || $scope.mobileMode
      ? $element.find('.qlik-trellis-slide') : $element.find('.qlik-trellis-cell');
    var tasks = [];
    for (let i = 0; i < viz.length; i++) {
      let options;
      location.search
        .substr(1)
        .split('&')
        .forEach(val => {
          const hash = val.split('=');
          if (hash.length > 0) {
            if (hash[0] === 'opt') {
              let decodedVal = decodeURIComponent(hash[1]);
              decodedVal = decodedVal.toLowerCase();
              if (decodedVal.indexOf('nointeraction') > -1) {
                options = options || {};
                options.noInteraction = true;
              }

              if (decodedVal.indexOf('noselections') > -1) {
                options = options || {};
                options.noSelections = true;
              }
            }
          }
        });
      tasks.push(viz[i].show(trellisCells[i], options));
    }

    if (trellisCells.length > viz.length) {
      // Need to delete the content of the remaining cells
      for (let i = viz.length; i < trellisCells.length; i++) {
        // Just remove the element, the object has already been deleted before creating new
        $(trellisCells[i]).find(".qv-object-wrapper").remove();
      }
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

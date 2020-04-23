export default {
  map: {
    name: "map",
    type: "measureBased",
    autoRange: false,
    showAll: false,
    paths: [{
      loopsCount: 1,
      path1: (props) => { return props.gaLayers; },
      libCheck: (props, index) => {
        return props.gaLayers[index].size.expression.type == 'libraryItem';
      },
      def: {
        set: (props, index, newDef) => {
          props.gaLayers[index].size.expression.key = newDef;
        },
        get: (props, index) => {
          return props.gaLayers[index].size.expression.key;
        }
      },
      libDef: {
        set: (props, index, newLibDef) => {
          props.gaLayers[index].size.expression.key = newLibDef;
        },
        get: (props, index) => {
          return props.gaLayers[index].size.expression.key;
        }
      },
      libDefMes: (props, index) => {
        props.gaLayers[index].size.expression.type = 'expression';
      },
      generalCheck: (props, index) => {
        try {
          return !!props.gaLayers[index].size.expression;
        } catch (err) {
          return false;
        }
      }
    },
    {
      loopsCount: 1,
      path1: (props) => { return props.gaLayers; },
      libCheck: (props, index) => {
        return props.gaLayers[index].color.expression.type == 'libraryItem';
      },
      def: {
        set: (props, index, newDef) => {
          props.gaLayers[index].color.expression.key = newDef;
        },
        get: (props, index) => {
          return props.gaLayers[index].color.expression.key;
        }
      },
      libDef: {
        set: (props, index, newLibDef) => {
          props.gaLayers[index].color.expression.key = newLibDef;
        },
        get: (props, index) => {
          return props.gaLayers[index].color.expression.key;
        }
      },
      libDefMes: (props, index) => {
        props.gaLayers[index].color.expression.type = 'expression';
      },
      generalCheck: (props, index) => {
        try {
          return !!props.gaLayers[index].color.expression;
        } catch (err) {
          return false;
        }
      }
    },
    {
      loopsCount: 1,
      path1: (props) => { return props.gaLayers; },
      libCheck: (props, index) => {
        return props.gaLayers[index].color.byMeasureDef.type == 'libraryItem';
      },
      def: {
        set: (props, index, newDef) => {
          props.gaLayers[index].color.byMeasureDef.key = newDef;
        },
        get: (props, index) => {
          return props.gaLayers[index].color.byMeasureDef.key;
        }
      },
      libDef: {
        set: (props, index, newLibDef) => {
          props.gaLayers[index].color.byMeasureDef.key = newLibDef;
        },
        get: (props, index) => {
          return props.gaLayers[index].color.byMeasureDef.key;
        }
      },
      libDefMes: (props, index) => {
        props.gaLayers[index].color.byMeasureDef.type = 'expression';
      },
      generalCheck: (props, index) => {
        try {
          return !!props.gaLayers[index].color.byMeasureDef;
        } catch (err) {
          return false;
        }
      }
    },
    {
      loopsCount: 2,
      path1: (props) => { return props.gaLayers; },
      path2: (props, index) => { return props.gaLayers[index].qHyperCubeDef.qDimensions; },
      libCheck: (props, index1, index2) => {
        return props.gaLayers[index1].qHyperCubeDef.qDimensions[index2].qAttributeExpressions.qLibraryId.length > 1;
      },
      def: {
        set: (props, index1, index2, newDef) => {
          props.gaLayers[index1].qHyperCubeDef.qDimensions[index2].qAttributeExpressions.qExpression = newDef;
        },
        get: (props, index1, index2) => {
          return props.gaLayers[index1].qHyperCubeDef.qDimensions[index2].qAttributeExpressions.qExpression;
        }
      },
      libDef: {
        set: (props, index1, index2, newLibDef) => {
          props.gaLayers[index1].qHyperCubeDef.qDimensions[index2].qAttributeExpressions.qLibraryId = newLibDef;
        },
        get: (props, index1, index2) => {
          return props.gaLayers[index1].qHyperCubeDef.qDimensions[index2].qAttributeExpressions.qLibraryId;
        }
      },
      libDefMes: (props, index1, index2) => {
        props.gaLayers[index1].qHyperCubeDef.qDimensions[index2].qAttributeExpressions.qLibraryId = '';
      },
      generalCheck: (props, index) => {
        try {
          return !!props.gaLayers[index].qHyperCubeDef.qDimensions.qAttributeExpressions;
        } catch (err) {
          return false;
        }
      }
    }]
  },
  default: {
    name: "default",
    type: "measureBased",
    autoRange: true,
    showAll: true,
    paths: [
      {
        loopsCount: 1,
        path1: (props) => { return props.qHyperCubeDef.qMeasures; },
        libCheck: (props, index) => {
          return props.qHyperCubeDef.qMeasures[index].qLibraryId.length > 1;
        },
        def: {
          set: (props, index, newDef) => {
            props.qHyperCubeDef.qMeasures[index].qDef.qDef = newDef;
          },
          get: (props, index) => {
            return props.qHyperCubeDef.qMeasures[index].qDef.qDef;
          }
        },
        libDef: {
          set: (props, index, newLibDef) => {
            props.qHyperCubeDef.qMeasures[index].qLibraryId = newLibDef;
          },
          get: (props, index) => {
            return props.qHyperCubeDef.qMeasures[index].qLibraryId;
          }
        },
        libDefMes: (props, index) => {
          props.qHyperCubeDef.qMeasures[index].qLibraryId = '';
        },
        measureLabel: (props, index, measureLabel) => {
          props.qHyperCubeDef.qMeasures[index].qDef.qLabel = measureLabel;
        },
        generalCheck: (props, index) => {
          try {
            return !!props.qHyperCubeDef.qMeasures[index];
          } catch (err) {
            return false;
          }
        }
      }
    ]
  },
  boxplot: {
    name: "boxplot",
    type: "measureBased",
    autoRange: false,
    showAll: false,
    paths: [
      {
        loopsCount: 1,
        path1: (props) => { return props.boxplotDef.qHyperCubeDef.qMeasures; },
        libCheck: (props, index) => {
          return props.boxplotDef.qHyperCubeDef.qMeasures[index].qLibraryId.length > 1;
        },
        def: {
          set: (props, index, newDef) => {
            props.boxplotDef.qHyperCubeDef.qMeasures[index].qDef.qDef = newDef;
          },
          get: (props, index) => {
            return props.boxplotDef.qHyperCubeDef.qMeasures[index].qDef.qDef;
          }
        },
        libDef: {
          set: (props, index, newLibDef) => {
            props.boxplotDef.qHyperCubeDef.qMeasures[index].qLibraryId = newLibDef;
          },
          get: (props, index) => {
            return props.boxplotDef.qHyperCubeDef.qMeasures[index].qLibraryId;
          }
        },
        libDefMes: (props, index) => {
          props.boxplotDef.qHyperCubeDef.qMeasures[index].qLibraryId = '';
        },
        generalCheck: (props, index) => {
          try {
            return !!props.boxplotDef.qHyperCubeDef.qMeasures[index];
          } catch (err) {
            return false;
          }
        }
      }
    ]
  }
};
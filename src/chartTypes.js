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
      libPropTransfer: (props, index, libMeasure) => {
        const size = props.gaLayers[index].size;
        if (libMeasure.qLabelExpression) {
          size.label = {
            qStringExpression: libMeasure.qLabelExpression
          };
        } else {
          size.label = libMeasure.qLabel;
        }
        if (size.formatting.quarantine && size.formatting.quarantine.qNumFormat && libMeasure.qNumFormat) {
          size.formatting.qNumFormat = libMeasure.qNumFormat;
          size.formatting.isCustomFormatted = libMeasure.isCustomFormatted;
          size.formatting.quarantine = undefined;
        }
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
      libPropTransfer: (props, index, libMeasure) => {
        // find if and where the label should be stored
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
        const color = props.gaLayers[index].color;
        return !color.auto && color.mode == 'byMeasure' && color.byMeasureDef.type == 'libraryItem';
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
      libPropTransfer: (props, index, libMeasure) => {
        const color = props.gaLayers[index].color;
        if (libMeasure.qLabelExpression) {
          color.altLabel = {
            qStringExpression: libMeasure.qLabelExpression
          };
        } else {
          color.altLabel = libMeasure.qLabel;
        }
        if (color.formatting.quarantine && color.formatting.quarantine.qNumFormat && libMeasure.qNumFormat) {
          color.formatting.qNumFormat = libMeasure.qNumFormat;
          color.formatting.isCustomFormatted = libMeasure.isCustomFormatted;
          color.formatting.quarantine = undefined;
        }
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
        libPropTransfer: (props, index, libMeasure) => {
          const def = props.qHyperCubeDef.qMeasures[index].qDef;
          def.qLabel = libMeasure.qLabel;
          def.qLabelExpression = libMeasure.qLabelExpression;
          if (def.quarantine && def.quarantine.qNumFormat && libMeasure.qNumFormat) {
            def.qNumFormat = libMeasure.qNumFormat;
            def.isCustomFormatted = libMeasure.isCustomFormatted;
            def.quarantine = undefined;
          }
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
        libPropTransfer: (props, index, libMeasure) => {
          const def = props.boxplotDef.qHyperCubeDef.qMeasures[index].qDef;
          def.qLabel = libMeasure.qLabel;
          def.qLabelExpression = libMeasure.qLabelExpression;
          if (def.quarantine && def.quarantine.qNumFormat && libMeasure.qNumFormat) {
            def.qNumFormat = libMeasure.qNumFormat;
            def.isCustomFormatted = libMeasure.isCustomFormatted;
            def.quarantine = undefined;
          }
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

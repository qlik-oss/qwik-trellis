define(["qlik"], function (qlik) {
  return {
    forbiddenVisualizations: [
      'container',
      'qlik-show-hide-container',
      'qlik-tabbed-container',
      'qlik-trellis-container',
      'filterpane',
      'histogram'],

    getFields: function () {
      var app = qlik.currApp(this);
      return new Promise(function (resolve, reject) {
        try {
          app.getList("FieldList", function (model) {
            /* eslint-disable no-console */
            return resolve(model.qFieldList.qItems.map(function (item) {
              return {
                value: item.qName,
                label: item.qName
              };
            }).sort(compare));
          });
        }
        catch (err) {
          reject(err);
        }
      });
    },

    getMasterItems: function () {
      var self = this;
      var app = qlik.currApp(this);
      return new Promise(function (resolve, reject) {
        app.getList('masterobject').then(function (model) {
          // Close the model to prevent any updates.
          app.destroySessionObject(model.layout.qInfo.qId);

          // This is a bit iffy, might be smarter to reject and handle empty lists on the
          // props instead.
          let supportedMasterItems = model.layout.qAppObjectList.qItems.filter(function (item) {
            return self.forbiddenVisualizations.indexOf(item.qData.visualization) === -1;
          });

          if (!supportedMasterItems || supportedMasterItems.length === 0) {
            return resolve([{ value: '', label: 'No MasterObjects', visualization: '' }]);
          }

          supportedMasterItems.sort(function (item1, item2) {
            return item1.qMeta.title < item2.qMeta.title ? -1 : 1;
          });

          // Resolve an array with master objects.
          return resolve(supportedMasterItems.map(function (item) {
            return {
              value: item.qInfo.qId,
              label: item.qMeta.title,
              visualization: item.qData.visualization
            };
          }));
        });
      });
    }
  };
});

function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const genreA = a.label.toUpperCase();
  const genreB = b.label.toUpperCase();

  let comparison = 0;
  if (genreA > genreB) {
    comparison = 1;
  } else if (genreA < genreB) {
    comparison = -1;
  }
  return comparison;
}
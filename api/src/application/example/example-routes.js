module.exports = (controller) => {
  return [
    {
      method : 'GET',
      path : '/example',
      handler : controller.get
    },
  ];
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['example/example-controller'];

module.exports = (controller) => [
  {
    method: 'POST',
    path: '/api/invite',
    handler: controller.inviteAdmin,
    config: {
      auth: {
        strategy: 'jwt',
        scope: 'invite'
      }
    }
  }
];

module.exports['@singleton'] = true;
module.exports['@require'] = ['api/api-controller'];

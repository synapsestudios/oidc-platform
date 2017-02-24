module.exports = (userService) => ({
  inviteUser(request, reply) {
    reply(userService.inviteUser(request.payload));
  }
});

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
];

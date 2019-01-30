const webhookService = require('../webhook/webhook-service');
const Uuid = require('uuid');
const set = require('lodash/set');
const allowedImageMimes = require('../image/image-service');

// e.g. convert { foo.bar: 'baz' } to { foo: { bar: 'baz' }}
const expandDotPaths = function(object) {
  Object.keys(object).forEach(key => {
    if (key.indexOf('.') > -1) {
      const value = object[key];
      delete(object[key]);
      set(object, key, value);
    }
  });
  return object;
};

module.exports = (userService, imageService) => {
  return {
    async updateUserProfile(user, requestPayload) {
      let profile = user.get('profile');
      const { shouldClearPicture, ...originalPayload } = requestPayload;
      const payload = expandDotPaths(originalPayload);

      const oldPicture = profile.picture;
      const pictureMIME = originalPayload.picture
        ? originalPayload.picture.hapi.headers['content-type']
        : null;

      if (allowedImageMimes.includes(pictureMIME)) {
        const uuid = Uuid();
        const bucket = uuid.substring(0, 2);
        const filename = await imageService.uploadImageStream(originalPayload.picture, `pictures/${bucket}/${uuid}`);

        profile = Object.assign(profile, payload, { picture: filename });
      } else {
        delete originalPayload.picture;
        if (shouldClearPicture) {
          profile = Object.assign(profile, payload, {picture: null});
        } else {
          profile = Object.assign(profile, payload);
        }
      }

      user = await userService.update(user.get('id'), { profile });
      webhookService.trigger('user.update', user);

      if (oldPicture) {
        await imageService.deleteImage(oldPicture.replace(/^.*\/\/[^\/]+\//, ''));
      }

      return user;
    },

  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'image/image-service',
];

const url = require('url');
const aws = require('aws-sdk');
const s3Bucket = require('../config')('/aws/s3Bucket');

const s3 = new aws.S3();
const BATCH_SIZE = 10000;


exports.up = async knex => {
  const fetchUsers = lastId => {
    const query = knex.select().table('SIP_user')
      .orderBy('id', 'asc')
      .limit(BATCH_SIZE);

    if (lastId) query.where('id', '>', lastId);
    return query;
  };


  let lastId = null;
  let users = await fetchUsers(lastId);
  while (users.length) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].profile.picture) {
        users[i].profile.depricatedPicture = users[i].profile.picture;
        const parsedPictureLocation = url.parse(users[i].profile.picture);
        const newPath = `pictures/${users[i].id.substring(0, 2)}/${users[i].id}`;

        const copyParams = {
          Bucket: s3Bucket,
          CopySource: `/${s3Bucket}${parsedPictureLocation.pathname}`,
          Key: newPath,
        };
        await s3.copyObject(copyParams).promise();

        users[i].profile.picture = `https://${s3Bucket}.s3.amazonaws.com/${newPath}`;

        await knex('SIP_user')
          .where('id', users[i].id)
          .update({ profile: users[i].profile });
      }
    }


    users = await fetchUsers(users[users.length - 1].id);
  }
};

exports.down = () => { /* noop */ };

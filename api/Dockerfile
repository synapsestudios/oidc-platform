FROM node:10.15.0

ARG PACKAGE_PATH=
ARG WORKING_DIR=/src

WORKDIR $WORKING_DIR

ADD $PACKAGE_PATH/package.json $WORKING_DIR/package.json
COPY $PACKAGE_PATH/package-lock.json $WORKING_DIR/package-lock.json
RUN npm install
COPY . /src

VOLUME $WORKING_DIR/node_modules
CMD [ "npm", "start" ]

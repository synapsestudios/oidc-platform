FROM node:8.1.0

ARG PACKAGE_PATH=package.json
ARG WORKING_DIR=/src

WORKDIR $WORKING_DIR

ADD $PACKAGE_PATH $WORKING_DIR/package.json
RUN npm install
COPY . /src

VOLUME $WORKING_DIR/node_modules
CMD [ "npm", "start" ]

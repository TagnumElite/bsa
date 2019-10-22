FROM node:8-alpine
LABEL authors="TagnumElite <tagnumelite@elitekast.com> (https://tagnumelite.com)"

RUN ["mkdir", "-p", "/usr/src/bsa"]

WORKDIR /usr/src/bsa

COPY ["package.json", "package-lock.json", "/usr/src/bsa/"]

# See More: https://github.com/nodejs/docker-node/issues/384#issuecomment-305208112
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python && \
    npm install --quiet node-gyp -g &&\
    NODE_ENV=development npm ci && \
    apk del native-deps

COPY [".", "/usr/src/bsa"]

RUN npm install && \
    npm prune --production && \
    npm cache clean --force

ENV NODE_ENV production

VOLUME [ "/data" ]

ENTRYPOINT [ "/usr/src/bsa/bin/bsa.js" ]
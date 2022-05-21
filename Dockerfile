FROM node:14-alpine AS BUILD
WORKDIR /tmp/src
COPY ./package.json /tmp/src/package.json
COPY ./yarn.lock /tmp/src/yarn.lock
# install some dependencies needed for the build process
RUN apk add --no-cache -t build-deps make gcc g++ python3 ca-certificates libc-dev wget git
RUN git config --global url.https://github.com/.insteadOf git://github.com/ \
    && yarn

COPY . /tmp/src

RUN yarn build

FROM node:14-alpine
ENV NODE_ENV=production
COPY --from=BUILD /tmp/src/build /build
COPY --from=BUILD /tmp/src/config /config
COPY --from=BUILD /tmp/src/node_modules /node_modules
RUN sh -c 'cd /build/tools; for TOOL in *.js; do LINK="/usr/bin/$(basename $TOOL .js)"; echo -e "#!/bin/sh\ncd /data;\nnode /build/tools/$TOOL \$@" > $LINK; chmod +x $LINK; done'
CMD node /build/src/discordas.js -p 9005 -c /data/config.yaml -f /data/discord-registration.yaml
EXPOSE 9005
VOLUME ["/data"]

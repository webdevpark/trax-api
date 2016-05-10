# ----------------------------------------------------------------------------
# trax-api docker container
# 

FROM node:latest
MAINTAINER Firstmac Limited

# Firstmac: Proxy access 
# ENV http_proxy 'http://172.23.90.1:8080'
# ENV https_proxy 'http://172.23.90.1:8080'
# ENV ftp_proxy 'http://172.23.90.1:8080'
# ENV no_proxy '.firstmac.com.au'

# Internal application server listens on 3000
EXPOSE 3000

# setup the application folder 
ADD . /usr/src/app
WORKDIR /usr/src/app

# TODO: add the certificate (not included with the source repository)
# ADD /opt/firstmac/certificates/firstmac-com-au.cer /usr/src/app/secrets/jobs-api.cer
# ADD /opt/firstmac/certificates/firstmac-com-au.key /usr/src/app/secrets/jobs-api.key

RUN git config --global url."https://".insteadOf git://

# get the application installed
RUN npm install --unsafe-perm

# setup the bower dependencies
RUN node_modules/.bin/gulp js && \
    node_modules/.bin/gulp static

# start the application
CMD [ "node", "index.js" ]

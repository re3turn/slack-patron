FROM ruby:2.4-alpine
LABEL maintainer="namatyage@gmail.com"

ARG REPOSITORY="https://github.com/re3turn/slack-patron.git"
ARG BRANCH="master"
ARG SRCDIR="/usr/local/slack-patron"

RUN set -x && \
	apk add --no-cache \
	git \
	build-base \
	openssl \
	openssl-dev && \
	echo 'gem: --no-document' >> /etc/gemrc && \
	git clone ${REPOSITORY} ${SRCDIR} && \
	cd ${SRCDIR} && \
	git checkout ${BRANCH} && \
	bundle install

WORKDIR ${SRCDIR}

CMD bundle exec ruby logger/logger.rb

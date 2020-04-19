FROM ruby:2.4-alpine
LABEL maintainer="namatyage@gmail.com"

ARG SRCDIR="/usr/local/slack-patron"

RUN set -x && \
	apk add --no-cache \
	build-base \
	openssl \
	openssl-dev && \
	echo 'gem: --no-document' >> /etc/gemrc

COPY ./ ${SRCDIR}

WORKDIR ${SRCDIR}

RUN bundle install

CMD bundle exec ruby logger/logger.rb

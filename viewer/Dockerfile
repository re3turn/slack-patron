FROM ruby:2.4-alpine
LABEL maintainer="namatyage@gmail.com"

ARG SRCDIR="/usr/local/slack-patron"

RUN set -x && \
	apk add  --no-cache \
	build-base \
	openssl \
	nodejs \
	nodejs-npm && \
	echo 'gem: --no-document' >> /etc/gemrc

COPY . ${SRCDIR}

WORKDIR ${SRCDIR}

RUN bundle install && ./viewer/setup.sh

CMD bundle exec puma viewer/config.ru -C viewer/puma.rb -p 9292

EXPOSE 9292

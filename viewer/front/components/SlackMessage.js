import React, { Component } from 'react';
import ChannelName from './ChannelName';
import { Link } from 'react-router-dom';
import { EmojiData } from 'emoji-data-ts';
import MessagesType from '../constants/MessagesType';
import find from 'lodash/find';

const emojiData = new EmojiData();
const emojiRegex = new RegExp(':([\\p{Letter}\\p{Number}+\\-_\']+):', 'giu');

export default class extends Component {
  getChannel(id) {
    const channels = this.props.channels;
    const ims = this.props.ims;
    if (channels && channels[id]) {
      return channels[id];
    }
    if (ims && ims[id]) {
      return ims[id];
    }
  }
  getUser(id) {
    const users = this.props.users;
    return users && users[id];
  }
  getEmojiImage(name) {
    const data = emojiData.getImageData(name);
    if (data) {
      return `https://cdn.jsdelivr.net/gh/iamcal/emoji-data@v4.1.0/img-apple-64/${data.imageUrl}`
    }
    const emojis = this.props.emojis;
    const emoji = emojis && emojis[name];
    if (emoji && emoji.startsWith('alias:')) {
      return this.getEmojiImage(emoji.split(':')[1]);
    }
    return emoji;
  }
  formatDate(date) {
    return new Date(date * 1000).toLocaleString();
  }
  formatText(text) {
    const entity = (str) => {
      return str.replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };
    const channelLink = (id) => {
      const channel = this.getChannel(id);
      return `#${channel && channel.name}`;
    };
    const userLink = (id) => {
      const user = this.getUser(id);
      return `@${user && (user.profile.display_name || user.profile.real_name || user.name)}`;
    };
    const specialCommand = (command) => `@${command}`;
    const uriLink = (uri) => `<a href="${uri}" target="_blank">${uri}</a>`;
    const emojiImage = (name) => {
      const image = this.getEmojiImage(name);
      if (image) {
        return `<img class="slack-message-emoji" src="${image}">`;
      }
      return `:${name}:`;
    };
    if (text) {
      return text.replace(/<#([0-9A-Za-z]+)>/, (m, id) => channelLink(id))
        .replace(/<#([0-9A-Za-z]+)\|([0-9A-Za-z]+)>/gi, (m, id) => channelLink(id))
        .replace(/<@([0-9A-Za-z]+)>/gi, (m, id) => userLink(id))
        .replace(/<@([0-9A-Za-z]+)\|([0-9A-Za-z]+)>/gi, (m, id) => userLink(id))
        .replace(/<!(channel|everyone|group)>/gi, (m, command) => specialCommand(command))
        .replace(/<(https?:\/\/[^>]*)>/gi, (m, uri) => uriLink(entity(uri)))
        .replace(emojiRegex, (m, name) => emojiImage(name));
    }
    return text;
  }
  messageLink(message) {
    return `/${message.channel}/${message.ts}`;
  }
  originalMessageLink(teamInfo, message) {
    const messageId = message.ts.replace('.', '');
    return `https://${teamInfo.domain}.slack.com/messages/${message.channel}/p${messageId}`;
  }
  renderReaction(reaction) {
    return (
      <div className="slack-message-reaction" key={reaction.name}>
        {
          this.getEmojiImage(reaction.name) ? (
            <img className="slack-message-reaction-image" src={this.getEmojiImage(reaction.name)} />
          ) : (
            `:${reaction.name}:`
          )
        }
        <div className="slack-message-reaction-count">{reaction.count}</div>
      </div>);
  }
  render() {
    const createMarkup = (text) => {
      return {
        __html: this.formatText(text) || ''
      };
    };
    const SlackMessagePrototype = ({ message, icon, username, showChannel, teamInfo, text }) => {
      const channel = this.getChannel(message.channel);
      const classNames = ['slack-message'];
      if (this.props.selected) {
        classNames.push('selected');
      }

      return (
        <div className={ classNames.join(' ') } ref={this.props.messageRef}>
          <div className="slack-message-user-image">
            <img src={icon} />
          </div>
          <div className="slack-message-content">
            <div className="slack-message-head">
              <div className="slack-message-user-name">{username}</div>
              <div className="slack-message-date">
                <Link to={this.messageLink(message)}>
                  {this.formatDate(message.ts)}
                </Link>
              </div>
              { showChannel && channel ? (
                  <div className="slack-message-channel">
                    <Link to={ `/${channel.id}` }>
                      <ChannelName channel={channel} />
                    </Link>
                  </div>
                ) : null }
              <div className="slack-original-message-link">
                <a href={this.originalMessageLink(teamInfo, message)} target="_blank">open original</a>
              </div>
            </div>
            <div className="slack-message-text"
              dangerouslySetInnerHTML={createMarkup(text)}></div>
            { message.reactions && message.reactions.length > 0 && (
              <div className="slack-message-reactions">{
                message.reactions.map((reaction) => this.renderReaction(reaction))
              }</div> ) }
          </div>
        </div>
      );
    };
    const getBotText = (message) => {
      const attachment = find(message.attachments, (attachment) => { return attachment.text || attachment.fallback });
      const file = find(message.files, (file) => file.url_private);
      let text = "";
      if (message.text) {
        text += message.text;
      }
      if (attachment) {
        text += (text ? "\n" : "")
          + (attachment.text ? attachment.text + "\n" : "")
          + (attachment.fallback ? attachment.fallback : "");
      }
      return text;
    }
    const getText = (message) => {
      const attachment = find(message.attachments, (attachment) => attachment.text);
      const file = find(message.files, (file) => file.url_private);
      let text = "";
      if (message.text) {
        text += message.text;
      }
      if (attachment) {
        text += (text ? "\n" : "")
          + (attachment.title ? attachment.title + "\n" : "")
          + (attachment.text ? attachment.text : "");
      }
      if (file) {
        text += (text ? "\n" : "")
          + (file.title ? file.title + "\n" : "")
          + (file.url_private ? "<" + file.url_private + ">" : "");
      }
      return text;
    }
    const botMessage = (teamInfo, message, showChannel) => {
      const text = getBotText(message);
      const attachment = find(message.attachments, (attachment) => attachment.text);
      const icon = message.icons ? message.icons.image_48 : (attachment ? attachment.author_icon : '');
      return <SlackMessagePrototype
          message={message}
          icon={icon}
          username={message.username}
          showChannel={showChannel}
          teamInfo={teamInfo}
          text={text}
        />
    };
    const normalMessage = (teamInfo, message, user, showChannel) => {
      const text = getText(message);
      return <SlackMessagePrototype
          message={message}
          icon={user && user.profile.image_48}
          username={user && (user.profile.display_name || user.profile.real_name || user.name)}
          showChannel={showChannel}
          teamInfo={teamInfo}
          text={text}
        />
    };

    if (this.props.message.hidden) {
      return null;
    }

    const message = this.props.message;
    const showChannel = this.props.type === MessagesType.SEARCH_MESSAGES;
    if (this.props.message.bot_id || this.props.message.subtype == "bot_message") {
      return botMessage(this.props.teamInfo, message, showChannel);
    } else {
      return normalMessage(this.props.teamInfo, message, this.getUser(message.user), showChannel);
    }
  }
}

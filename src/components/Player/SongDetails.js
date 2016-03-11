import React, {Component, PropTypes} from 'react';

export default class SongDetails extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {title, username} = this.props;
    return (
      <div className="song-card-details">
        <span className="song-card-title">
          {title}
        </span>
        <span className="song-card-artist">
          {username}
        </span>
      </div>
    );
  }
}

SongDetails.propTypes = {
  title: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
};

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {changeCurrentTime, changeSong, toggleIsPlaying} from '../../actions/player';
import Playlist from './Playlist';
import Popover from './Popover';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SongDetails from './SongDetails';
import {CHANGE_TYPES} from '../../constants/SongConstants';
import {formatSeconds} from '../../utils/FormatUtils';
import {offsetLeft} from '../../utils/MouseUtils';
import {nextEntry, previousEntry} from 'redux/modules/player';

import {apiEndPoint} from '../../helpers/ApiClient';
// import {getImageUrl} from '../utils/SongUtils';

@connect(
    state => ({player: state.player}),
    dispatch => bindActionCreators({changeCurrentTime, changeSong, toggleIsPlaying, nextEntry, previousEntry}, dispatch))
export default class Player extends Component {
  static propTypes = {
    songs: PropTypes.object,
    users: PropTypes.object,
    playingSongId: PropTypes.number,
    player: PropTypes.shape({
      currentSongIndex: PropTypes.number,
      currentTime: PropTypes.number,
      isPlaying: PropTypes.bool,
      playlist: PropTypes.array,
      selectedPlaylists: PropTypes.array
    }),
    nextEntry: PropTypes.func.isRequired,
    previousEntry: PropTypes.func.isRequired,
    playlists: PropTypes.object,
    currentTime: PropTypes.number,
    changeCurrentTime: PropTypes.func.isRequired,
    changeSong: PropTypes.func.isRequired,
    toggleIsPlaying: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.changeSong = this.changeSong.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.handleEnded = this.handleEnded.bind(this);
    this.handleLoadedMetadata = this.handleLoadedMetadata.bind(this);
    this.handleLoadStart = this.handleLoadStart.bind(this);
    this.handleSeekMouseDown = this.handleSeekMouseDown.bind(this);
    this.handleSeekMouseMove = this.handleSeekMouseMove.bind(this);
    this.handleSeekMouseUp = this.handleSeekMouseUp.bind(this);
    this.handleVolumeMouseDown = this.handleVolumeMouseDown.bind(this);
    this.handleVolumeMouseMove = this.handleVolumeMouseMove.bind(this);
    this.handleVolumeMouseUp = this.handleVolumeMouseUp.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.seek = this.seek.bind(this);
    this.nextHandler = this.nextHandler.bind(this);
    this.previousHandler = this.previousHandler.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.toggleRepeat = this.toggleRepeat.bind(this);
    this.toggleShuffle = this.toggleShuffle.bind(this);
    this.state = {
      duration: 0,
      isSeeking: false,
      muted: false,
      repeat: false,
      shuffle: false,
      volume: 0.5,
    };
  }

  componentDidMount() {
    document.addEventListener('keypress', this.onKeyPress);
    const audioElement = ReactDOM.findDOMNode(this.refs.audio);
    audioElement.addEventListener('ended', this.handleEnded, false);
    audioElement.addEventListener('loadedmetadata', this.handleLoadedMetadata, false);
    audioElement.addEventListener('loadstart', this.handleLoadStart, false);
    audioElement.addEventListener('pause', this.handlePause, false);
    audioElement.addEventListener('play', this.handlePlay, false);
    audioElement.addEventListener('timeupdate', this.handleTimeUpdate, false);
    audioElement.addEventListener('volumechange', this.handleVolumeChange, false);
    audioElement.play();
  }
  onKeyPress(event) {
    const keyCode = event.keyCode || event.which;
    const isInsideInput = event.target.tagName.toLowerCase().match(/input|textarea/);
    if (isInsideInput) {
      return;
    }

    if (keyCode === 32) {
      event.preventDefault();
      this.togglePlay();
    } else if (keyCode === 106) {
      event.preventDefault();
      this.changeSong(CHANGE_TYPES.PREV);
    } else if (keyCode === 107) {
      event.preventDefault();
      this.changeSong(CHANGE_TYPES.NEXT);
    }
  }

  bindSeekMouseEvents() {
    document.addEventListener('mousemove', this.handleSeekMouseMove);
    document.addEventListener('mouseup', this.handleSeekMouseUp);
  }

  bindVolumeMouseEvents() {
    document.addEventListener('mousemove', this.handleVolumeMouseMove);
    document.addEventListener('mouseup', this.handleVolumeMouseUp);
  }

  changeSong(changeType) {
    this.props.changeSong(changeType);
  }

  changeVolume(event) {
    const audioElement = ReactDOM.findDOMNode(this.refs.audio);
    const volume = (event.clientX - offsetLeft(event.currentTarget)) / event.currentTarget.offsetWidth;
    audioElement.volume = volume;
  }

  nextHandler() {
    // Workaround for updating the time in case we have only one track in playlist
    document.getElementById('audio').currentTime = 0;
    this.props.nextEntry();
  }
  previousHandler() {
    // Workaround for updating the time in case we have only one track in playlist
    this.props.previousEntry();
  }

  handleEnded() {
    if (this.state.repeat) {
      ReactDOM.findDOMNode(this.refs.audio).play();
    } else if (this.state.shuffle) {
      this.changeSong(CHANGE_TYPES.SHUFFLE);
    } else {
      this.changeSong(CHANGE_TYPES.NEXT);
    }
  }

  handleLoadedMetadata() {
    const audioElement = ReactDOM.findDOMNode(this.refs.audio);
    if (audioElement) {
      this.setState({
        duration: Math.floor(audioElement.duration)
      });
    }
  }

  handleLoadStart() {
    this.props.changeCurrentTime(0);
  }

  handleMouseClick(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  handlePause() {
    this.props.toggleIsPlaying(false);
  }

  handlePlay() {
    console.log('IS PLAYING');
    this.props.toggleIsPlaying(true);
  }

  handleSeekMouseDown() {
    this.bindSeekMouseEvents();
    this.setState({
      isSeeking: true,
    });
  }

  handleSeekMouseMove(event) {
    const seekBar = ReactDOM.findDOMNode(this.refs.seekBar);
    const diff = event.clientX - offsetLeft(seekBar);
    const pos = diff < 0 ? 0 : diff;
    let percent = pos / seekBar.offsetWidth;
    percent = percent > 1 ? 1 : percent;

    this.props.changeCurrentTime(Math.floor(percent * this.state.duration));
  }

  handleSeekMouseUp() {
    if (!this.state.isSeeking) {
      return;
    }

    document.removeEventListener('mousemove', this.handleSeekMouseMove);
    document.removeEventListener('mouseup', this.handleSeekMouseUp);
    this.setState({
      isSeeking: false,
    }, function updateTime() {
      ReactDOM.findDOMNode(this.refs.audio).currentTime = this.props.player.currentTime;
    });
  }

  handleTimeUpdate(event) {
    if (this.state.isSeeking) {
      return;
    }
    const audioElement = event.currentTarget;
    const currentTime = Math.floor(audioElement.currentTime);
    this.props.changeCurrentTime(currentTime);
  }

  handleVolumeChange(event) {
    if (this.state.isSeeking) {
      return;
    }

    this.setState({
      volume: event.currentTarget.volume
    });
  }

  handleVolumeMouseDown() {
    this.bindVolumeMouseEvents();
    this.setState({
      isSeeking: true,
    });
  }

  handleVolumeMouseMove(event) {
    const volumeBar = ReactDOM.findDOMNode(this.refs.volumeBar);
    const diff = event.clientX - offsetLeft(volumeBar);
    const pos = diff < 0 ? 0 : diff;
    let percent = pos / volumeBar.offsetWidth;
    percent = percent > 1 ? 1 : percent;

    this.setState({volume: percent});
    ReactDOM.findDOMNode(this.refs.audio).volume = percent;
  }

  handleVolumeMouseUp() {
    if (!this.state.isSeeking) {
      return;
    }

    document.removeEventListener('mousemove', this.handleVolumeMouseMove);
    document.removeEventListener('mouseup', this.handleVolumeMouseUp);

    this.setState({
      isSeeking: false,
    }, function updateVolume() {
      ReactDOM.findDOMNode(this.refs.audio).volume = this.state.volume;
    });
  }

  seek(event) {
    const audioElement = ReactDOM.findDOMNode(this.refs.audio);
    const currentTime = Math.floor(((event.clientX - offsetLeft(event.currentTarget)) / event.currentTarget.offsetWidth) * this.state.duration);
    this.props.changeCurrentTime(currentTime);
    audioElement.currentTime = currentTime;
  }

  toggleMute() {
    const audioElement = ReactDOM.findDOMNode(this.refs.audio);
    if (this.state.muted) {
      audioElement.muted = false;
    } else {
      audioElement.muted = true;
    }

    this.setState({
      muted: !this.state.muted
    });
  }

  togglePlay() {
    const {
      isPlaying
    } = this.props.player;
    const audioElement = ReactDOM.findDOMNode(this.refs.audio);
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  }

  toggleRepeat() {
    this.setState({
      repeat: !this.state.repeat
    });
  }

  toggleShuffle() {
    this.setState({
      shuffle: !this.state.shuffle
    });
  }

  renderVolumeIcon() {
    const {muted, volume} = this.state;
    if (muted) {
      return <i className="pictoFont basic-pictomute"></i>;
    }

    if (volume === 0) {
      return <i className="pictoFont basic-pictovolume"></i>;
    } else if (volume === 1) {
      return (
        <div className="player-volume-button-wrap">
          <i className="icon ion-android-volume-up"></i>
          <i className="pictoFont basic-pictovolume"></i>
        </div>
      );
    }
    return (
      <div className="player-volume-button-wrap">
        <i className="icon ion-android-volume-down"></i>
        <i className="pictoFont basic-pictovolume"></i>
      </div>
    );
  }

  renderVolumeBar() {
    const {muted, volume} = this.state;
    const width = muted ? 0 : volume * 100;
    return (
      <div className="player-seek-duration-bar" style={{width: `${width}%`}}>
        <div className="player-seek-handle" onClick={this.handleMouseClick} onMouseDown={this.handleVolumeMouseDown}>
        </div>
      </div>
    );
  }

  renderPlaylist() {
    const {player, songs} = this.props;
    return (
      <Playlist
                player={player}
                songs={songs} />
    );
  }

  renderDurationBar() {
    const {duration} = this.state;
    const {currentTime} = this.props.player;
    if (duration !== 0) {
      const width = currentTime / duration * 100;
      return (
        <div className="player-seek-duration-bar" style={{width: `${width}%`}} >
          <div className="player-seek-handle" onClick={this.handleMouseClick} onMouseDown={this.handleSeekMouseDown}>
          </div>
        </div>
      );
    }
  }

  render() {
    const {currentTime, isPlaying, playlist, currentSongIndex} = this.props.player;
    if (!playlist) {
      return (<div> </div>);
    }
    return (
      <div className="player">
        <audio id="audio" autoPlay src={currentSongIndex !== null ? (apiEndPoint() + '/snippets/' + playlist[currentSongIndex].source) : ''} ref="audio"></audio>
        <div className="container">
          <div className="player-main">
            {currentSongIndex !== null &&
            <div className="player-section player-info">
              <img className="player-image" src={apiEndPoint() + '/images/' + playlist[currentSongIndex].cover} />
              <SongDetails
                title={playlist[currentSongIndex].title + ' (' + playlist[currentSongIndex].version + ')'}
                username={'artists name '} />
            </div>
            }
            <div className="player-section">
              <div
                className="player-button">
                <icon onClick={this.previousHandler} className="basic-pictoskip-back pictoFont"></icon>
              </div>
              <div
                className="player-button"
                onClick={this.togglePlay}>
                <i className={'pictoFont ' + (isPlaying ? 'basic-pictopause' : 'basic-pictoplay')}></i>
              </div>
              <div
                className="player-button">
                <icon onClick={this.nextHandler} className="basic-pictoskip-forward pictoFont"></icon>
              </div>
            </div>
            <div className="player-section player-seek">
              <div className="player-seek-bar-wrap">
                <div className="player-seek-bar" ref="seekBar">
                    {this.renderDurationBar()}
                </div>
              </div>
              <div className="player-time">
                <span>{formatSeconds(currentTime)}</span>
                <span className="player-time-divider">/</span>
                <span>{formatSeconds(this.state.duration)}</span>
              </div>
            </div>
            <div className="player-section">
              <div
                className={'player-button' + (this.state.repeat ? ' active' : '')}
                onClick={this.toggleRepeat}>
                <icon className="basic-pictorepeat pictoFont"></icon>
              </div>
              <div
                className={'player-button' + (this.state.shuffle ? ' active' : '')}
                onClick={this.toggleShuffle}>
                <icon className="basic-pictoshuffle pictoFont"></icon>
              </div>
              <Popover className={'player-button top-right'}>
                  <i className="pictoFont basic-pictoalign-justify"></i>
                  {this.renderPlaylist()}
              </Popover>
              <div
                className={'player-button player-volume-button'}
                onClick={this.toggleMute}>
                {this.renderVolumeIcon()}
              </div>
              <div className="player-volume">
                <div className="player-seek-bar-wrap" onClick={this.changeVolume}>
                  <div className="player-seek-bar" ref="volumeBar">
                    {this.renderVolumeBar()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

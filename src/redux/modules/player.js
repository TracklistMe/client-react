import * as types from '../../constants/ActionTypes';
// Load cart informations
const PLAYER_ADD_TRACK = 'PLAYER_ADD_TRACK';
const PLAYER_ADD_TRACK_SUCCESS = 'PLAYER_ADD_TRACK_SUCCESS';
const PLAYER_ADD_TRACK_FAILURE = 'PLAYER_ADD_TRACK_FAILURE';

const initialState = {
  currentSongIndex: null,
  currentTime: 0,
  isPlaying: false,
  selectedPlaylists: [],
  playlist: []
};

export default function reducer(state = initialState, action) {
  console.log(action.type);
  switch (action.type) {
    case PLAYER_ADD_TRACK:
      let isPlaying = state.isPlaying;
      let currentSongIndex = state.currentSongIndex;
      // check if the current track playing is the one that you want to play.
      if (currentSongIndex) {
        console.log(state.playlist[currentSongIndex].source, action.song.source);
      }
      if (currentSongIndex && state.playlist[currentSongIndex].source === action.song.source) {
        // in this case the track is the same.
      } else {
        state.playlist.push(action.song);
        if (action.addToQueue === false) {
          // play the track straight away
          isPlaying = true;
          currentSongIndex = state.playlist.length - 1;
          console.log(currentSongIndex);
        }
      }
      return {
        ...state,
        playlist: state.playlist,
        currentSongIndex: currentSongIndex,
        isPlaying: isPlaying
      };
    case PLAYER_ADD_TRACK_SUCCESS:
      break;
    case PLAYER_ADD_TRACK_FAILURE:
      break;
    case types.CHANGE_CURRENT_TIME:
      console.log(action.time);
      return {
        ...state,
        currentTime: action.time
      };
    case types.CHANGE_PLAYING_SONG:
      return Object.assign({}, state, {
        currentSongIndex: action.songIndex
      });
    case types.CHANGE_SELECTED_PLAYLISTS:
      return Object.assign({}, state, {
        selectedPlaylists: action.playlists
      });
    case types.RESET_AUTHED:
      return Object.assign({}, state, initialState);
    case types.TOGGLE_IS_PLAYING:
      return Object.assign({}, state, {
        isPlaying: action.isPlaying
      });
    default:
      return state;
  }
}

export function playTrack(song, startingTime = -1, addToQueue = false) {
  console.log(song);
  song.source = song.snippetPath;
  console.log(song);
  return {
    type: PLAYER_ADD_TRACK,
    song: song,
    startingTime: startingTime,
    addToQueue: addToQueue
  };
}

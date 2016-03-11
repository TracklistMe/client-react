import * as types from '../../constants/ActionTypes';
// Load cart informations
const PLAYER_ADD_TRACK = 'PLAYER_ADD_TRACK';
const GO_TO_ENTRY = 'GO_TO_ENTRY';
const GO_TO_NEXT = 'GO_TO_NEXT';
const GO_TO_PREVIOUS = 'GO_TO_PREVIOUS';

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
      if (currentSongIndex !== null) {
        console.log(state.playlist[currentSongIndex].source, action.song.source);
      }
      if (currentSongIndex !== null && state.playlist[currentSongIndex].source === action.song.source) {
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
    case GO_TO_ENTRY:
      return {
        ...state,
        currentSongIndex: action.index
      };
    case GO_TO_NEXT:
      return {
        ...state,
        currentTime: 0,
        currentSongIndex: (state.currentSongIndex + 1) % state.playlist.length
      };
    case GO_TO_PREVIOUS:
      let previousEntryIndex = state.currentSongIndex - 1;
      if (previousEntryIndex < 0) {
        previousEntryIndex = state.playlist.length - 1;
      }
      return {
        ...state,
        currentTime: 0,
        currentSongIndex: previousEntryIndex
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
  song.source = song.snippetPath;
  return {
    type: PLAYER_ADD_TRACK,
    song: song,
    startingTime: startingTime,
    addToQueue: addToQueue
  };
}

export function goToEntry(index) {
  return {
    type: GO_TO_ENTRY,
    index: index
  };
}

export function nextEntry() {
  return {
    type: GO_TO_NEXT
  };
}

export function previousEntry() {
  return {
    type: GO_TO_PREVIOUS
  };
}

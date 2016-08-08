import React, {Component, PropTypes } from 'react';
import MainHeaderBackground from '../MainHeader/MainHeaderBackground';
import TimeDuration from '../Utilities/TimeDuration';
import BuyFromJumbotronPlaylist from '../Buttons/BuyFromJumbotronPlaylist';
import {apiEndPoint} from '../../helpers/ApiClient';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {addTrackToCart} from 'redux/modules/cart';

@connect(
    null,
    dispatch => bindActionCreators({addTrackToCart}, dispatch))


export default class ReleaseJumbotron extends Component {
  static propTypes = {
    addTrackToCart: PropTypes.func.isRequired,
    release: PropTypes.object
  };


  constructor(props) {
    super(props);
    this.handleAddTrack = this.handleAddTrack.bind(this);
  }

  handleAddTrack(id) {
    this.props.addTrackToCart(id);
  }

  render() {
    const release = this.props.release; // eslint-disable-line no-shadow
    if (!release || !release.Tracks) {
      return (<div></div>);
    }
    const height = Math.max(570, 400 + (release.Tracks.length * 40));
    const uniqueArtists = [];
    let imd = 0;
    for (const track of release.Tracks) {
      for (const artist of track.Producer) {
        imd = imd + 1;
        if (!uniqueArtists[artist.id]) {
          // The artist doesn't exists.
          uniqueArtists[artist.id] = { artist: artist, counter: 1};
        } else {
          // The artist exists, increment the counter
          uniqueArtists[artist.id].counter = uniqueArtists[artist.id].counter + 1;
        }
      }
    }
    return (
      <div className="releaseJumbotron">
      <MainHeaderBackground image={apiEndPoint() + '/releases/' + release.id + '/cover/small'} height={height}/>
      <div className="headerContent" style={{height: height + 'px'}} >
        <div className="row trackJumbotronContainer">
        <div className="col-sub-xs-10 col-sub-xs-offset-4 col-sub-sm-offset-0 hidden-sm col-sub-sm-6 col-sub-md-5 col-sub-lg-4 overflowHidden">
          <img className="cover" src={apiEndPoint() + '/releases/' + release.id + '/cover/small'} />
        </div>
        <div className="col-sub-xs-18 col-sub-sm-18 col-sub-md-13 col-sub-lg-14">
          <div className="row hidden-xs">
          <div className="col-lg-6 text-left trackDescriptionSpace">
            <div className="labelContainer">
            Label: <strong>{release.Labels[0].displayName}</strong>
            </div>
            <div>
            Artist
            </div>
          </div>
          <div className="col-lg-6 text-right">
            Album
          </div>
          <div className="col-lg-12 titleContainer">
              <h1>{release ? release.title : ''} </h1>
          </div>
          </div>
          <div className="row">
            <div className="hidden-xs">
              <table>
                <tbody>
                  {release.Tracks.map((track, index) =>
                    <tr key={index}>
                      <td width="2%">{index + 1}</td>
                      <td>{track.title} ({track.version})</td>
                      <td className="artistList">
                        {track.Producer.map((producer, indexProducer) =>
                          <span key={indexProducer}>{producer.displayName}</span>
                        )}
                      </td>
                      <td>
                        {track.Genres.map((genre, indexGenre) =>
                          <span key={indexGenre}>{genre.name}</span>
                        )}
                      </td>
                      <td>
                        <TimeDuration length={track.lengthInSeconds} /> / {Math.floor(track.bpm * 10) / 10}bpm
                      </td>
                      <td className="text-right">
                        <BuyFromJumbotronPlaylist handler={this.handleAddTrack.bind(this, track.id)} name={track.Price + '$'} icon />
                      </td>

                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    );
  }
}

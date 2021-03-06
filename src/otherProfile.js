import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import axios from "./axios";
import { BrowserRouter, Route, Link } from "react-router-dom";
import { Logo, Login } from "./welcome";
import { FriendButton } from "./friendButton";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import { getPinInfo, getUserPinInfo, selectActionBycategory } from "./actions";
import ListOfLocations from "./ListOfLocations.js";
import PinClick from "./PinClick.js";

class OtherProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            arrayOfCategory: [],
            showCategorySelect: false,
            copyOfPinsArray: [],
            // addMyPinLocationVisible: false,
            myLat: null,
            myLng: null,
            // watchId: null,
            // activeMarker: {},
            // selectedPlace: {},
            showingInfoWindow: false,
            addNewPinIsVisible: false,
            clickedPinId: null,
            pinClickVisible: false,
            mapHasBinClicked: false
        };

        this.checkValue = this.checkValue.bind(this);
        this.pinClick = this.pinClick.bind(this);
        this.togglePinClick = this.togglePinClick.bind(this);
        this.showListComponent = this.showListComponent.bind(this);
        this.closeListCom = this.closeListCom.bind(this);
    }
    pinClick(e) {
        this.clickedPinId = e.name;

        this.setState({
            clickedPinId: e.name,
            pinClickVisible: !this.state.pinClickVisible
        });
    }
    togglePinClick() {
        this.setState({
            pinClickVisible: !this.state.pinClickVisible
        });
    }
    checkValue(e) {
        if (e.target.checked) {
            this.state.arrayOfCategory.push(e.target.value);
        } else {
            this.state.arrayOfCategory = this.state.arrayOfCategory.filter(
                (item) => {
                    return item != e.target.value;
                }
            );
        }
        this.props.dispatch(
            selectActionBycategory(
                this.state.arrayOfCategory,
                this.state.copyOfPinsArray
            )
        );
    }
    showListComponent() {
        this.setState({
            showListComponent: true
        });
    }
    closeListCom(e) {
        this.setState({
            showListComponent: false
        });
    }
    whatToDoOnLoad(id) {
        axios
            .get(`/getUser/${id}`)
            .then((response) => {
                this.setState({ user: response.data.user });
            })
            .catch((err) => {
                console.log(`error in pic getUser: ${err}`);
            });
        axios
            .get(`/getUserMarkers`, {
                params: { id: this.props.match.params.id }
            })
            .then((response) => {
                this.setState({
                    copyOfPinsArray: response.data.marker
                });
            })
            .catch((err) => {
                console.log(`error in pic getPinInfo: ${err}`);
            });

        this.props.dispatch(getUserPinInfo(this.props.match.params.id));
    }
    // componentWillReceiveProps(nextProps) {
    //     if (
    //         nextProps.history.location.pathname !== this.props.match.params.id
    //     ) {
    //         console.log("look its fire");
    //         this.whatToDoOnLoad(nextProps.match.params.id);
    //         return;
    //     }
    //     console.log(nextProps);
    //     console.log(this.props.match.params.id);
    //     return;
    // }
    componentDidMount() {
        this.whatToDoOnLoad(this.props.match.params.id);
    }

    render() {
        if (!this.state.user) {
            return <h1>no such user found</h1>;
        }
        const style = {
            backgroundSize: "contain",
            backgroundColor: "pink",
            borderRadius: "2px",
            width: "100%",
            height: "100%"
        };
        const categoryItems = function(color, text, variable, myFunction) {
            let str = "/pins/" + color + "Pin.png";
            return (
                <div className="categoryItem">
                    <input
                        type="checkbox"
                        id={variable}
                        name={variable}
                        value={variable}
                        className="check"
                        onClick={myFunction}
                    />
                    <img src={str} className="categoryItemPinIcon" />
                    <label htmlFor="museums" className="pinText">
                        {" "}
                        {text}{" "}
                    </label>
                </div>
            );
        };
        const userAvatar = this.state.user.profilepic || "/user.png";
        const profilePicStyle = {
            backgroundImage: `url(${userAvatar})`
        };
        // {this.state.user.profilepic && (
        //     <img src={this.state.user.profilepic} />
        // )}
        // {!this.state.user.profilepic && (
        //     <img src={"/user.png"} />
        // )}
        return (
            <React.Fragment>
                {this.state.showListComponent && (
                    <ListOfLocations
                        closeListCom={this.closeListCom}
                        id={this.props.id}
                        togglePinClick={this.togglePinClick}
                    />
                )}
                {this.state.pinClickVisible &&
                    this.state.clickedPinId && (
                        <PinClick
                            pinId={this.state.clickedPinId}
                            togglePinClick={this.togglePinClick}
                            id={this.props.id}
                        />
                    )}
                <div className="componentContainer">
                    <div className="otherUserContainer">
                        <div className="otherUserContainerLeft">
                            <div className="otherUserContainerLeftUp">
                                <div
                                    className="profilePicUser"
                                    style={profilePicStyle}
                                />
                                <div className="nameAndBioContainerUser">
                                    <div className="nameUser">
                                        {this.state.user.first}{" "}
                                        {this.state.user.last}
                                    </div>
                                    <div className="bioUser">
                                        {this.state.user.bio}
                                    </div>
                                </div>
                            </div>

                            <div className="otherUserContainerLeftMiddle">
                                <FriendButton
                                    otherId={this.props.match.params.id}
                                />
                            </div>
                            <div className="otherUserContainerLeftDown">
                                <div className="categoryListUser">
                                    <form id="myForm">
                                        {categoryItems(
                                            "blue",
                                            "museums",
                                            "museums",
                                            this.checkValue
                                        )}
                                        {categoryItems(
                                            "green",
                                            "Parks",
                                            "parks",
                                            this.checkValue
                                        )}
                                        {categoryItems(
                                            "yellow",
                                            "restaurants",
                                            "restaurants",
                                            this.checkValue
                                        )}
                                        {categoryItems(
                                            "pink",
                                            "bars",
                                            "bars",
                                            this.checkValue
                                        )}
                                        {categoryItems(
                                            "purple",
                                            "sightseeing",
                                            "sightseeing",
                                            this.checkValue
                                        )}
                                    </form>
                                </div>
                                <button
                                    className="pinAppButton"
                                    onClick={() => {
                                        this.showListComponent;
                                    }}
                                >
                                    {" "}
                                    List of Pins{" "}
                                </button>
                            </div>
                        </div>

                        <div className="otherUserContainerRight">
                            <div className="mapAreaUser">
                                <Map
                                    style={style}
                                    initialCenter={{
                                        // lat: this.props.lat,
                                        // lng: this.props.lng
                                        lat: 52.4918854,
                                        lng: 13.360088699999999
                                    }}
                                    zoom={14}
                                    google={this.props.google}
                                    onClick={this.mapClicked}
                                    onReady={this.fetchPlaces}
                                    visible={true}
                                >
                                    {this.state.myLat && (
                                        <Marker
                                            icon={{
                                                url: "/dot.png",
                                                anchor: new google.maps.Point(
                                                    0,
                                                    0
                                                ),
                                                scaledSize: new google.maps.Size(
                                                    10,
                                                    10
                                                )
                                            }}
                                        />
                                    )}
                                    {this.props.markersArray &&
                                        this.props.markersArray.map((item) => {
                                            return (
                                                <Marker
                                                    key={item.id}
                                                    onClick={this.pinClick}
                                                    name={item.id}
                                                    position={{
                                                        lat: item.lat,
                                                        lng: item.lng
                                                    }}
                                                    icon={{
                                                        url: item.color,
                                                        anchor: new google.maps.Point(
                                                            15,
                                                            35
                                                        ),
                                                        scaledSize: new google.maps.Size(
                                                            25,
                                                            35
                                                        )
                                                    }}
                                                />
                                            );
                                        })}
                                </Map>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = function(state) {
    return {
        markersArray: state.markersArray
        // pins: state.onlineUsers
    };
};

export default GoogleApiWrapper({
    apiKey: "AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo"
})(connect(mapStateToProps)(OtherProfilePage));

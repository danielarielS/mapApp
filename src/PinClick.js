import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "./axios";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import { deletePin, getAllPins } from "./actions";
import { insertPinInfo, updatePinInfo } from "./actions";
import { emit } from "./socket";

class PinClick extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lat: null,
            lng: null,
            holder: null,
            ready: null,
            removeButtonText: "X",
            editMode: false,
            url: "",
            deleteAlertIsVisible: false
        };
        this.setFile = this.setFile.bind(this);
        this.compileData = this.compileData.bind(this);
        this.toggleEditMode = this.toggleEditMode.bind(this);
        this.insertPinInfo = this.insertPinInfo.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.setFile = this.setFile.bind(this);
        this.deletePinAlert = this.deletePinAlert.bind(this);

        this.togglePinClick = this.togglePinClick.bind(this);
        this.exportPin = this.exportPin.bind(this);
    }
    exportPin() {
        const encryptedPinId = window.btoa(this.props.pinId);
        const pinUrl = `localhost:8080/pin/${encryptedPinId}`;
        console.log(pinUrl);
        this.setState({
            pinUrl
        });
    }
    togglePinClick() {
        this.props.togglePinClick();
    }
    componentDidMount() {
        // this is currently getting all pins. it needs to be readjusted to get the necessary ones!
        this.props.dispatch(getAllPins());
        axios
            .post("/PinClick", {
                pinId:
                    this.props.pinId ||
                    window.atob(this.props.match.params.encryptedPinId)
            })
            .then((response) => {
                console.log("response.data", response.data);
                this.setState({
                    title: response.data.pinInfo.title,
                    category: response.data.pinInfo.category,
                    url: response.data.pinInfo.url || "/pins/greyPin.png",
                    description: response.data.pinInfo.description,
                    created_at: response.data.pinInfo.created_at,
                    userId: response.data.pinInfo.user_id,
                    ready: true
                });
            })
            .catch((err) => {
                console.log(`error in PinClick componentDidMount: ${err}`);
            });
    }
    toggleEditMode(e) {
        console.log(this.props);
        if (!this.state.editMode) {
            // this.insertPinInfo(e)
            this.setState({
                editMode: true
            });
        } else {
            this.setState({
                editMode: false
            });
            // this.props.togglePinClick();
        }
    }
    setFile(e) {
        this.setState({
            file: e.target.files[0]
        });
    }
    handleChange(e) {
        this[e.target.name] = e.target.value;
    }
    setFile(e) {
        this.setState({
            file: e.target.files[0]
        });
    }
    checkValue(e) {
        this.category = e.target.name;

        this.setState({
            holder: e.target.name
        });
    }
    insertPinInfo(e) {
        // let pinColor = {
        //     museums: "/pins/bluePin.png",
        //     bars: "/pins/pinkPin.png",
        //     restaurants: "/pins/yellowPin.png",
        //     parks: "/pins/greenPin.png",
        //     sightseeing: "/pins/purplePin.png",
        //     general: "/pins/greyPin.png"
        // };
        // let cat;
        // if (!this.category) {
        //     cat = "general";
        // } else {
        //     cat = this.category;
        // }
        let pinInfo = {
            description: this.description,
            title: this.title,
            pinId: this.props.pinId
        };
        const formData = new FormData();
        formData.append("file", this.state.file);
        if (this.state.file) {
            this.props.dispatch(updatePinInfo({ formData, pinInfo }));
            this.toggleEditMode();
        } else {
            this.props.dispatch(updatePinInfo({ pinInfo }));
            this.toggleEditMode();
        }
    }
    compileData(e) {
        this.setState(
            {
                file: e.target.files[0]
            },
            () => {
                try {
                    let selectedImg = new FileReader();
                    selectedImg.readAsDataURL(this.state.file);
                    selectedImg.addEventListener("load", () => {
                        this.setState({ dataUrl: selectedImg.result });
                    });
                } catch (err) {
                    console.log(`error in compileData: ${err}`);
                }
            }
        );
    }
    deletePinAlert() {
        this.setState({
            deleteAlertIsVisible: true
        });

        if (this.state.deleteAlertIsVisible == true) {
            this.props.dispatch(deletePin(this.props.pinId));
            this.setState({
                deleteAlertIsVisible: false
            });
            this.props.togglePinClick();
        }
        // onClick={this.toggleEditMode}
    }
    // localhost:8080/pin/NjQ=

    render() {
        if (!this.state.ready && !this.props.markersArray.length > 0) {
            return <div>not ready</div>;
        } else {
            const shareButtons = () => {
                return (
                    <div className="colPinClick">
                        {/*<a
                            href="https://www.facebook.com/"
                            className="boxPinClick"
                            target="blank"
                        >
                            <img
                                src="/icons/facebook.png"
                                className="shareButtons"
                            />
                        </a>*/}
                        <button
                            id="sharePin"
                            className="pinAppButton"
                            onClick={() => {
                                emit("sharePin", this.props.pinId);
                            }}
                        >
                            share
                        </button>
                        <button
                            className="subtleButton"
                            onClick={this.exportPin}
                        >
                            export
                        </button>
                        {this.state.pinUrl && (
                            <div className="copyUrl">
                                Copy and send this URL to your friends:<p>
                                    {this.state.pinUrl}
                                </p>
                            </div>
                        )}
                    </div>
                );
            };
            const deleteAlert = () => {
                return (
                    <div className="blackVailDelete">
                        Are you sure you want to delete this pin?
                        <div className="inARow">
                            <button
                                onClick={() => {
                                    this.deletePinAlert();
                                }}
                            >
                                {" "}
                                yes{" "}
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({
                                        deleteAlertIsVisible: false
                                    });
                                }}
                            >
                                {" "}
                                no{" "}
                            </button>
                        </div>
                    </div>
                );
            };
            let currentPinInfo;

            if (this.props.pinId) {
                currentPinInfo = this.props.markersArray.filter((item) => {
                    return item.id == this.props.pinId;
                });
            } else if (this.props.flag) {
                currentPinInfo = this.props.markersArray.filter((item) => {
                    return (
                        item.id ==
                        window.atob(this.props.match.params.encryptedPinId)
                    );
                });
            } else {
                currentPinInfo = [this.state];
            }

            let imageUrl;

            if (currentPinInfo[0].url) {
                imageUrl = currentPinInfo[0].url;
            } else {
                imageUrl = "/pins/greyPin.png";
            }

            const edit = () => {
                if (this.state.userId == this.props.id) {
                    return (
                        <div className="pinEditSaveButtonArea box">
                            <h1
                                className="saveButton"
                                onClick={this.toggleEditMode}
                            >
                                {" "}
                                edit{" "}
                            </h1>
                        </div>
                    );
                } else {
                    return <div />;
                }
            };
            let bigPin;
            if (currentPinInfo[0]) {
                bigPin = currentPinInfo[0].color || "/pins/bigPin.png";
            } else {
                bigPin = "/pins/bigPin.png";
            }

            return (
                <React.Fragment>
                    <div className="pinClickContainer">
                        <div
                            className="blackVail"
                            onClick={this.props.togglePinClick}
                        />

                        <div className="fieldsContainer fieldsContainerPinClick">
                            <p
                                className="exitPinClick"
                                onClick={this.props.togglePinClick}
                            >
                                X
                            </p>
                            <div className="pinTitlePinClick">
                                <img src={bigPin} />
                                <h1 className="addPinTitle">
                                    {currentPinInfo[0].title || "clicked pin!"}
                                </h1>
                            </div>
                            <div className="secondRowPinClick">
                                <div className="boxPinClick">
                                    <Map
                                        style={{
                                            width: "100%",
                                            height: "100%"
                                        }}
                                        center={{
                                            lat: this.props.lat || 52.4918854,
                                            lng:
                                                this.props.lng ||
                                                13.360088699999999
                                        }}
                                        zoom={14}
                                        google={this.props.google}
                                        onReady={this.fetchPlaces}
                                        visible={true}
                                    >
                                        {this.props.markersArray &&
                                            currentPinInfo.map((item) => {
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
                                    {/* <img src="/map.png" /> */}
                                </div>

                                <div className="boxPinClick">
                                    {(this.state.editMode && (
                                        <div className="galleryItemsContainer">
                                            <input
                                                id="inputfile"
                                                className="inputfile"
                                                type="file"
                                                name="file"
                                                onChange={this.setFile}
                                                onChange={this.compileData}
                                                data-multiple-caption="{count} files selected"
                                                multiple
                                            />
                                            <label htmlFor="inputfile">
                                                {(this.state.dataUrl && (
                                                    <img
                                                        src={this.state.dataUrl}
                                                        className="uploadedImagePinclick"
                                                    />
                                                )) || (
                                                    <div className="cameraIconContainerPinClick">
                                                        <img
                                                            src="/pins/camera.png"
                                                            className="cameraIcon"
                                                        />
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    )) || (
                                        <div
                                            className="galleryItemsContainer"
                                            style={{
                                                backgroundImage: `url(${imageUrl})`
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                            {/* *******************THIRD ROW**********************/}
                            {(this.state.editMode && (
                                <div className="thirdRowPinClick">
                                    <div className="colPinClick">
                                        <div className="textFieldsPinClick">
                                            <textarea
                                                placeholder={
                                                    currentPinInfo[0].title ||
                                                    "Title"
                                                }
                                                className="titleTextareaPinClick"
                                                type="text"
                                                name="title"
                                                rows="1"
                                                onChange={this.handleChange}
                                            />
                                            <textarea
                                                placeholder={
                                                    currentPinInfo[0]
                                                        .description ||
                                                    "Description"
                                                }
                                                className="descriptionTextareaPinClick"
                                                type="text"
                                                name="description"
                                                onChange={this.handleChange}
                                                rows="1"
                                            />
                                        </div>
                                        <button
                                            className="subtleButton"
                                            onClick={this.deletePinAlert}
                                        >
                                            {" "}
                                            Unpin{" "}
                                        </button>
                                    </div>
                                    {shareButtons()}
                                </div>
                            )) || (
                                <div className="thirdRowPinClick">
                                    <div className="colPinClick ">
                                        <div>
                                            {currentPinInfo[0].title || "Title"}
                                        </div>
                                        <div>
                                            {currentPinInfo[0].description ||
                                                "Description"}
                                        </div>
                                    </div>
                                    {shareButtons()}
                                </div>
                            )}
                            {/* *************************FOURTH ROW********************* */}
                            {this.state.editMode && (
                                <div className="pinEditSaveButtonArea box">
                                    <div
                                        className="saveButton"
                                        onClick={this.insertPinInfo}
                                    >
                                        {" "}
                                        Save{" "}
                                    </div>
                                    <div
                                        className="saveButton"
                                        onClick={this.toggleEditMode}
                                    >
                                        {" "}
                                        Cancel{" "}
                                    </div>

                                    {this.state.deleteAlertIsVisible &&
                                        deleteAlert()}
                                </div>
                            )}{" "}
                            {!this.state.editMode && edit()}
                        </div>
                    </div>
                </React.Fragment>
            );
        }
    }
}
const mapStateToProps = function(state) {
    return {
        markersArray: state.markersArray,
        pinInfo: state.pinInfo,
        userName: state.userName
    };
};
export default GoogleApiWrapper({
    apiKey: "AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo"
})(connect(mapStateToProps)(PinClick));

import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "./axios";
import { deletePin } from "./actions";
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
            deleteAlertIsVisible: false
        };
        this.setFile = this.setFile.bind(this);
        this.compileData = this.compileData.bind(this);
        this.toggleEditMode = this.toggleEditMode.bind(this);
        this.insertPinInfo = this.insertPinInfo.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.setFile = this.setFile.bind(this);
        this.deletePinAlert = this.deletePinAlert.bind(this);
    }
    componentDidMount() {
        axios
            .post("/PinClick", { pinId: this.props.pinId })
            .then((response) => {
                console.log("in the mount of pinclick", response.data.pinInfo);
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
        // console.log("this.state.ready....",this.state);
    }
    toggleEditMode(e) {
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
        this.props.dispatch(updatePinInfo({ formData, pinInfo }));
        this.toggleEditMode();
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
        console.log(this.props.pinId);
        this.setState({
            deleteAlertIsVisible: true
        });

        if (this.state.deleteAlertIsVisible == true) {
            console.log("about to really delete pin");
            console.log(this.props.pinId);
            this.props.dispatch(deletePin(this.props.pinId));
            this.setState({
                deleteAlertIsVisible: false
            });
            this.props.togglePinClick();
        }
        // console.log("this.state.deleteAlertIsVisible",this.state.deleteAlertIsVisible);
        // onClick={this.toggleEditMode}
    }

    render() {
        if (!this.props.pinId) {
            return <div>not ready</div>;
        } else {
            console.log(this.props.pinId);
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
                            className="subtleButton"
                            onClick={() => {
                                console.log("share is clicked");
                                emit("sharePin", this.props.pinId);
                            }}
                        >
                            share
                        </button>
                    </div>
                );
            };
            console.log("2");
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
            console.log("3", this.props.markersArray);

            let currentPinInfo = this.props.markersArray.filter((item) => {
                console.log("in filter", item.id, this.props.pinId);
                return item.id == this.props.pinId;
            });
            console.log(currentPinInfo);
            let imageUrl;

            if (currentPinInfo[0].url) {
                imageUrl = currentPinInfo[0].url;
            } else {
                imageUrl = "/pins/greyPin.png";
            }

            console.log("4");
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
            console.log("this.props", this.props);

            return (
                <React.Fragment>
                    <div className="pinClickContainer">
                        <div
                            className="blackVail"
                            onClick={this.props.togglePinClick}
                        />
                        <p id="exit" onClick={this.props.togglePinClick}>
                            X
                        </p>

                        <div className="fieldsContainer fieldsContainerPinClick">
                            <div className="pinTitle box">
                                <h1>
                                    <img src="/pins/bigPin.png" />
                                    <span className="addPinTitle">
                                        {currentPinInfo[0].title ||
                                            "clicked pin"}
                                    </span>
                                </h1>
                            </div>
                            <div className="secondRowPinClick">
                                <div className="boxPinClick mapContainerPinClick">
                                    {/*<div className="overlayPin"> lalala </div>*/}
                                    <img src="/map.png" />
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
    console.log("in mapStateToProps", state);
    return {
        markersArray: state.markersArray,
        pinInfo: state.pinInfo,
        userName: state.userName
    };
};
export default connect(mapStateToProps)(PinClick);

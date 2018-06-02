import React from "react";
import ReactDOM from "react-dom";
import axios from "./axios";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { insertPinInfo } from "./actions";

class AddNewPin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lat: null,
            lng: null,
            holder: null
        };
        this.handleChange = this.handleChange.bind(this);
        this.setFile = this.setFile.bind(this);
        this.checkValue = this.checkValue.bind(this);
        this.insertPinInfos = this.insertPinInfos.bind(this);
        this.compileData = this.compileData.bind(this);
    }
    componentDidMount() {}
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
    insertPinInfos(e) {
        let pinColor = {
            museums: "/pins/bluePin.png",
            bars: "/pins/pinkPin.png",
            restaurants: "/pins/yellowPin.png",
            parks: "/pins/greenPin.png",
            sightseeing: "/pins/purplePin.png",
            general: "/pins/greyPin.png"
        };
        let cat;
        if (!this.category) {
            cat = "general";
        } else {
            cat = this.category;
        }
        let pinInfo = {
            description: this.description,
            title: this.title,
            category: cat,
            lat: this.props.lat,
            lng: this.props.lng,
            color: pinColor[cat]
        };
        const formData = new FormData();
        formData.append("file", this.state.file);

        this.props.dispatch(insertPinInfo({ formData, pinInfo }));
        this.props.closeAddNewPinComponent();
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
    render() {
        document.addEventListener("keydown", (e) => {
            if (e.keyCode == 27) {
                this.props.closeAddNewPinComponent();
            }
        });
        const category = (color, text, variable) => {
            let str = "/pins/" + color + "Pin.png";
            return (
                <div className="pinCategory">
                    <div className="pinCheckBox">
                        <img
                            src="/pins/checkbox.png"
                            className="icons"
                            name={variable}
                            onClick={this.checkValue}
                        />
                        <img src={str} className="pinIcon" />

                        {this.state.holder == variable && (
                            <img
                                src="/pins/pinkTick.png"
                                className="tickIcon"
                            />
                        )}
                    </div>
                    <div className="pinText">
                        <label>{text}</label>
                    </div>
                </div>
            );
        };
        // let currentPinInfo = this.props.markersArray.filter((item) => {
        //     return item.id == this.props.pinId;
        // });
        // let imageUrl;

        // if (currentPinInfo[0].url) {
        //     // imageUrl = currentPinInfo[0].url;
        // } else {
        //     imageUrl = "/pins/greyPin.png";
        // }

        return (
            <React.Fragment>
                <div className="newPinContainer">
                    <div
                        className="blackVail"
                        onClick={this.props.closeAddNewPinComponent}
                    />
                    <p id="exit" onClick={this.props.closeAddNewPinComponent}>
                        X
                    </p>
                    <div className="fieldsContainer fieldsContainerNewPin">
                        <div className="pinTitle box">
                            <img src="/pins/bigPin.png" />
                            <span className="addPinTitle pinTitle"> New Pin</span>
                        </div>
                        <div className="pinOptions">
                            <div className="pinMenu">
                                <form>
                                    {category("blue", "Museum", "museums")}
                                    {category("green", "Park", "parks")}
                                    {category(
                                        "yellow",
                                        "Restaurant",
                                        "restaurants"
                                    )}
                                    {category("pink", "Bar", "bars")}
                                    {category(
                                        "purple",
                                        "Sightseeing",
                                        "sightseeing"
                                    )}
                                </form>
                            </div>
                            <div className="addPinPicture">
                                {(!this.state.dataUrl && (
                                    <div className="cameraIconContainer">
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
                                            <img
                                                src="/pins/camera.png"
                                                className="cameraIcon"
                                            />
                                        </label>
                                    </div>
                                )) || (
                                    <div
                                        className="cameraIconContainer"
                                        style={{
                                            backgroundColor: "black"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                backgroundImage: `url(${
                                                    this.state.dataUrl
                                                })`,
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition:
                                                    "center center",
                                                backgroundSize: "contain",
                                                zIndex: "50"
                                            }}
                                        />
                                    </div>
                                )}

                                <textarea
                                    placeholder="Title"
                                    className="titleTextarea"
                                    type="text"
                                    name="title"
                                    rows="1"
                                    onChange={this.handleChange}
                                />
                                <textarea
                                    placeholder="Add Description"
                                    className="descriptionTextarea"
                                    type="text"
                                    name="description"
                                    onChange={this.handleChange}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="pinDescription box">
                            <h1
                                className="saveButton"
                                onClick={this.insertPinInfos}
                            >
                                Save
                            </h1>
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
    };
};

export default connect(mapStateToProps)(AddNewPin);

import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "./axios";
import PinClick from "./PinClick.js";
class ListOfLocations extends React.Component {
    constructor(props) {
        super(props);
        this.state = { clickedPinId: null };
        this.closeClickedPinList = this.closeClickedPinList.bind(this);
    }

    componentWillUnmount() {
        this.setState({
            clickedPinId: null
        });
    }
    closeClickedPinList() {
        this.setState({
            clickedPinId: null
        });
    }
    render() {
        console.log("this.props in list of locations", this.props);
        return (
            <React.Fragment>
                {this.state.clickedPinId && (
                    <PinClick
                        pinId={this.state.clickedPinId}
                        togglePinClick={this.closeClickedPinList}
                        id={this.props.id}
                    />
                )}
                <div className="listOfPinsContainer">
                    <div
                        className="blackVail"
                        onClick={this.props.closeListCom}
                    />
                    <div className="listOfLocationsHolder">
                        <div id="listSmallHolder">
                            <p id="listClose" onClick={this.props.closeListCom}>
                                X
                            </p>
                            <div className="pinAppStyle listTitle">My Pins</div>
                            {this.props.markersArray &&
                                this.props.markersArray.map((item) => {
                                    return (
                                        <div className="eachPin" key={item.id}>
                                            {/* <div className="listImgHolder">
                                                <img
                                                    src={item.url || "/user.png"}
                                                />
                                            </div> */}

                                            <img
                                                src={item.color}
                                                className="thePinImg"
                                                onClick={() => {
                                                    this.setState({
                                                        clickedPinId: item.id
                                                    });
                                                    this.props.closeListCom;
                                                }}
                                            />
                                            <span className="titleHolder">
                                                {item.title}
                                            </span>
                                            {/*<div className="flexHolder categoryHolder">
                                                {item.category}
                                            </div>*/}
                                            <span className="descHolder">
                                                {item.description}
                                            </span>
                                            <div className="dateHolder">
                                                <span>{item.created_at}</span>
                                            </div>
                                        </div>
                                    );
                                })}
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

export default connect(mapStateToProps)(ListOfLocations);

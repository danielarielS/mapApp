import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "./axios";
class ListOfLocations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <React.Fragment>
                <div className="listOfPinsContainer">
                    <div className="blackVail" onClick={this.props.closeListCom}/>
                    <div className="listOfLocationsHolder">
                        <div id="listSmallHolder">
                            <p id="listClose" onClick={this.props.closeListCom}>
                            X
                            </p>
                            <div className="pinAppStyle listTitle">
                                My Pins
                            </div>
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
                                                />


                                                {item.title}

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

"use strict";

// State component to hold state of the game

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DungeonCrawler = function (_React$Component) {
    _inherits(DungeonCrawler, _React$Component);

    function DungeonCrawler(props) {
        _classCallCheck(this, DungeonCrawler);

        var _this = _possibleConstructorReturn(this, (DungeonCrawler.__proto__ || Object.getPrototypeOf(DungeonCrawler)).call(this, props));

        _this.levelOne = new DC_Level(_this.props.levelWidth, _this.props.levelHeight, _this.props.potion, _this.props.weaponOne, _this.props.endPortal);
        return _this;
    }

    _createClass(DungeonCrawler, [{
        key: "render",
        value: function render() {
            var tiles = [];
            var tileRow = [];
            for (var i = 0; i < this.props.levelHeight; i++) {
                for (var j = 0; j < this.props.levelWidth; j++) {
                    tileRow.push(React.createElement(DungeonTile, { key: i + j,
                        tileBG: this.levelOne.getTile(j, i),
                        tileMarker: this.levelOne.getMarker(j, i) }));
                }
                tiles.push(React.createElement(DungeonTileRow, { tiles: tileRow, key: i }));
                tileRow = [];
            }
            return React.createElement(
                "div",
                { className: "dungeon-container" },
                tiles
            );
        }
    }]);

    return DungeonCrawler;
}(React.Component);

var DungeonTileRow = function DungeonTileRow(props) {
    return React.createElement(
        "div",
        { className: "dungeon-tile-row" },
        props.tiles
    );
};

var DungeonTile = function DungeonTile(props) {
    if (!!props.tileMarker) {
        console.log(props.tileMarker);
    }
    return React.createElement(
        "div",
        { className: props.tileBG === "wall" ? "dungeon-tile-wall" : "dungeon-tile-opening" },
        !!props.tileMarker ? React.createElement("img", { src: props.tileMarker.imgFile }) : ""
    );
};

DungeonCrawler.propTypes = {
    levelWidth: React.PropTypes.number,
    levelHeight: React.PropTypes.number,
    potion: React.PropTypes.shape({
        type: React.PropTypes.string,
        num: React.PropTypes.number,
        potionValue: React.PropTypes.number,
        imgFile: React.PropTypes.string
    }),
    endPortal: React.PropTypes.shape({
        type: React.PropTypes.string,
        imgFile: React.PropTypes.string
    }),
    weaponOne: React.PropTypes.shape({
        type: React.PropTypes.string,
        num: React.PropTypes.number,
        name: React.PropTypes.string,
        attack: React.PropTypes.number,
        imgFile: React.PropTypes.string
    })
};

DungeonCrawler.defaultProps = {
    levelWidth: 30,
    levelHeight: 30,
    potion: {
        type: "potion",
        num: 5, // num to add
        potionValue: 20, // health restore value
        imgFile: "images/potion_25x25.png"
    },
    endPortal: {
        type: "portal",
        imgFile: "images/portal_25x25.png"
    },
    weaponOne: {
        type: "weapon",
        num: 1,
        name: "Dagger",
        attack: 10,
        imgFile: "images/dagger_25x25.png"
    }
};

ReactDOM.render(React.createElement(DungeonCrawler, null), document.getElementById('dungeon'));
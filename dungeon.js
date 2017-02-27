"use strict";

// State component to hold state of the game

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DungeonCrawler = function (_React$Component) {
    _inherits(DungeonCrawler, _React$Component);

    function DungeonCrawler(props) {
        _classCallCheck(this, DungeonCrawler);

        // setup player
        var _this = _possibleConstructorReturn(this, (DungeonCrawler.__proto__ || Object.getPrototypeOf(DungeonCrawler)).call(this, props));

        _this.player = new DC_Human(_this.props.humanPlayer);
        // setup level
        _this.levelOne = new DC_Level(_this.props.levelWidth, _this.props.levelHeight, _this.props.endPortal);

        // add potions
        var i = _this.props.potion.num;
        while (i > 0) {
            _this.levelOne.addMarker(new DC_Potion(_this.props.potion));
            i--;
        }

        // add weapon(s)
        i = _this.props.weaponOne.num;
        while (i > 0) {
            _this.levelOne.addMarker(new DC_Weapon(_this.props.weaponOne));
            i--;
        }

        // add enemies
        i = _this.props.enemyOne.num;
        while (i > 0) {
            _this.levelOne.addMarker(new DC_Enemy(_this.props.enemyOne));
            i--;
        }

        // set state for the players current tile
        _this.state = {
            playerTile: _this.levelOne.addPlayer(_this.player)
        };

        // add listener for user input
        document.addEventListener('keydown', _this.movePlayer.bind(_this));
        return _this;
    }

    _createClass(DungeonCrawler, [{
        key: "movePlayer",
        value: function movePlayer(event) {
            var _levelOne, _levelOne2, _levelOne3, _levelOne4;

            switch (event.key) {
                case "ArrowUp":
                    this.setState({
                        playerTile: (_levelOne = this.levelOne).movePlayer.apply(_levelOne, ["up", this.player].concat(_toConsumableArray(this.state.playerTile)))
                    });
                    break;
                case "ArrowDown":
                    this.setState({
                        playerTile: (_levelOne2 = this.levelOne).movePlayer.apply(_levelOne2, ["down", this.player].concat(_toConsumableArray(this.state.playerTile)))
                    });
                    break;
                case "ArrowLeft":
                    this.setState({
                        playerTile: (_levelOne3 = this.levelOne).movePlayer.apply(_levelOne3, ["left", this.player].concat(_toConsumableArray(this.state.playerTile)))
                    });
                    break;
                case "ArrowRight":
                    this.setState({
                        playerTile: (_levelOne4 = this.levelOne).movePlayer.apply(_levelOne4, ["right", this.player].concat(_toConsumableArray(this.state.playerTile)))
                    });
                    break;
                // ignore if not a move command
                default:
                    break;
            }
        }
    }, {
        key: "render",
        value: function render() {
            var tiles = [];
            var tileRow = [];
            for (var _i = 0; _i < this.props.levelHeight; _i++) {
                for (var j = 0; j < this.props.levelWidth; j++) {
                    tileRow.push(React.createElement(DungeonTile, { key: _i + j,
                        tileBG: this.levelOne.getTile(j, _i),
                        tileMarker: this.levelOne.getMarker(j, _i) }));
                }
                tiles.push(React.createElement(DungeonTileRow, { tiles: tileRow, key: _i }));
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
    levelWidth: 25,
    levelHeight: 25,
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
        damage: 10,
        imgFile: "images/dagger_25x25.png"
    },
    enemyOne: {
        type: "enemy",
        num: 10,
        name: "Bug",
        atkDmg: 5,
        health: 20,
        imgFile: "images/bug_25x25.png"
    },
    humanPlayer: {
        type: "human",
        num: 1,
        name: "Hero",
        weapon: "Fists",
        atkDmg: 5,
        health: 100,
        imgFile: "images/player_25x25.png"
    }
};

ReactDOM.render(React.createElement(DungeonCrawler, null), document.getElementById('dungeon'));
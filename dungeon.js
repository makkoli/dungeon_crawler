"use strict";

// State component to hold state of the game

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DungeonCrawler = function (_React$Component) {
    _inherits(DungeonCrawler, _React$Component);

    // Create a DungeonCrawler component object
    // interpretation:
    //      levelNum: current level number
    //      level: current level being used for the game
    function DungeonCrawler(props) {
        _classCallCheck(this, DungeonCrawler);

        // setup level
        var _this = _possibleConstructorReturn(this, (DungeonCrawler.__proto__ || Object.getPrototypeOf(DungeonCrawler)).call(this, props));

        _this.levelNum = 1;
        _this.level = _this.setupLevel(_this.props.levelWidth, _this.props.levelHeight, _this.props.humanPlayer, _this.props.endPortal, _this.props.potions, _this.props.weapons[_this.levelNum], _this.props.enemies[_this.levelNum]);

        // set state for the header and players current tile position
        _this.state = {
            levelNum: _this.levelNum,
            level: _this.level,
            playerInfo: _this.level.getPlayerInfo(),
            collisionInfo: _this.level.getCollisionInfo(),
            playerTile: _this.level.getPlayerPosition()
        };

        // add listener for user input
        document.addEventListener('keydown', _this.movePlayer.bind(_this));
        return _this;
    }

    // initialize a level with given parameters
    // interpretation:
    //    width: width of level
    //    height: height of level
    //    player: params for player object
    //    endPortal: params for end portal object
    //    potion: params for potion object
    //    weapon: params for weapon object
    //    enemy: params for enemy object


    _createClass(DungeonCrawler, [{
        key: "setupLevel",
        value: function setupLevel(width, height, player, endPortal, potion, weapon, enemy) {
            var level = new DC_Level(width, height, player, endPortal);

            var i = potion.num;
            // add potions
            while (i > 0) {
                level.addMarker(new DC_Potion(potion));
                i--;
            }

            // add weapon(s)
            i = weapon.num;
            while (i > 0) {
                level.addMarker(new DC_Weapon(weapon));
                i--;
            }

            // add enemies
            i = enemy.num;
            while (i > 0) {
                level.addMarker(new DC_Enemy(enemy));
                i--;
            }

            return level;
        }

        // Move the player when he pushes an arrow key
        // given: down arrow, expected: player moves down a row

    }, {
        key: "movePlayer",
        value: function movePlayer(event) {
            switch (event.key) {
                case "ArrowUp":
                    this.movePlayerSetState("up");
                    break;
                case "ArrowDown":
                    this.movePlayerSetState("down");
                    break;
                case "ArrowLeft":
                    this.movePlayerSetState("left");
                    break;
                case "ArrowRight":
                    this.movePlayerSetState("right");
                    break;
                // ignore if not a move command
                default:
                    break;
            }
        }

        // Move a player in a given direction and update the components state
        // interpretation:
        //      direction: direction the player is to move

    }, {
        key: "movePlayerSetState",
        value: function movePlayerSetState(direction) {
            var _state$level;

            this.setState({
                playerTile: (_state$level = this.state.level).movePlayer.apply(_state$level, [direction].concat(_toConsumableArray(this.state.playerTile))),
                playerInfo: this.state.level.getPlayerInfo(),
                collisionInfo: this.state.level.getCollisionInfo()
            });
        }

        // Render the top level component

    }, {
        key: "render",
        value: function render() {
            var tiles = [];
            var tileRow = [];
            for (var i = 0; i < this.props.levelHeight; i++) {
                for (var j = 0; j < this.props.levelWidth; j++) {
                    tileRow.push(React.createElement(DungeonTile, { key: i + j,
                        tileBG: this.state.level.getTile(j, i),
                        tileMarker: this.state.level.getMarker(j, i) }));
                }
                tiles.push(React.createElement(DungeonTileRow, { tiles: tileRow, key: i }));
                tileRow = [];
            }
            return React.createElement(
                "div",
                null,
                React.createElement(DungeonHeader, { level: this.state.levelNum,
                    playerInfo: this.state.playerInfo,
                    collisionInfo: this.state.collisionInfo }),
                React.createElement(
                    "div",
                    { className: "dungeon-container" },
                    tiles
                )
            );
        }
    }]);

    return DungeonCrawler;
}(React.Component);

// Stateless component to render the header to display game info to player


var DungeonHeader = function DungeonHeader(props) {
    var collisionMessage = "";
    var enemyHealth = "";
    // set up messages for the header
    if (!!props.collisionInfo) {
        switch (props.collisionInfo.type) {
            case "potion":
                collisionMessage = props.collisionInfo.potionValue + " health restored";
                break;
            case "weapon":
                collisionMessage = props.collisionInfo.name + " picked up";
                break;
            case "enemy":
                if (props.collisionInfo.defeated) {
                    collisionMessage = props.collisionInfo.name + " defeated";
                } else {
                    collisionMessage = props.collisionInfo.name;
                    enemyHealth = props.collisionInfo.health + "/" + props.collisionInfo.maxHealth;
                }
            default:
                break;
        }
    }

    return React.createElement(
        "div",
        { className: "dungeon-header" },
        React.createElement(
            "h1",
            null,
            "Level ",
            props.level
        ),
        React.createElement(
            "div",
            { className: "dungeon-player" },
            React.createElement(
                "h4",
                null,
                props.playerInfo.name,
                "(",
                React.createElement(
                    "span",
                    { style: { color: "darkseagreen" } },
                    props.playerInfo.level
                ),
                ") - ",
                React.createElement(
                    "span",
                    { style: { color: "gold" } },
                    props.playerInfo.currentXP,
                    "/",
                    props.playerInfo.XPToLevel
                ),
                " XP"
            ),
            React.createElement(
                "h4",
                null,
                React.createElement(
                    "span",
                    { style: { color: "aqua" } },
                    props.playerInfo.health
                ),
                " Health"
            ),
            React.createElement(
                "h4",
                null,
                props.playerInfo.weapon,
                " (",
                React.createElement(
                    "span",
                    { style: { color: "red" } },
                    props.playerInfo.atkDmg
                ),
                " + ",
                React.createElement(
                    "span",
                    { style: { color: "red" } },
                    props.playerInfo.levelDmgModifier
                ),
                ")"
            )
        ),
        React.createElement(
            "div",
            { className: "dungeon-info" },
            React.createElement(
                "h4",
                null,
                collisionMessage
            ),
            React.createElement(
                "h4",
                null,
                React.createElement(
                    "span",
                    { style: { color: "aqua" } },
                    enemyHealth
                ),
                enemyHealth ? " Health" : ""
            )
        )
    );
};

// Presentation component for a row of tiles on the level
// given: an array of tiles
// expected: each tile laid out next to each other
var DungeonTileRow = function DungeonTileRow(props) {
    return React.createElement(
        "div",
        { className: "dungeon-tile-row" },
        props.tiles
    );
};

// Presentation component that represents a single tile of the level
// given: a tile with a marker on it
// expected: a tile with the marker image on top of it
var DungeonTile = function DungeonTile(props) {
    return React.createElement(
        "div",
        { className: props.tileBG === "wall" ? "dungeon-tile-wall" : "dungeon-tile-opening" },
        !!props.tileMarker ? React.createElement("img", { src: props.tileMarker.imgFile }) : ""
    );
};

// Types of default properties to pass in
DungeonCrawler.propTypes = {
    levelWidth: React.PropTypes.number,
    levelHeight: React.PropTypes.number,
    potions: React.PropTypes.shape({
        type: React.PropTypes.string,
        num: React.PropTypes.number,
        potionValue: React.PropTypes.number,
        imgFile: React.PropTypes.string
    }),
    endPortal: React.PropTypes.shape({
        type: React.PropTypes.string,
        imgFile: React.PropTypes.string
    }),
    weapons: React.PropTypes.objectOf(React.PropTypes.object),
    enemies: React.PropTypes.objectOf(React.PropTypes.object),
    humanPlayer: React.PropTypes.shape({
        type: React.PropTypes.string,
        num: React.PropTypes.number,
        name: React.PropTypes.string,
        weapon: React.PropTypes.string,
        atkDmg: React.PropTypes.number,
        levelDmgModifier: React.PropTypes.number,
        health: React.PropTypes.number,
        XPToLevel: React.PropTypes.number,
        imgFile: React.PropTypes.string
    })
};

// Default properties
// Set up size of the level
// Set up each level with potions/weapons/enemies
// Set up human player params
DungeonCrawler.defaultProps = {
    levelWidth: 20,
    levelHeight: 15,
    potions: {
        type: "potion",
        num: 5, // num to add
        potionValue: 20, // health restore value
        imgFile: "images/potion_25x25.png"
    },
    endPortal: {
        type: "portal",
        imgFile: "images/portal_25x25.png"
    },
    weapons: {
        1: {
            type: "weapon",
            num: 1,
            name: "Dagger",
            damage: 10,
            imgFile: "images/dagger_25x25.png"
        },
        2: {
            type: "weapon",
            num: 1,
            name: "Spear",
            damage: 20,
            imgFile: "images/spear_25x25.png"
        },
        3: {
            type: "weapon",
            num: 1,
            name: "Axe",
            damage: 30,
            imgFile: "images/axe_25x25.png"
        }
    },
    enemies: {
        1: {
            type: "enemy",
            num: 10,
            name: "Bug",
            atkDmg: 5,
            atkDmgModifier: 5,
            health: 20,
            XPValue: 10,
            imgFile: "images/bug_25x25.png"
        },
        2: {
            type: "enemy",
            num: 10,
            name: "Zombie",
            atkDmg: 10,
            atkDmgModifier: 5,
            health: 40,
            XPValue: 20,
            imgFile: "images/zombie_25x25.png"
        },
        3: {
            type: "enemy",
            num: 10,
            name: "Skeleton",
            atkDmg: 15,
            atkDmgModifier: 5,
            health: 70,
            XPValue: 40,
            imgFile: "images/skeleton_25x25.png"
        }
    },
    humanPlayer: {
        type: "human",
        num: 1,
        name: "Hero",
        weapon: "Fists",
        atkDmg: 5,
        levelDmgModifier: 2,
        health: 100,
        XPToLevel: 75,
        imgFile: "images/player_25x25.png"
    }
};

ReactDOM.render(React.createElement(DungeonCrawler, null), document.getElementById('dungeon'));
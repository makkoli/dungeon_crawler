"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WALL_CHAR = '#';
var OPENING_CHAR = ' ';
var START_POS_X = 0;
var START_POS_Y = 0;

// A level generator
// The level is x tiles wide and y tiles high
// Returns a solvable level that is populated with enemies, weapons, and potions
// Start position will always be top left and end position will be bottom right

var DC_Level = function () {
    // DC_Level constructor creates an object that manages a randomly generated
    // level. Also, takes and adds markers for potions, weapon(s), enemies, the
    // human player, and the end portal for the level.
    //  interpretation:
    //      level: level holds the randomly generated maze with markers on it
    //      player: holds the human player state
    //      collisionInfo: info about the last collision between the player
    //                     and a marker
    function DC_Level() {
        var tilesWide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
        var tilesHigh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30;
        var humanPlayer = arguments[2];
        var endPortal = arguments[3];

        _classCallCheck(this, DC_Level);

        this.level = new DC_Maze(tilesWide, tilesHigh);
        this.level.addEndCell(this.level.maze, new DC_Portal(endPortal));
        this.player = new DC_Human(humanPlayer);
        this.player.position = this.addPlayer(this.player);
        this.collisionInfo = {
            type: null
        };
    }

    // Object -> null
    // Adds a single marker to a open tile on the level
    // given: an object to be placed on a tile
    // expected: the level to have the object placed randomly on an open tile


    _createClass(DC_Level, [{
        key: 'addMarker',
        value: function addMarker(markerObj) {
            this.level.addMarker(this.level.maze, this.level.openings, markerObj);
        }

        // Object -> Number
        // Places the human player sprite on the level
        // given: an object representing the player
        // expected: the start tile position the player sprite is on in [x,y] format

    }, {
        key: 'addPlayer',
        value: function addPlayer(playerObj) {
            this.level.addMarker(this.level.maze, this.level.openings, playerObj, START_POS_X, START_POS_Y);

            return [START_POS_X, START_POS_Y];
        }

        // null -> Number
        // Returns the current position of the human player on the level
        // given: a player in position 5 on the level
        // expected: 5

    }, {
        key: 'getPlayerPosition',
        value: function getPlayerPosition() {
            return this.player.position;
        }

        // null -> Object
        // Returns the info about the human player
        // given: a player on the level with name Hero, weapon Fists, health: 100
        // and attack 5
        // expected: {name: "Hero", weapon: "Fists", health: 100, attack: 5}

    }, {
        key: 'getPlayerInfo',
        value: function getPlayerInfo() {
            return this.player.getInfo();
        }

        // null -> Object
        // Returns details about the last move made that caused a collision
        // given: a movement where no collision occurs
        // expected: { type: null }

    }, {
        key: 'getCollisionInfo',
        value: function getCollisionInfo() {
            return this.collisionInfo;
        }

        // String Object Number Number -> [Number]
        // Moves the player in one of four directions
        // given: direction to move the player
        //        player object to move
        //        x coordinate of the player object
        //        y coordinate of the player object
        // expected: [x, y] coordinate array signifying the new location of the
        //           player object

    }, {
        key: 'movePlayer',
        value: function movePlayer(direction, x, y) {
            switch (direction) {
                case "up":
                    return this.handlePlayerMoveFrom({ x: x, y: y }, { x: x, y: y - 1 });
                case "down":
                    return this.handlePlayerMoveFrom({ x: x, y: y }, { x: x, y: y + 1 });
                case "right":
                    return this.handlePlayerMoveFrom({ x: x, y: y }, { x: x + 1, y: y });
                case "left":
                    return this.handlePlayerMoveFrom({ x: x, y: y }, { x: x - 1, y: y });
                default:
                    return [x, y];
            }
        }

        // { Number, Number } { Number, Number } -> [Number]
        // Handles the collision logic of the player moving to a new tile
        // given: moving up to a new position from x,y coordinate
        // expected: [x, y + 1]

    }, {
        key: 'handlePlayerMoveFrom',
        value: function handlePlayerMoveFrom(oldPosn, newPosn) {
            if (this.checkForCollision(newPosn.x, newPosn.y)) {
                if (this.handleCollision(this.player, oldPosn, newPosn)) {
                    return [newPosn.x, newPosn.y];
                }
                return [oldPosn.x, oldPosn.y];
            }
            this.level.updateMarker(this.player, oldPosn, newPosn);
            this.collisionInfo = {
                type: null
            };
            return [newPosn.x, newPosn.y];
        }

        // Number Number -> Boolean
        // Checks if there is a marker or wall at the x, y coordinate
        // given: x, y coordinates
        // expected: true if marker/wall exists, false otherwise

    }, {
        key: 'checkForCollision',
        value: function checkForCollision(x, y) {
            return this.level.getTile(x, y) === "wall" || !!this.level.getMarker(x, y);
        }

        // Object Number Number -> [Number]
        // Handles collision resolution between the player object and a
        // marker/wall on the map
        // given: playerObj representing the player
        //        x, y is the new x, y position of the player and there is a marker
        //        on the x,y position
        // expected: true if the player can move after collision, false otherwise

    }, {
        key: 'handleCollision',
        value: function handleCollision(playerObj, oldPosn, newPosn) {
            // if wall, just return current location
            if (this.level.getTile(oldPosn.x, oldPosn.y) === "wall") {
                this.collisionInfo = {
                    type: null
                };
                return false;
            }

            var markerDesc = this.level.getMarker(newPosn.x, newPosn.y);
            switch (markerDesc.type) {
                // potion heal marker
                case "potion":
                    playerObj.heal(markerDesc.potionValue);
                    this.level.updateMarker(playerObj, oldPosn, newPosn);
                    this.collisionInfo = {
                        type: "potion",
                        potionValue: markerDesc.potionValue
                    };
                    return true;
                // upgrade weapon marker
                case "weapon":
                    playerObj.updateWeapon(markerDesc.name, markerDesc.damage);
                    this.level.updateMarker(playerObj, oldPosn, newPosn);
                    this.collisionInfo = {
                        type: "weapon",
                        name: markerDesc.name,
                        damage: markerDesc.damage
                    };
                    return true;
                // fight enemy marker
                case "enemy":
                    markerDesc.takeDamage(playerObj.performAttack());
                    playerObj.takeDamage(markerDesc.performAttack());
                    if (markerDesc.health <= 0) {
                        this.level.updateMarker(playerObj, oldPosn, newPosn);
                        playerObj.addXP(markerDesc.XPValue);
                        this.collisionInfo = {
                            type: "enemy",
                            defeated: true,
                            name: markerDesc.name
                        };
                        return true;
                    }
                    this.collisionInfo = {
                        type: "enemy",
                        defeated: false,
                        name: markerDesc.name,
                        health: markerDesc.health,
                        maxHealth: markerDesc.maxHealth
                    };
                    return false;
                case "portal":
                    this.collisionInfo = {
                        type: "portal"
                    };
                    return true;
                // unknown marker, cannot deal
                default:
                    this.collisionInfo = {
                        type: null
                    };
                    return false;
            }
        }

        // null -> Number
        // Returns the number of tiles wide the level is
        // given: a level 5 tiles wide, expected: 5

    }, {
        key: 'getLevelWidth',
        value: function getLevelWidth() {
            return this.level.tilesWide;
        }

        // null -> Number
        // Returns the number of tiles high the level is
        // given: a level 5 tiles high, expected: 5

    }, {
        key: 'getLevelHeight',
        value: function getLevelHeight() {
            return this.level.tilesHigh;
        }

        // Number Number -> String
        // Returns the current tile's string
        // given: x and y that point to a wall marker, expected: 'wall' or 'opening'

    }, {
        key: 'getTile',
        value: function getTile(x, y) {
            return this.level.getTile(x, y);
        }

        // Number Number -> Object
        // Returns the object marker at a location on the maze
        // given: x and y that points to a marker object, expected: object marker

    }, {
        key: 'getMarker',
        value: function getMarker(x, y) {
            return this.level.getMarker(x, y);
        }
    }]);

    return DC_Level;
}();

// A DC_Maze is a structure that holds the maze and any markers on it
// The maze has totalTiles = tileWide * tileHeight
// Also holds all markers on the maze for items, enemies, and end


var DC_Maze = function () {
    // DC_Maze constructor creates an object that manages a randomly generated
    // maze.
    //  interpretation:
    //      tilesWide: tile width of the maze
    //      tilesHigh: tile height of the maze
    //      openings: tiles that are do not have a wall on them
    //      maze: array that holds the maze
    function DC_Maze() {
        var tilesWide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
        var tilesHigh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30;

        _classCallCheck(this, DC_Maze);

        this.tilesWide = tilesWide;
        this.tilesHigh = tilesHigh;
        this.openings = [];
        this.maze = this.generateBlankMaze(tilesWide, tilesHigh);
        this.maze = this.generateMaze(this.maze, tilesWide, START_POS_X + START_POS_Y, [], this.openings);
    }

    // Number Number -> [String]
    // Generates a blank maze (filled with walls)
    // given: width of the level in tiles
    //        height of the level in tiles
    // expected: an array with row length tilesWide and column
    //           length tilesHigh and all values filled with WALL_CHAR


    _createClass(DC_Maze, [{
        key: 'generateBlankMaze',
        value: function generateBlankMaze(tilesWide, tilesHigh) {
            return new Array(tilesWide * tilesHigh).fill(WALL_CHAR);
        }

        // [String] Number Number -> [String]
        // Generates a maze using randomized prim's algorithm
        // given: an array of nxn size with every character = "#",
        //        the width of the level in tiles
        //        start position in the grid
        //        an array of walls to be checked
        //        current openings in the maze
        // expected: an array of width * height size with a solvable maze

    }, {
        key: 'generateMaze',
        value: function generateMaze(grid, width, cellPos, walls, openings) {
            var nextCell = void 0; // next cell to be checked
            // remove the wall at position only if there is one or less open
            // neighbor cells
            if (this.checkOpenNeighbors(grid, width, cellPos) <= 1 && openings.indexOf(cellPos) === -1) {
                grid[cellPos] = OPENING_CHAR;
                // make sure we don't add the initial start position to list of
                // available openings
                if (START_POS_X + START_POS_Y !== cellPos) {
                    openings.push(cellPos);
                }
            }
            // else, go back and try another cell
            else {
                    return;
                }

            // add walls around new opening
            walls = walls.concat(this.addWallNeighbors(grid, width, cellPos, walls));

            // get a wall cell off the list and continue generating the maze
            while (walls.length > 0) {
                nextCell = this.getNextCell(walls);
                this.generateMaze(grid, width, nextCell, walls, openings);
            }

            return grid;
        }

        // [String] Number Number [Number] -> [Number]
        // Gets all the wall cell positions directly next to a cell
        // given: array of size width*height
        //        the width of the level in tiles
        //        cell position in the grid
        //        wall character
        // expected: an array of wall cell positions around the cell position given

    }, {
        key: 'addWallNeighbors',
        value: function addWallNeighbors(grid, width, cellPos) {
            var walls = [];
            // Check right
            if (cellPos + 1 < grid.length && (cellPos + 1) % width > 0 && grid[cellPos + 1] === WALL_CHAR && walls.indexOf(cellPos + 1) === -1) {
                walls.push(cellPos + 1);
            }
            // Check left
            if (cellPos - 1 >= 0 && cellPos % width > 0 && grid[cellPos - 1] === WALL_CHAR && walls.indexOf(cellPos - 1) === -1) {
                walls.push(cellPos - 1);
            }
            // Check above
            if (cellPos - width >= 0 && grid[cellPos - width] === WALL_CHAR && walls.indexOf(cellPos - width) === -1) {
                walls.push(cellPos - width);
            }
            // Check below
            if (cellPos + width < grid.length && grid[cellPos + width] === WALL_CHAR && walls.indexOf(cellPos + width) === -1) {
                walls.push(cellPos + width);
            }

            return walls;
        }

        // [String] Number Number -> Number
        // Checks the current cell if there is more than one open cell next to it
        // given: array of size width*height
        //        the width of the level in tiles
        //        a cell position with two openings next to it
        // expected: 2

    }, {
        key: 'checkOpenNeighbors',
        value: function checkOpenNeighbors(grid, width, cellPos) {
            // we know there is at least one open cell next to the wall
            var numOpenCells = 0;

            // Check right
            if (cellPos + 1 < grid.length && (cellPos + 1) % width > 0 && grid[cellPos + 1] === OPENING_CHAR) {
                numOpenCells++;
            }
            // Check left
            if (cellPos - 1 >= 0 && cellPos % width > 0 && grid[cellPos - 1] === OPENING_CHAR) {
                numOpenCells++;
            }
            // Check above
            if (cellPos - width >= 0 && grid[cellPos - width] === OPENING_CHAR) {
                numOpenCells++;
            }
            // Check below
            if (cellPos + width < grid.length && grid[cellPos + width] === OPENING_CHAR) {
                numOpenCells++;
            }

            return numOpenCells;
        }

        // [Number] -> Number
        // Gets a wall randomly from the list of wall cells
        // that still need to be checked
        // given: an array of cells that are wall positions
        // expected: a random wall position from the array

    }, {
        key: 'getNextCell',
        value: function getNextCell(walls) {
            if (walls.length === 1) {
                return walls.pop();
            } else {
                return walls.splice(Math.floor(walls.length * Math.random()), 1)[0];
            }
        }

        // [String] Number -> [String]
        // Sets the end(winning) position on the level
        // given: an array that is a solvable maze with the last position in the
        //      bottom right to be maze.length - 1
        // expected: maze.length - 1

    }, {
        key: 'addEndCell',
        value: function addEndCell(level, portal) {
            for (var i = level.length - 1; i > 0; i--) {
                if (level[i] === OPENING_CHAR) {
                    level[i] = portal;
                    return i;
                }
            }
        }

        // [String] String Number -> null
        // Populates the maze randomly with one user defined marker to signify an
        // item, weapon, enemy, etc
        // given: an array that is a solvable maze
        //        openings that can be traversed in the maze
        //        actual item object to be placed on the maze
        //        optional user defined marker position
        // expected: a marker put randomly on one of the open tiles

    }, {
        key: 'addMarker',
        value: function addMarker(level, openings, itemObj) {
            var startPosX = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
            var startPosY = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : -1;

            var startPos = startPosX + startPosY;
            if (startPos >= 0 && openings.indexOf(startPos) === -1 && startPos < this.maze.length) {
                level[startPos] = itemObj;
            } else {
                var randomCell = Math.floor(Math.random() * openings.length);
                var addMarkerPosn = openings.splice(randomCell, 1)[0];
                level[addMarkerPosn] = itemObj;
            }
        }

        // Number Number -> String
        // Retrieves the tile at a position
        // Only returns if the tile is traversable or not
        // given: x and y with a WALL_CHAR at the location
        // expected: 'wall'

    }, {
        key: 'getTile',
        value: function getTile(x, y) {
            // subtract one from tilesWide and tilesHigh to account for zero based
            // indexing
            if (x < 0 || y < 0 || x > this.tilesWide - 1 || y > this.tilesHigh - 1 || this.maze[x + y * this.tilesWide] === WALL_CHAR) {
                return "wall";
            } else {
                return "opening";
            }
        }

        // Number Number -> Boolean
        // Retrieves an object marker at a tile, false if does not exist
        // given: x and y with an object marker there
        // expected: an object
        // given: x and y with no object marker there
        // expected: false

    }, {
        key: 'getMarker',
        value: function getMarker(x, y) {
            if (_typeof(this.maze[x + y * this.tilesWide]) === 'object') {
                return this.maze[x + y * this.tilesWide];
            } else {
                return false;
            }
        }

        // Object [Number] [Number] -> Boolean
        // Sets a marker to a new x,y coordinate and removes it from the old x,y
        // coordinate
        // given: markerObj signifying the marker object to move
        //        oldPosn being an x,y coordinate of the old marker position
        //        newPosn being an x,y coordinate of the markers new position
        // expected: true if marker is moved, false otherwise

    }, {
        key: 'updateMarker',
        value: function updateMarker(markerObj, oldPosn, newPosn) {
            if (this.getTile(newPosn.x, newPosn.y) === "wall") {
                return false;
            }
            this.maze[oldPosn.x + oldPosn.y * this.tilesWide] = OPENING_CHAR;
            this.openings.push(oldPosn.x + oldPosn.y * this.tilesWide);
            this.maze[newPosn.x + newPosn.y * this.tilesWide] = markerObj;
            return true;
        }
    }]);

    return DC_Maze;
}();

// Parent prototype for players


var DC_Player = function () {
    // DC_Player constructor creates an object that is a parent object for players
    // on the level (human, AI).
    //  interpretation:
    //      type: type of player
    //      health: how much health the player has
    //      attack: how much attack damage the player has
    //      name: the name of the player
    //      imageFile: where to find the image to display the player
    function DC_Player(type, atkDmg, name, health, imgFile) {
        _classCallCheck(this, DC_Player);

        this.type = type;
        this.health = health;
        this.attack = atkDmg;
        this.name = name;
        this.imgFile = imgFile;
    }

    // Number -> Number
    // The player object takes damage
    // given: a player object with 100 health takes 20 damage
    // expected: 80


    _createClass(DC_Player, [{
        key: 'takeDamage',
        value: function takeDamage(damage) {
            this.health -= damage;
            return this.health;
        }
    }]);

    return DC_Player;
}();

// DC_Enemy is a class that holds the data and methods of an enemy in the level


var DC_Enemy = function (_DC_Player) {
    _inherits(DC_Enemy, _DC_Player);

    // DC_Enemy constructor creates an enemy object to place on the level
    //  interpretation:
    //      atkDmgModifier: modifier that the damage of an attack randomly
    //      maxHealth: max amount of health the enemy has
    //      XPValue: how much xp the enemy gives upon defeat
    function DC_Enemy(_ref) {
        var type = _ref.type,
            atkDmg = _ref.atkDmg,
            name = _ref.name,
            health = _ref.health,
            _ref$atkDmgModifier = _ref.atkDmgModifier,
            atkDmgModifier = _ref$atkDmgModifier === undefined ? 0 : _ref$atkDmgModifier,
            XPValue = _ref.XPValue,
            imgFile = _ref.imgFile;

        _classCallCheck(this, DC_Enemy);

        var _this = _possibleConstructorReturn(this, (DC_Enemy.__proto__ || Object.getPrototypeOf(DC_Enemy)).call(this, type, atkDmg, name, health, imgFile));

        _this.attackModifier = atkDmgModifier;
        _this.maxHealth = health;
        _this.XPValue = XPValue;
        return _this;
    }

    // null -> Number
    // Returns the damage caused by an attack of the enemy object
    // given: an enemy object with 5 attack and a 5 attack damage modifier
    // expected: 5-9


    _createClass(DC_Enemy, [{
        key: 'performAttack',
        value: function performAttack() {
            return this.attack + Math.floor(this.attackModifier * Math.random());
        }
    }]);

    return DC_Enemy;
}(DC_Player);

// DC_Human is a class that holds the data and methods of the human player in
// the level


var DC_Human = function (_DC_Player2) {
    _inherits(DC_Human, _DC_Player2);

    // DC_Human constructor creates a human object to place on the level
    // interpretation:
    //      weapon: current weapon of human player
    //      position: current position on the level of the player
    //      level: current level of the player
    //      levelDmgModifier: how much extra damage the player has from
    //                        their level
    //      currentXP: current amount of experience the player has
    //      XPToLevel: how much experience required to level
    function DC_Human(_ref2) {
        var type = _ref2.type,
            atkDmg = _ref2.atkDmg,
            name = _ref2.name,
            weapon = _ref2.weapon,
            health = _ref2.health,
            _ref2$levelDmgModifie = _ref2.levelDmgModifier,
            levelDmgModifier = _ref2$levelDmgModifie === undefined ? 2 : _ref2$levelDmgModifie,
            _ref2$XPToLevel = _ref2.XPToLevel,
            XPToLevel = _ref2$XPToLevel === undefined ? 75 : _ref2$XPToLevel,
            imgFile = _ref2.imgFile;

        _classCallCheck(this, DC_Human);

        var _this2 = _possibleConstructorReturn(this, (DC_Human.__proto__ || Object.getPrototypeOf(DC_Human)).call(this, type, atkDmg, name, health, imgFile));

        _this2.weapon = weapon;
        _this2.position = 0;
        _this2.level = 1;
        _this2.levelDmgModifier = levelDmgModifier;
        _this2.currentXP = 0;
        _this2.XPToLevel = XPToLevel;
        return _this2;
    }

    // Number -> Number
    // Heals the human player by healthRestore amount
    // given: a health restore amount of 20 and a player with 80 health
    // expected: 100


    _createClass(DC_Human, [{
        key: 'heal',
        value: function heal(healthRestore) {
            if (this.health + healthRestore > 100) {
                this.health = 100;
            } else {
                this.health += healthRestore;
            }
            return this.health;
        }

        // String Number -> String
        // Updates the human players weapon and attack damage
        // given: a weapon by name of sword and damage 20
        // expected: human player has a sword weapon with 20 damage

    }, {
        key: 'updateWeapon',
        value: function updateWeapon(newWeapon, newDamage) {
            this.weapon = newWeapon;
            this.attack = newDamage;
            return this.weapon;
        }

        // null -> Number
        // Returns the damage caused by an attack of the player
        // given: a player that has 5 attack
        // expected: 5

    }, {
        key: 'performAttack',
        value: function performAttack() {
            return this.attack + this.levelDmgModifier;
        }

        // Number -> Number
        // Adds XP to a player and checks if the player should level
        // If the player levels, the XP required to level doubles for the next level
        // and the level damage modifier is also doubled
        // given: a player with 10 experience and 20 experience just gained
        // expected: 30

    }, {
        key: 'addXP',
        value: function addXP(xp) {
            this.currentXP += xp;
            if (this.currentXP >= this.XPToLevel) {
                this.level++;
                this.currentXP -= this.XPToLevel;
                this.XPToLevel += this.XPToLevel;
                this.levelDmgModifier += this.levelDmgModifier;
            }
            return this.currentXP;
        }

        // null -> Object
        // Retrieves all the properties of the human player object
        // given: a human with type, name, weapon, atkDmg, health
        // expected: {type: type, name: name, weapon: weapon, ....}

    }, {
        key: 'getInfo',
        value: function getInfo() {
            return {
                type: this.type,
                name: this.name,
                weapon: this.weapon,
                health: this.health,
                atkDmg: this.attack,
                level: this.level,
                levelDmgModifier: this.levelDmgModifier,
                currentXP: this.currentXP,
                XPToLevel: this.XPToLevel
            };
        }
    }]);

    return DC_Human;
}(DC_Player);

// Parent prototype for items(weapons, potions, etc)


var DC_Item =
// DC_Item constructor creates an object that is the parent for items on
// the maze
//  interpretation:
//      type: type of item
//      imgFile: where to find the image file to display on the maze
function DC_Item(type, imgFile) {
    _classCallCheck(this, DC_Item);

    this.type = type;
    this.imgFile = imgFile;
};

// DC_Potion is a class holding a potion that populates the level
// Holds the health restored of a potion consumed by the player and
// image file to display the potion


var DC_Potion = function (_DC_Item) {
    _inherits(DC_Potion, _DC_Item);

    // DC_Potion constructor creates a potion object
    //  interpretation:
    //      potionValue: restoration value of the potion
    function DC_Potion(_ref3) {
        var type = _ref3.type,
            _ref3$potionValue = _ref3.potionValue,
            potionValue = _ref3$potionValue === undefined ? 20 : _ref3$potionValue,
            imgFile = _ref3.imgFile;

        _classCallCheck(this, DC_Potion);

        var _this3 = _possibleConstructorReturn(this, (DC_Potion.__proto__ || Object.getPrototypeOf(DC_Potion)).call(this, type, imgFile));

        _this3.potionValue = potionValue;
        return _this3;
    }

    return DC_Potion;
}(DC_Item);

// DC_Weapon is a class holding a weapon that populates the level
// Holds the weapon attack damage and image file to display the weapon


var DC_Weapon = function (_DC_Item2) {
    _inherits(DC_Weapon, _DC_Item2);

    // DC_Weapon constructor creates a weapon object
    //  interpretation:
    //      name: name of the weapon
    //      attack: attack damage of the weapon
    function DC_Weapon(_ref4) {
        var type = _ref4.type,
            name = _ref4.name,
            damage = _ref4.damage,
            imgFile = _ref4.imgFile;

        _classCallCheck(this, DC_Weapon);

        var _this4 = _possibleConstructorReturn(this, (DC_Weapon.__proto__ || Object.getPrototypeOf(DC_Weapon)).call(this, type, imgFile));

        _this4.name = name;
        _this4.damage = damage;
        return _this4;
    }

    return DC_Weapon;
}(DC_Item);

// DC_Portal is a class holding the portal to win the level
// Holds the image file to display the portal


var DC_Portal = function (_DC_Item3) {
    _inherits(DC_Portal, _DC_Item3);

    // DC_Portal constructor creates a portal object that signifies the end of
    // the level.
    function DC_Portal(_ref5) {
        var type = _ref5.type,
            imgFile = _ref5.imgFile;

        _classCallCheck(this, DC_Portal);

        return _possibleConstructorReturn(this, (DC_Portal.__proto__ || Object.getPrototypeOf(DC_Portal)).call(this, type, imgFile));
    }

    return DC_Portal;
}(DC_Item);
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WALL_CHAR = '#';
var OPENING_CHAR = ' ';
var START_POS = 0;

// A level generator
// The level is x tiles wide and y tiles high
// Returns a solvable level that is populated with enemies, weapons, and potions
// Start position will always be top left and end position will be bottom right

var DC_Level = function () {
    function DC_Level() {
        var tilesWide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
        var tilesHigh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30;
        var potion = arguments[2];
        var weapon = arguments[3];
        var endPortal = arguments[4];

        _classCallCheck(this, DC_Level);

        this.level = new DC_Maze(tilesWide, tilesHigh);
        this.level.addEndCell(this.level.maze, new DC_Portal(endPortal));
        this.level.addMarkers(this.level.maze, potion.num, this.level.openings, new DC_Potion(potion));
        this.level.addMarkers(this.level.maze, weapon.num, this.level.openings, new DC_Weapon(weapon));
        //this.enemyMarkers = this.addMarkers(this.level, ENEMY_CHAR, numEnemies,
        //    this.openings);
    }

    // null -> Number
    // Returns the number of tiles wide the level is
    // given: a level 5 tiles wide, expected: 5


    _createClass(DC_Level, [{
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
        // Returns the current tile's marker
        // given: x and y that point to a wall marker, expected: 'wall'

    }, {
        key: 'getTile',
        value: function getTile(x, y) {
            return this.level.getTile(x, y);
        }
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
    // Number Number Number Number Number -> [String]
    // Generates and populates a maze of size nxm (default is 30x30)
    // given: tile width of the maze (default 30)
    //        tile height of the maze (default 30)
    // expected: a maze of length tileWidth x tileHeight that is populated
    //           with enemies, items, and an end tile for the maze
    function DC_Maze() {
        var tilesWide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
        var tilesHigh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30;

        _classCallCheck(this, DC_Maze);

        this.tilesWide = tilesWide;
        this.tilesHigh = tilesHigh;
        this.openings = [];
        this.maze = this.generateBlankMaze(tilesWide, tilesHigh);
        this.maze = this.generateMaze(this.maze, tilesWide, START_POS, [], this.openings);
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
                openings.push(cellPos);
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
        // Populates the maze randomly with user defined markers
        // given: an array that is a solvable maze
        //        the number of markers to add
        //        openings that can be traversed in the maze
        //        actual item object to be placed on the maze
        // expected: an array with the position of each marker

    }, {
        key: 'addMarkers',
        value: function addMarkers(level, num, openings, itemObj) {
            var randomCell = Math.floor(Math.random() * openings.length);
            var addMarkerPosn = openings.splice(randomCell, 1)[0];
            var markers = [];

            while (num > 0) {
                markers.push(addMarkerPosn);
                level[addMarkerPosn] = itemObj;
                num--;
                randomCell = Math.floor(Math.random() * openings.length);
                addMarkerPosn = openings.splice(randomCell, 1)[0];
            }

            return markers;
        }

        // Number Number -> String
        // Retrieves the tile at a position
        // Only returns if the tile is traversable or not
        // given: x and y with a WALL_CHAR at the location
        // expected: 'wall'

    }, {
        key: 'getTile',
        value: function getTile(x, y) {
            if (this.maze[x + y * this.tilesWide] === WALL_CHAR) {
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
    }]);

    return DC_Maze;
}();

var DC_Player = function () {
    function DC_Player(type, atkDmg, atkModifier, img, location) {
        _classCallCheck(this, DC_Player);

        this.health = 100;
        this.damage = atkDmg;
        this.damageModifier = atkModifier;
        this.imageLocation = img;
        this.location = location;
    }

    _createClass(DC_Player, [{
        key: 'attack',
        value: function attack() {
            return this.damage + Math.floor(Math.random() * this.damageModifier);
        }
    }, {
        key: 'image',
        value: function image() {
            return this.imageLocation;
        }
    }]);

    return DC_Player;
}();

// Parent prototype for items(weapons, potions, etc)


var DC_Item =
// Set the location of the item in the constructor
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

    // Number String -> Object
    // Create an object that has the health restored value for a potion
    //  Takes an object with the following params:
    //    type: potion type
    //    potionValue: how much health to restore (default 20)
    //    img: image file to display
    function DC_Potion(_ref) {
        var type = _ref.type,
            _ref$potionValue = _ref.potionValue,
            potionValue = _ref$potionValue === undefined ? 20 : _ref$potionValue,
            imgFile = _ref.imgFile;

        _classCallCheck(this, DC_Potion);

        var _this = _possibleConstructorReturn(this, (DC_Potion.__proto__ || Object.getPrototypeOf(DC_Potion)).call(this, type, imgFile));

        _this.potionValue = potionValue;
        return _this;
    }

    return DC_Potion;
}(DC_Item);

// DC_Weapon is a class holding a weapon that populates the level
// Holds the weapon attack damage and image file to display the weapon


var DC_Weapon = function (_DC_Item2) {
    _inherits(DC_Weapon, _DC_Item2);

    // String Number String -> Object
    // Create an object that has the name and attack damage of a weapon
    //  Takes an object with the following params:
    //    type: weapon type
    //    name: name of the weapon
    //    attack: attack damage of the weapon
    //    imgFile: image file to display
    function DC_Weapon(_ref2) {
        var type = _ref2.type,
            name = _ref2.name,
            attack = _ref2.attack,
            imgFile = _ref2.imgFile;

        _classCallCheck(this, DC_Weapon);

        var _this2 = _possibleConstructorReturn(this, (DC_Weapon.__proto__ || Object.getPrototypeOf(DC_Weapon)).call(this, type, imgFile));

        _this2.name = name;
        _this2.attack = attack;
        return _this2;
    }

    return DC_Weapon;
}(DC_Item);

// DC_Portal is a class holding the portal to win the level
// Holds the image file to display the portal


var DC_Portal = function (_DC_Item3) {
    _inherits(DC_Portal, _DC_Item3);

    // String String -> Object
    // Create an object that displays the image file of the end of the level
    //  Takes an object with the following params:
    //    type: portal type
    //    imgFile: image file to display
    function DC_Portal(_ref3) {
        var type = _ref3.type,
            imgFile = _ref3.imgFile;

        _classCallCheck(this, DC_Portal);

        return _possibleConstructorReturn(this, (DC_Portal.__proto__ || Object.getPrototypeOf(DC_Portal)).call(this, type, imgFile));
    }

    return DC_Portal;
}(DC_Item);
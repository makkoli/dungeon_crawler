"use strict"

const WALL_CHAR = '#';
const OPENING_CHAR = ' ';
const START_POS_X = 0;
const START_POS_Y = 0;

// A level generator
// The level is x tiles wide and y tiles high
// Returns a solvable level that is populated with enemies, weapons, and potions
// Start position will always be top left and end position will be bottom right
class DC_Level {
    // DC_Level constructor creates an object that manages a randomly generated
    // level. Also, takes and adds markers for potions, weapon(s), enemies, the
    // human player, and the end portal for the level.
    //  interpretation:
    //      level: level holds the randomly generated maze with markers on it
    //      player: holds the human player state
    //      collisionInfo: info about the last collision between the player
    //                     and a marker
    constructor(tilesWide = 30, tilesHigh = 30, humanPlayer, endPortal) {
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
    addMarker(markerObj) {
        this.level.addMarker(this.level.maze, this.level.openings, markerObj);
    }

    // Object -> Number
    // Places the human player sprite on the level
    // given: an object representing the player
    // expected: the start tile position the player sprite is on in [x,y] format
    addPlayer(playerObj) {
        this.level.addMarker(this.level.maze, this.level.openings, playerObj,
            START_POS_X, START_POS_Y);

        return [START_POS_X, START_POS_Y];
    }

    // null -> Number
    // Returns the current position of the human player on the level
    // given: a player in position 5 on the level
    // expected: 5
    getPlayerPosition() {
        return this.player.position;
    }

    // null -> Object
    // Returns the info about the human player
    // given: a player on the level with name Hero, weapon Fists, health: 100
    // and attack 5
    // expected: {name: "Hero", weapon: "Fists", health: 100, attack: 5}
    getPlayerInfo() {
        return this.player.getInfo();
    }

    // null -> Object
    // Returns details about the last move made that caused a collision
    // given: a movement where no collision occurs
    // expected: { type: null }
    getCollisionInfo() {
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
    movePlayer(direction, x, y) {
        switch (direction) {
            case "up":
                return this.handlePlayerMoveFrom({x: x, y: y}, {x: x, y: y - 1});
            case "down":
                return this.handlePlayerMoveFrom({x: x, y: y}, {x: x, y: y + 1});
            case "right":
                return this.handlePlayerMoveFrom({x: x, y: y}, {x: x + 1, y: y});
            case "left":
                return this.handlePlayerMoveFrom({x: x, y: y}, {x: x - 1, y: y});
            default:
                return [x, y];
        }
    }

    // { Number, Number } { Number, Number } -> [Number]
    // Handles the collision logic of the player moving to a new tile
    // given: moving up to a new position from x,y coordinate
    // expected: [x, y + 1]
    handlePlayerMoveFrom(oldPosn, newPosn) {
        if (this.checkForCollision(newPosn.x, newPosn.y)) {
            if (this.handleCollision(this.player, oldPosn, newPosn)) {
                return [newPosn.x, newPosn.y];
            }
            this.collisionInfo = {
                type: null
            };
            return [oldPosn.x, oldPosn.y]
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
    checkForCollision(x, y) {
        return (this.level.getTile(x, y) === "wall" ||
            !!this.level.getMarker(x, y));
    }

    // Object Number Number -> [Number]
    // Handles collision resolution between the player object and a
    // marker/wall on the map
    // given: playerObj representing the player
    //        x, y is the new x, y position of the player and there is a marker
    //        on the x,y position
    // expected: true if the player can move after collision, false otherwise
    handleCollision(playerObj, oldPosn, newPosn) {
        // if wall, just return current location
        if (this.level.getTile(oldPosn.x, oldPosn.y) === "wall") {
            return false;
        }

        let markerDesc = this.level.getMarker(newPosn.x, newPosn.y);
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
                    health: markerDesc.health
                };
                return false;
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
    getLevelWidth() {
        return this.level.tilesWide;
    }

    // null -> Number
    // Returns the number of tiles high the level is
    // given: a level 5 tiles high, expected: 5
    getLevelHeight() {
        return this.level.tilesHigh;
    }

    // Number Number -> String
    // Returns the current tile's string
    // given: x and y that point to a wall marker, expected: 'wall' or 'opening'
    getTile(x, y) {
        return this.level.getTile(x, y);
    }

    // Number Number -> Object
    // Returns the object marker at a location on the maze
    // given: x and y that points to a marker object, expected: object marker
    getMarker(x, y) {
        return this.level.getMarker(x, y);
    }
}

// A DC_Maze is a structure that holds the maze and any markers on it
// The maze has totalTiles = tileWide * tileHeight
// Also holds all markers on the maze for items, enemies, and end
class DC_Maze {
    // DC_Maze constructor creates an object that manages a randomly generated
    // maze.
    //  interpretation:
    //      tilesWide: tile width of the maze
    //      tilesHigh: tile height of the maze
    //      openings: tiles that are do not have a wall on them
    //      maze: array that holds the maze
    constructor(tilesWide = 30, tilesHigh = 30) {
        this.tilesWide = tilesWide;
        this.tilesHigh = tilesHigh;
        this.openings = [];
        this.maze = this.generateBlankMaze(tilesWide, tilesHigh);
        this.maze = this.generateMaze(this.maze, tilesWide,
            START_POS_X + START_POS_Y, [], this.openings);
    }

    // Number Number -> [String]
    // Generates a blank maze (filled with walls)
    // given: width of the level in tiles
    //        height of the level in tiles
    // expected: an array with row length tilesWide and column
    //           length tilesHigh and all values filled with WALL_CHAR
    generateBlankMaze(tilesWide, tilesHigh) {
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
    generateMaze(grid, width, cellPos, walls, openings) {
        let nextCell;   // next cell to be checked
        // remove the wall at position only if there is one or less open
        // neighbor cells
        if (this.checkOpenNeighbors(grid, width, cellPos) <= 1 &&
            openings.indexOf(cellPos) === -1) {
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
    addWallNeighbors(grid, width, cellPos) {
        let walls = [];
        // Check right
        if ((cellPos + 1) < grid.length && ((cellPos + 1) % width) > 0 &&
            grid[cellPos + 1] === WALL_CHAR && walls.indexOf(cellPos + 1) === -1) {
            walls.push(cellPos + 1);
        }
        // Check left
        if ((cellPos - 1) >= 0 && (cellPos % width) > 0 &&
            grid[cellPos - 1] === WALL_CHAR && walls.indexOf(cellPos - 1) === -1) {
            walls.push(cellPos - 1);
        }
        // Check above
        if ((cellPos - width) >= 0 && grid[cellPos - width] === WALL_CHAR &&
            walls.indexOf(cellPos - width) === -1) {
            walls.push(cellPos - width);
        }
        // Check below
        if ((cellPos + width) < grid.length && grid[cellPos + width] === WALL_CHAR &&
            walls.indexOf(cellPos + width) === -1) {
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
    checkOpenNeighbors(grid, width, cellPos) {
        // we know there is at least one open cell next to the wall
        let numOpenCells = 0;

        // Check right
        if ((cellPos + 1) < grid.length && ((cellPos + 1) % width) > 0 &&
            grid[cellPos + 1] === OPENING_CHAR) {
            numOpenCells++;
        }
        // Check left
        if ((cellPos - 1) >= 0 && (cellPos % width) > 0 &&
            grid[cellPos - 1] === OPENING_CHAR) {
            numOpenCells++;
        }
        // Check above
        if ((cellPos - width) >= 0 && grid[cellPos - width] === OPENING_CHAR) {
            numOpenCells++;
        }
        // Check below
        if ((cellPos + width) < grid.length && grid[cellPos + width] === OPENING_CHAR) {
            numOpenCells++;
        }

        return numOpenCells;
    }

    // [Number] -> Number
    // Gets a wall randomly from the list of wall cells
    // that still need to be checked
    // given: an array of cells that are wall positions
    // expected: a random wall position from the array
    getNextCell(walls) {
        if (walls.length === 1) {
            return walls.pop();
        }
        else {
            return walls.splice(Math.floor(walls.length * Math.random()), 1)[0];
        }
    }

    // [String] Number -> [String]
    // Sets the end(winning) position on the level
    // given: an array that is a solvable maze with the last position in the
    //      bottom right to be maze.length - 1
    // expected: maze.length - 1
    addEndCell(level, portal) {
        for (let i = level.length - 1; i > 0; i--) {
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
    addMarker(level, openings, itemObj, startPosX = -1, startPosY = -1) {
        let startPos = startPosX + startPosY;
        if (startPos >= 0 && openings.indexOf(startPos) === -1 && startPos < this.maze.length) {
            level[startPos] = itemObj;
        }
        else {
            let randomCell = Math.floor(Math.random() * openings.length);
            let addMarkerPosn = openings.splice(randomCell, 1)[0];
            level[addMarkerPosn] = itemObj;
        }
    }

    // Number Number -> String
    // Retrieves the tile at a position
    // Only returns if the tile is traversable or not
    // given: x and y with a WALL_CHAR at the location
    // expected: 'wall'
    getTile(x, y) {
        // subtract one from tilesWide and tilesHigh to account for zero based
        // indexing
        if (x < 0 || y < 0 || x > this.tilesWide - 1 || y > this.tilesHigh - 1 ||
            this.maze[x + (y * this.tilesWide)] === WALL_CHAR) {
            return "wall";
        }
        else {
            return "opening";
        }
    }

    // Number Number -> Boolean
    // Retrieves an object marker at a tile, false if does not exist
    // given: x and y with an object marker there
    // expected: an object
    // given: x and y with no object marker there
    // expected: false
    getMarker(x, y) {
        if (typeof this.maze[x + (y * this.tilesWide)] === 'object') {
            return this.maze[x + (y * this.tilesWide)];
        }
        else {
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
    updateMarker(markerObj, oldPosn, newPosn) {
        if (this.getTile(newPosn.x, newPosn.y) === "wall") {
            return false;
        }
        this.maze[oldPosn.x + (oldPosn.y * this.tilesWide)] = OPENING_CHAR;
        this.openings.push(oldPosn.x + (oldPosn.y * this.tilesWide));
        this.maze[newPosn.x + (newPosn.y * this.tilesWide)] = markerObj;
        return true;
    }
}

// Parent prototype for players
class DC_Player {
    // DC_Player constructor creates an object that is a parent object for players
    // on the level (human, AI).
    //  interpretation:
    //      type: type of player
    //      health: how much health the player has
    //      attack: how much attack damage the player has
    //      name: the name of the player
    //      imageFile: where to find the image to display the player
    constructor(type, atkDmg, name, health, imgFile) {
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
    takeDamage(damage) {
        this.health -= damage;
        return this.health;
    }

    // null -> Number
    // Returns the damage caused by an attack of the player
    // given: a player that has 5 attack
    // expected: 5
    performAttack() {
        return this.attack;
    }
}

// DC_Enemy is a class that holds the data and methods of an enemy in the level
class DC_Enemy extends DC_Player {
    // DC_Enemy constructor creates an enemy object to place on the level
    //  interpretation:
    //      atkDmgModifier: modifier that the damage of an attack randomly
    constructor({type: type, atkDmg: atkDmg, name: name, health: health,
                atkDmgModifier: atkDmgModifier = 0, imgFile: imgFile}) {
        super(type, atkDmg, name, health, imgFile);
        this.attackModifier = atkDmgModifier;
    }

    // null -> Number
    // Returns the damage caused by an attack of the enemy object
    // given: an enemy object with 5 attack and a 5 attack damage modifier
    // expected: 5-9
    performAttack() {
        return this.attack + Math.floor(this.attackModifier * Math.random());
    }
}

// DC_Human is a class that holds the data and methods of the human player in
// the level
class DC_Human extends DC_Player {
    // DC_Human constructor creates a human object to place on the level
    // interpretation:
    //      weapon: current weapon of human player
    //      position: current position on the level of the player
    constructor({type: type, atkDmg: atkDmg, name: name, weapon: weapon,
                health: health, imgFile: imgFile}) {
        super(type, atkDmg, name, health, imgFile);
        this.weapon = weapon;
        this.position = 0;
    }

    // Number -> Number
    // Heals the human player by healthRestore amount
    // given: a health restore amount of 20 and a player with 80 health
    // expected: 100
    heal(healthRestore) {
        if (this.health + healthRestore > 100) {
            this.health = 100;
        }
        else {
            this.health += healthRestore;
        }
        return this.health;
    }

    // String Number -> String
    // Updates the human players weapon and attack damage
    // given: a weapon by name of sword and damage 20
    // expected: human player has a sword weapon with 20 damage
    updateWeapon(newWeapon, newDamage) {
        this.weapon = newWeapon;
        this.attack = newDamage;
        return this.weapon;
    }

    // null -> Object
    // Retrieves all the properties of the human player object
    // given: a human with type, name, weapon, atkDmg, health
    // expected: {type: type, name: name, weapon: weapon, ....}
    getInfo() {
        return {
            type: this.type,
            name: this.name,
            weapon: this.weapon,
            health: this.health,
            atkDmg: this.attack
        };
    }
}

// Parent prototype for items(weapons, potions, etc)
class DC_Item {
    // DC_Item constructor creates an object that is the parent for items on
    // the maze
    //  interpretation:
    //      type: type of item
    //      imgFile: where to find the image file to display on the maze
    constructor(type, imgFile) {
        this.type = type;
        this.imgFile = imgFile;
    }
}

// DC_Potion is a class holding a potion that populates the level
// Holds the health restored of a potion consumed by the player and
// image file to display the potion
class DC_Potion extends DC_Item {
    // DC_Potion constructor creates a potion object
    //  interpretation:
    //      potionValue: restoration value of the potion
    constructor({type: type, potionValue: potionValue = 20, imgFile: imgFile}) {
        super(type, imgFile);
        this.potionValue = potionValue;
    }
}

// DC_Weapon is a class holding a weapon that populates the level
// Holds the weapon attack damage and image file to display the weapon
class DC_Weapon extends DC_Item {
    // DC_Weapon constructor creates a weapon object
    //  interpretation:
    //      name: name of the weapon
    //      attack: attack damage of the weapon
    constructor({type: type, name: name, damage: damage, imgFile: imgFile}) {
        super(type, imgFile);
        this.name = name;
        this.damage = damage;
    }
}

// DC_Portal is a class holding the portal to win the level
// Holds the image file to display the portal
class DC_Portal extends DC_Item {
    // DC_Portal constructor creates a portal object that signifies the end of
    // the level.
    constructor({type: type, imgFile: imgFile}) {
        super(type, imgFile);
    }
}

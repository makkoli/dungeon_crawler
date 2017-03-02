"use strict"

// State component to hold state of the game
class DungeonCrawler extends React.Component {
    // Create a DungeonCrawler component object
    // interpretation:
    //      levelNum: current level number
    //      level: current level being used for the game
    constructor(props) {
        super(props);
        // setup level
        this.levelNum = 1;
        this.level = this.setupLevel(this.props.levelWidth,
            this.props.levelHeight, this.props.humanPlayer,
            this.props.endPortal, this.props.potions,
            this.props.weapons[this.levelNum],
            this.props.enemies[this.levelNum],
            this.levelNum === this.props.numLevels, this.props.boss);

        // set state for the header and players current tile position
        this.state = {
            levelNum: this.levelNum,
            level: this.level,
            playerInfo: this.level.getPlayerInfo(),
            collisionInfo: this.level.getCollisionInfo(),
            playerTile: this.level.getPlayerPosition()
        };

        // add listener for user input
        document.addEventListener('keydown', this.movePlayer.bind(this));
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
    setupLevel(width, height, player, endPortal, potion, weapon, enemy, addBoss,
               boss) {
        let level = new DC_Level(width, height, player, endPortal);

        let i = potion.num;
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

        if (addBoss) {
            level.addBoss(boss);
        }

        return level;
    }

    // Move the player when he pushes an arrow key
    // given: down arrow, expected: player moves down a row
    movePlayer(event) {
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
            case "s":
                this.getNextLevel();
                break;
            // ignore if not a move command
            default:
                break;
        }

        // need to get the next level
        if (this.state.collisionInfo.type === "portal") {
            this.getNextLevel();
        }
    }

    // Move a player in a given direction and update the components state
    // interpretation:
    //      direction: direction the player is to move
    movePlayerSetState(direction) {
        this.setState({
            playerTile: this.state.level.movePlayer(direction,
                ...this.state.playerTile),
            playerInfo: this.state.level.getPlayerInfo(),
            collisionInfo: this.state.level.getCollisionInfo()
        });
    }

    // Gets the next level and updates the current state to reflect this
    getNextLevel() {
        let newLevelNum = this.state.levelNum + 1;
        let newLevel = this.setupLevel(this.props.levelWidth,
            this.props.levelHeight, this.state.level.getPlayerInfo(),
            this.props.endPortal, this.props.potions,
            this.props.weapons[newLevelNum],
            this.props.enemies[newLevelNum],
            newLevelNum === this.props.numLevels, this.props.boss);

        this.setState({
            levelNum: newLevelNum,
            level: newLevel,
            playerTile: this.level.getPlayerPosition()
        });
    }

    // Render the top level component
    render() {
        let tiles = [];
        let tileRow = [];
        for (let i = 0; i < this.props.levelHeight; i++) {
            for (let j = 0; j < this.props.levelWidth; j++) {
                tileRow.push(<DungeonTile key={i + j}
                    tileBG={this.state.level.getTile(j, i)}
                    tileMarker={this.state.level.getMarker(j, i)} />);
            }
            tiles.push(<DungeonTileRow tiles={tileRow} key={i} />);
            tileRow = [];
        }
        return (
            <div>
                <DungeonHeader level={this.state.levelNum}
                playerInfo={this.state.playerInfo}
                collisionInfo={this.state.collisionInfo} />
                <div className="dungeon-container">
                    {tiles}
                </div>
            </div>
        );
    }
}

// Stateless component to render the header to display game info to player
const DungeonHeader = (props) => {
    let collisionMessage = "";
    let enemyHealth = "";
    // set up messages for the header
    if (!!props.collisionInfo) {
        switch (props.collisionInfo.type) {
            case "portal":
                collisionMessage = "Warped to next level";
                break;
            case "potion":
                collisionMessage = `${props.collisionInfo.potionValue} health restored`;
                break;
            case "weapon":
                collisionMessage = `${props.collisionInfo.name} picked up`;
                break;
            case "enemy":
                if (props.collisionInfo.defeated) {
                    collisionMessage = `${props.collisionInfo.name} defeated`;
                }
                else {
                    collisionMessage = props.collisionInfo.name;
                    enemyHealth = `${props.collisionInfo.health}/${props.collisionInfo.maxHealth}`;
                }
            default:
                break;
        }
    }

    return (
        <div className="dungeon-header">
            <h1>Level {props.level}</h1>
            <div className="dungeon-player">
                <h4>
                    {props.playerInfo.name}
                    (<span style={{color: "darkseagreen"}}>
                        {props.playerInfo.level}
                    </span>) - <span style={{color: "gold"}}>
                        {props.playerInfo.currentXP}/{props.playerInfo.XPToLevel}
                    </span> XP
                </h4>
                <h4>
                    <span style={{color: "aqua"}}>
                        {props.playerInfo.health}
                    </span> Health
                </h4>
                <h4>
                    {props.playerInfo.weapon} (
                    <span style={{color: "red"}}>
                        {props.playerInfo.atkDmg}
                    </span> + <span style={{color: "red"}}>
                        {props.playerInfo.levelDmgModifier}
                    </span>)
                </h4>
            </div>
            <div className="dungeon-info">
                <h4>{collisionMessage}</h4>
                <h4>
                    <span style={{color: "aqua"}}>{enemyHealth}</span>
                    {enemyHealth ? " Health": ""}
                </h4>
            </div>
        </div>
    );
}

// Presentation component for a row of tiles on the level
// given: an array of tiles
// expected: each tile laid out next to each other
const DungeonTileRow = (props) => {
    return <div className="dungeon-tile-row">{props.tiles}</div>;
}

// Presentation component that represents a single tile of the level
// given: a tile with a marker on it
// expected: a tile with the marker image on top of it
const DungeonTile = (props) => {
    return <div className={props.tileBG === "wall" ?
        "dungeon-tile-wall" : "dungeon-tile-opening"}>
            {
                !!props.tileMarker ?
                <img src={props.tileMarker.imgFile} />
                :
                ""
            }
        </div>;
}

// Types of default properties to pass in
DungeonCrawler.propTypes = {
    levelWidth: React.PropTypes.number,
    levelHeight: React.PropTypes.number,
    numLevels: React.PropTypes.number,
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
}

// Default properties
// Set up size of the level
// Set up each level with potions/weapons/enemies
// Set up human player params
DungeonCrawler.defaultProps = {
    levelWidth: 20,
    levelHeight: 15,
    numLevels: 3,
    potions: {
        type: "potion",
        num: 5,             // num to add
        potionValue: 20,    // health restore value
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
            XPValue: 15,
            imgFile: "images/bug_25x25.png"
        },
        2: {
            type: "enemy",
            num: 10,
            name: "Zombie",
            atkDmg: 10,
            atkDmgModifier: 5,
            health: 40,
            XPValue: 25,
            imgFile: "images/zombie_25x25.png"
        },
        3: {
            type: "enemy",
            num: 10,
            name: "Skeleton",
            atkDmg: 15,
            atkDmgModifier: 5,
            health: 70,
            XPValue: 45,
            imgFile: "images/skeleton_25x25.png"
        }
    },
    boss: {
        type: "boss",
        num: 1,
        name: "Boss",
        atkDmg: 20,
        atkDmgModifier: 5,
        health: 120,
        XPValue: 200,
        imgFile: "images/boss_25x25.png"
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

ReactDOM.render(<DungeonCrawler />, document.getElementById('dungeon'));

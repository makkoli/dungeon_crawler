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
        this.moveListener = this.movePlayer.bind(this);

        // set state for the header and players current tile position
        this.state = {
            levelNum: this.levelNum,
            level: this.level,
            playerInfo: this.level.getPlayerInfo(),
            collisionInfo: this.level.getCollisionInfo(),
            gameOver: false,
            gameOverType: ""
        };

        // add listener for user input
        document.addEventListener('keydown', this.moveListener);
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
            level.addBoss(new DC_Enemy(boss));
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
        // check if game is over
        if (this.state.collisionInfo.gameOver) {
            // if player beat the game
            if (!this.state.collisionInfo.playerDead) {
                this.setState({
                    gameOver: true,
                    gameOverType: "win"
                });
            }
            // else, the player lost
            else {
                this.setState({
                    gameOver: true,
                    gameOverType: "lose"
                });
            }
            document.removeEventListener('keydown', this.moveListener);
        }
    }

    // Move a player in a given direction and update the components state
    // interpretation:
    //      direction: direction the player is to move
    movePlayerSetState(direction) {
        this.state.level.movePlayer(direction);
        this.setState({
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
            level: newLevel
        });
    }

    // Restarts a game at level 1
    restart() {
        this.levelNum = 1;
        this.level = this.setupLevel(this.props.levelWidth,
            this.props.levelHeight, this.props.humanPlayer,
            this.props.endPortal, this.props.potions,
            this.props.weapons[this.levelNum],
            this.props.enemies[this.levelNum],
            this.levelNum === this.props.numLevels, this.props.boss);

        // set state for the header and players current tile position
        this.setState({
            levelNum: this.levelNum,
            level: this.level,
            playerInfo: this.level.getPlayerInfo(),
            collisionInfo: this.level.getCollisionInfo(),
            gameOver: false,
            gameOverType: ""
        });

        // add listener for user input
        document.addEventListener('keydown', this.moveListener);
    }

    // Render the top level component
    render() {
        let maze = this.state.level.getMaze(this.props.fogOfWarRadius);
        let tiles = [];
        let tileRow = [];
        for (let i = 0; i < maze.length; i++) {
            for (let j = 0; j < maze[0].length; j++) {
                tileRow.push(<DungeonTile key={maze[i][j].key}
                    tileBG={maze[i][j].tileBG}
                    tileMarker={maze[i][j].tileMarker} />);
            }
            tiles.push(<DungeonTileRow tiles={tileRow} key={i} />);
            tileRow = [];
        }
        return (
            <div>
                <DungeonHeader level={this.state.levelNum}
                    playerInfo={this.state.playerInfo}
                    collisionInfo={this.state.collisionInfo}
                    isGameOver={this.state.gameOver}
                    gameOverType={this.state.gameOverType}
                    restart={this.restart.bind(this)} />
                <div className="dungeon-container">
                    {tiles}
                </div>
            </div>
        );
    }
}

// Stateless component to render the header to display game info to player
const DungeonHeader = (props) => {
    return (
        <div className="dungeon-header">
            <HeaderInfo level={props.level}
                isGameOver={props.isGameOver}
                gameOverType={props.gameOverType}
                restart={props.restart} />
            <PlayerInfo name={props.playerInfo.name}
                level={props.playerInfo.level}
                currentXP={props.playerInfo.currentXP}
                XPToLevel={props.playerInfo.XPToLevel}
                health={props.playerInfo.health}
                weapon={props.playerInfo.weapon}
                atkDmg={props.playerInfo.atkDmg}
                levelDmgModifier={props.playerInfo.levelDmgModifier} />
            <GameInfo collisionInfo={props.collisionInfo} />
        </div>
    );
}

// Presentation component with either level or victory/defeat
const HeaderInfo = (props) => {
    let title;
    if (props.isGameOver) {
        // player lost
        if (props.gameOverType === "lose") {
            title = (
                <h1 style={{color: "red"}}>
                    You Lose. <u style={{cursor: "pointer"}} onClick={props.restart}>Play Again?</u>
                </h1>
            );
        }
        // player won
        else {
            title = (
                <h1 style={{color: "green"}}>
                    You win. <u style={{cursor: "pointer"}} onClick={props.restart}>Play Again?</u>
                </h1>
            );
        }
    }
    else {
        title = <h1>Level {props.level}</h1>;
    }

    return title;
}

// Presentation component with all the current info about the player
const PlayerInfo = (props) => {
    return (
        <div className="dungeon-player">
            <h4>
                {props.name}
                (<span style={{color: "darkseagreen"}}>
                    {props.level}
                </span>) - <span style={{color: "gold"}}>
                    {props.currentXP}/{props.XPToLevel}
                </span> XP
            </h4>
            <h4>
                <span style={{color: "aqua"}}>
                    {props.health}
                </span> Health
            </h4>
            <h4>
                {props.weapon} (
                <span style={{color: "red"}}>
                    {props.atkDmg}
                </span> + <span style={{color: "red"}}>
                    {props.levelDmgModifier}
                </span>)
            </h4>
        </div>
    );
}

// Presentation component with the info about current game actions
const GameInfo = (props) => {
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
                break;
            case "boss":
                if (props.collisionInfo.defeated) {
                    collisionMessage = `${props.collisionInfo.name} defeated`;
                }
                else {
                    collisionMessage = props.collisionInfo.name;
                    enemyHealth = `${props.collisionInfo.health}/${props.collisionInfo.maxHealth}`;
                }
                break;
            default:
                break;
        }
    }

    return (
        <div className="dungeon-info">
            <h4>{collisionMessage}</h4>
            <h4>
                <span style={{color: "aqua"}}>{enemyHealth}</span>
                {enemyHealth ? " Health": ""}
            </h4>
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
    let tileBG = "dungeon-tile-empty";
    if (!!props.tileBG) {
        tileBG = props.tileBG === "wall" ? "dungeon-tile-wall" : "dungeon-tile-opening";
    }

    return <div className={tileBG}>
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
    fogOfWarRadius: React.PropTypes.number,
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
    fogOfWarRadius: 4,
    potions: {
        type: "potion",
        num: 6,             // num to add
        potionValue: 25,    // health restore value
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
            num: 12,
            name: "Bug",
            atkDmg: 3,
            atkDmgModifier: 5,
            health: 20,
            XPValue: 15,
            imgFile: "images/bug_25x25.png"
        },
        2: {
            type: "enemy",
            num: 12,
            name: "Zombie",
            atkDmg: 5,
            atkDmgModifier: 10,
            health: 40,
            XPValue: 25,
            imgFile: "images/zombie_25x25.png"
        },
        3: {
            type: "enemy",
            num: 12,
            name: "Skeleton",
            atkDmg: 5,
            atkDmgModifier: 15,
            health: 70,
            XPValue: 50,
            imgFile: "images/skeleton_25x25.png"
        }
    },
    boss: {
        type: "boss",
        num: 1,
        name: "Boss",
        atkDmg: 5,
        atkDmgModifier: 20,
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

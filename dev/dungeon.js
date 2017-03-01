"use strict"

// State component to hold state of the game
class DungeonCrawler extends React.Component {
    constructor(props) {
        super(props);
        // setup level
        this.levelOne = new DC_Level(this.props.levelWidth,
            this.props.levelHeight, this.props.humanPlayer,
            this.props.endPortal);

        // add potions
        let i = this.props.potion.num;
        while (i > 0) {
            this.levelOne.addMarker(new DC_Potion(this.props.potion));
            i--;
        }

        // add weapon(s)
        i = this.props.weaponOne.num;
        while (i > 0) {
            this.levelOne.addMarker(new DC_Weapon(this.props.weaponOne));
            i--;
        }

        // add enemies
        i = this.props.enemyOne.num;
        while (i > 0) {
            this.levelOne.addMarker(new DC_Enemy(this.props.enemyOne));
            i--;
        }

        // set state for the header and players current tile position
        this.state = {
            level: 1,
            playerInfo: this.levelOne.getPlayerInfo(),
            collisionInfo: this.levelOne.getCollisionInfo(),
            playerTile: this.levelOne.getPlayerPosition()
        };

        // add listener for user input
        document.addEventListener('keydown', this.movePlayer.bind(this));
    }

    movePlayer(event) {
        switch (event.key) {
            case "ArrowUp":
                this.setState({
                    playerTile: this.levelOne.movePlayer("up",
                        ...this.state.playerTile),
                    playerInfo: this.levelOne.getPlayerInfo(),
                    collisionInfo: this.levelOne.getCollisionInfo()
                });
                break;
            case "ArrowDown":
                this.setState({
                    playerTile: this.levelOne.movePlayer("down",
                        ...this.state.playerTile),
                    playerInfo: this.levelOne.getPlayerInfo(),
                    collisionInfo: this.levelOne.getCollisionInfo()
                });
                break;
            case "ArrowLeft":
                this.setState({
                    playerTile: this.levelOne.movePlayer("left",
                        ...this.state.playerTile),
                    playerInfo: this.levelOne.getPlayerInfo(),
                    collisionInfo: this.levelOne.getCollisionInfo()
                });
                break;
            case "ArrowRight":
                this.setState({
                    playerTile: this.levelOne.movePlayer("right",
                        ...this.state.playerTile),
                    playerInfo: this.levelOne.getPlayerInfo(),
                    collisionInfo: this.levelOne.getCollisionInfo()
                });
                break;
            // ignore if not a move command
            default:
                break;
        }
    }

    render() {
        let tiles = [];
        let tileRow = [];
        for (let i = 0; i < this.props.levelHeight; i++) {
            for (let j = 0; j < this.props.levelWidth; j++) {
                tileRow.push(<DungeonTile key={i + j}
                    tileBG={this.levelOne.getTile(j, i)}
                    tileMarker={this.levelOne.getMarker(j, i)} />);
            }
            tiles.push(<DungeonTileRow tiles={tileRow} key={i} />);
            tileRow = [];
        }
        return (
            <div>
                <DungeonHeader level={this.state.level}
                playerInfo={this.state.playerInfo}
                collisionInfo={this.state.collisionInfo} />
                <div className="dungeon-container">
                    {tiles}
                </div>
            </div>
        );
    }
}

const DungeonHeader = (props) => {
    let collisionMessage = "";
    let enemyHealth = "";
    if (!!props.collisionInfo) {
        switch (props.collisionInfo.type) {
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

const DungeonTileRow = (props) => {
    return <div className="dungeon-tile-row">{props.tiles}</div>;
}

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
}

DungeonCrawler.defaultProps = {
    levelWidth: 20,
    levelHeight: 15,
    potion: {
        type: "potion",
        num: 5,             // num to add
        potionValue: 20,    // health restore value
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
        atkDmgModifier: 5,
        health: 20,
        XPValue: 10,
        imgFile: "images/bug_25x25.png"
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

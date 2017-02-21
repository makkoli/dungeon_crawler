"use strict"

// State component to hold state of the game
class DungeonCrawler extends React.Component {
    constructor(props) {
        super(props);
        this.levelOne = new DC_Level(this.props.levelWidth,
            this.props.levelHeight, this.props.potion, this.props.weaponOne,
            this.props.endPortal);
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
        return <div className="dungeon-container">{tiles}</div>;
    }
}

const DungeonTileRow = (props) => {
    return <div className="dungeon-tile-row">{props.tiles}</div>
}

const DungeonTile = (props) => {
    if (!!props.tileMarker) {
        console.log(props.tileMarker);
    }
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
    levelWidth: 30,
    levelHeight: 30,
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
        attack: 10,
        imgFile: "images/dagger_25x25.png"
    }
};

ReactDOM.render(<DungeonCrawler />, document.getElementById('dungeon'));

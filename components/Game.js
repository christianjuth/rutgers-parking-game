import React from 'react';
import { Text, Image, Dimensions, Platform, View } from 'react-native';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import Expo2DContext from 'expo-2d-context';

import { map, computers, player } from '../levels/01/level';
import Engine from './Engine';
import Controller from './Controller';


const isWeb = Platform.OS === 'web';
class Game extends React.Component{

  constructor(props) {
    super(props);

    this.state = {
      player: {},
      computers: []
    }

    this.engine = new Engine({
      map,
      player,
      computers,
      speed: 0.075
    });
  }

  move = 'u';

  state = {
    width: 500,
    height: 500,
    yOffset: 0,
    scale: 1
  }

  async loadImage(image) {
    const asset = await Asset.fromModule(image);
    await asset.downloadAsync();
    return asset;
  }

  async componentDidMount() {
    let assets = await Promise.all([
      this.loadImage(require('../assets/game/car-e.png')),
      this.loadImage(require('../assets/game/car-w.png')),
      this.loadImage(require('../assets/game/car-n.png')),
      this.loadImage(require('../assets/game/car-s.png')),
      this.loadImage(require('../assets/game/computer-e.png')),
      this.loadImage(require('../assets/game/computer-w.png')),
      this.loadImage(require('../assets/game/computer-n.png')),
      this.loadImage(require('../assets/game/computer-s.png')),
    ]);

    let [ carE, carW, carN, carS, computerE, computerW, computerN, computerS ] = assets;
    this.images = {
      red: {
        e: carE,
        w: carW,
        n: carN,
        s: carS
      },
      white: {
        e: computerE,
        w: computerW,
        n: computerN,
        s: computerS
      }
    }

    requestAnimationFrame(this.step.bind(this));
  }

  step(time) {
    requestAnimationFrame(this.step.bind(this));
    let diff;
    if(!this.lastTime)
      diff = 0;
    else
      diff = time - this.lastTime;
    this.engine.step(diff);
    this.renderGame();
    this.lastTime = time;
  }

  renderGame() {
    let { player, computers } = this.engine.getState();
    this.setState({ player, computers });
  }

  addController(controller) {
    this.engine.addController(controller);
  }

  renderPlayer(player, color, i) {
    if(!player.loc) return;

    let screen = Dimensions.get('window'),
        size = Math.min(screen.height, screen.width),
        scale = size / 2000;

    let { x, y, direction } = player.loc,
        base = 100 * scale,
        height = base,
        width = base;

    if(['n', 's'].includes(direction))
      height *= 2;
    else
      width *= 2;

    let selectedImg = this.images[color][direction];

    let loc = [];
    if(direction == 'n')
      loc = [base*x, base*y];
    else if(direction == 's')
      loc = [base*x, base*(y-1)];
    else if(direction == 'e')
      loc = [base*(x-1), base*y];
    else
      loc = [base*x, base*y];

    return(
      <Image
        style={{
          position: 'absolute',
          width,
          height,
          left: loc[0],
          top: loc[1]
        }}
        source={selectedImg}
        resizeMode='stretch'
        key={i}
      />
    );
  }

  render() {
    let { height, width } = Dimensions.get('window'),
        size = Math.min(height, width),
        scale = size / 2000;

    let { player, computers } = this.state;

    let yOffset = 0,
        xOffset = 0;
    if(player.loc){
      yOffset = (1000 - (player.loc.y * 100)) * scale;
      xOffset = width/4 + (1000 - (player.loc.x * 100)) * scale;
      let { direction } = player.loc;

      if(direction == 'n')
        yOffset -= 50 * scale;
      else if(direction == 's')
        yOffset += 50 * scale;
      else if(direction == 'e')
        xOffset += 50 * scale;
      else
        xOffset -= 50 * scale;
    }


    return(
      <Controller onLoad={this.addController.bind(this)}>

        <View style={{
            height: size,
            width: size,
            position: 'absolute',
            top: yOffset,
            left: xOffset
          }}>

          <Image
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
            }}
            resizeMode='stretch'
            source={require('../levels/01/background.png')}
          />

          {computers.map((p, i) => this.renderPlayer(p, 'white', i))}

          {this.renderPlayer(player, 'red')}

          <Image
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%'
            }}
            resizeMode='stretch'
            source={require('../levels/01/overlay.png')}
          />

        </View>

      </Controller>
    );
  }
}



export default Game;

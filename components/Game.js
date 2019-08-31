import React from 'react';
import { Text, Image as Img, Dimensions, Platform } from 'react-native';
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
    if(isWeb){
      const img = new Image()
      img.src = asset.localUri;
      return img;
    } else{
      return asset;
    }
  }

  async onCreateContext(gl) {
    if(this.ctx) return;

    let ctx;
    if(isWeb)
      ctx = gl.getContext('2d');
    else
      ctx = new Expo2DContext(gl);

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

    this.assets = assets;
    this.ctx = ctx;

    let width = gl.width || ctx.width,
        height = gl.height || ctx.height;

    this.setState({
      width: width,
      height: height,
      yOffset: isWeb ? 0 : (height - width) / 2,
      scale: width / 500
    });

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
    let ctx = this.ctx,
        { width, height, yOffset, scale } = this.state;

    ctx.clearRect(0, 0, width, height);

    let [ carE, carW, carN, carS, computerE, computerW, computerN, computerS ] = this.assets;

    let images = {
      player: {
        e: carE,
        w: carW,
        n: carN,
        s: carS
      },
      computer: {
        e: computerE,
        w: computerW,
        n: computerN,
        s: computerS
      }
    }

    let renderPlayer = (player, type) => {
      let { x, y, direction } = player.loc,
          base = 25 * scale,
          height = base,
          width = base;

      if(['n', 's'].includes(direction))
        height *= 2;

      else
        width *= 2;

      let selectedImg = images[type][direction];

      if(direction == 'n')
        ctx.drawImage(selectedImg, base*x - width/2, yOffset + base*y, width*2, height);
      else if(direction == 's')
        ctx.drawImage(selectedImg, base*x - width/2, yOffset + base*(y-1), width*2, height);
      else if(direction == 'e')
        ctx.drawImage(selectedImg, base*(x-1), yOffset + base*y - height/2, width, height*2);
      else
        ctx.drawImage(selectedImg, base*x, yOffset + base*y - height/2, width, height*2);
    }

    let { player, computers } = this.engine.getState();
    // console.log(player.loc);
    renderPlayer(player, 'player');
    computers.forEach((c) => renderPlayer(c, 'computer'));
    if(!isWeb) ctx.flush();
  }

  addController(controller) {
    this.engine.addController(controller);
  }

  render() {

    let { height, width } = Dimensions.get('window');

    return(
      <Controller onLoad={this.addController.bind(this)}>

        <Img
          style={{
            position: 'absolute',
            height,
            width
          }}
          resizeMode='contain'
          source={require('../levels/01/background.png')}
        />

        {isWeb ? (
          <canvas style={{
            flex: 1
          }} ref={(canvas) => this.onCreateContext(canvas)}/>
        ) : (
          <GLView
            style={{ flex: 1 }}
            onContextCreate={(context) => this.onCreateContext(context)}
          />
        )}

        <Img
          style={{
            position: 'absolute',
            height,
            width
          }}
          resizeMode='contain'
          source={require('../levels/01/overlay.png')}
        />

      </Controller>
    );
  }
}



export default Game;

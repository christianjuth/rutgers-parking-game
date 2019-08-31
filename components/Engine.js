export default class Engine{

  constructor({ map, player, computers, speed }) {
    this.player = Object.assign({}, player);
    this.computers = computers.slice();
    this.map = map;
    this.speed = speed;
  }

  step(ms) {
    if(!this.controller) return;

    // assume 60 frames per second
    // as the ideal time betwen frames
    let baseTime = 1000 / 60,
    // actual time since last step
        stepTime = ms / baseTime,
    // distance to move objects
        distance = this.speed * stepTime;

    this.computers.forEach(c => {
      this.moveComputer(c, distance);
    });
    let { move } = this.controller;
    this.movePlayer(this.player, move, distance);
  }

  addController(controller) {
    this.controller = controller;
  }

  getState() {
    return {
      player: this.player,
      computers: this.computers
    };
  }

  movePlayer(player, move = '', distance) {
    if(move == '') return;
    let loc = Object.assign({}, player.loc);

    // up arrow
    if (move == 'u'){
      if(loc.direction !== 'n')
        loc.y -= 1;
      else
        loc.y -= distance;
      loc.x = Math.round(loc.x);
      loc.direction = 'n';
    }

    // down arrow
    else if (move == 'd'){
      if(loc.direction !== 's')
        loc.y += 1;
      else
        loc.y += distance;
      loc.x = Math.round(loc.x);
      loc.direction = 's';
    }
    // left arrow
    else if (move == 'l'){
      if(loc.direction !== 'w')
        loc.x -= 1;
      else
        loc.x -= distance;
      loc.y = Math.round(loc.y);
      loc.direction = 'w';
    }

    // right arrow
    else if (move == 'r'){
      if(loc.direction !== 'e')
        loc.x += 1;
      else
        loc.x += distance;
      loc.y = Math.round(loc.y);
      loc.direction = 'e';
    }

    // validate move
    if(!this.willColide(loc)){
      player.loc = loc;
    }
  }

  moveComputer(player, distance) {
    let origin = player.loc,
        dest = player.points[0],
        move;

    let yDiff = origin.y - dest.y,
        xDiff = origin.x - dest.x;

    if(yDiff > 0 && Math.abs(yDiff) > distance)
      move = 'u';
    else if(yDiff < 0 && Math.abs(yDiff) > distance)
      move = 'd';
    else if(xDiff > 0 && Math.abs(xDiff) > distance)
      move = 'l';
    else if(xDiff < 0 && Math.abs(xDiff) > distance)
      move = 'r';
    else{
      // shift points and restart function
      player.points.push(player.points.shift())
      // this.moveComputer(player, distance);
      return;
    }

    this.movePlayer(player, move, distance);
  }

  willColide(loc) {
   let { x, y } = loc,
       map = this.map,
       firstCord = Object.assign({}, loc),
       secondCord = Object.assign({}, loc),
       height = map.length,
       width = map[0].length;

   try{
     if(loc.direction == 'n'){
       firstCord.y = Math.floor(y);
       secondCord.y = Math.floor(secondCord.y) + 1;
     }
     else if(loc.direction == 's'){
       firstCord.y = Math.ceil(y) - 1;
       secondCord.y = Math.ceil(secondCord.y);
     }
     else if(loc.direction == 'e'){
       firstCord.x = Math.ceil(x) - 1;
       secondCord.x = Math.ceil(secondCord.x);
     }
     else{
       firstCord.x = Math.floor(x);
       secondCord.x = Math.floor(secondCord.x) + 1;
     }

     if([1, undefined, null].includes(map[firstCord.y][firstCord.x]))
       return true;
     if([1, undefined, null].includes(map[secondCord.y][secondCord.x]))
       return true;
   } catch(e) {
     return true;
   }

   return false;
  }

}

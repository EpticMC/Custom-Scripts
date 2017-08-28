(function() {

  /////////////////////////////////////
  //---------------------------------//
  // Copyright (c) 2017 NullDev Ltd. //
  //---------------------------------//
  /////////////////////////////////////

  var Ball, Brick, Game, Paddle;
  Paddle = (function() {
    function Paddle(config) {
      this.config      = config;
      this.context     = this.config.context;
      this.canvas      = this.config.canvas;
      this.move_amount = this.config.move_amount || (this.canvas.width / 32);
      this.width       = this.config.width  || (this.canvas.width  / 8);
      this.height      = this.config.height || (this.canvas.height / 30);
      this.x           = this.canvas.width / 2;
      this.y           = this.canvas.height - (this.height / 2);
      this.score       = 0;
      this.lives       = 3;
    }

    Paddle.prototype.update = function(leftPressed, rightPressed) {
      if (leftPressed) this.x -= this.move_amount;
      else if (rightPressed) this.x += this.move_amount;
      if (this.x + (this.width / 2) > this.canvas.width) return this.x = this.canvas.width - (this.width / 2);
      else if (this.x - (this.width / 2) < 0) return this.x = 0 + (this.width / 2);
    };

    Paddle.prototype.draw = function() {
      this.context.fillStyle = "rgba(128,128,128,.8)";
      return this.context.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    };
    return Paddle;

  })();

  Ball = (function() {

    function Ball(config) {
    
      this.config           = config;
      this.context          = this.config.context;
      this.canvas           = this.config.canvas;
      this.radius           = this.config.radius    || 5;
      this.max_speed        = this.config.max_speed || 8;
      this.max_bounce_angle = this.config.max_bounce_angle || (5 * Math.PI / 12);
      this.x                = this.canvas.width  / 2;
      this.y                = this.canvas.height / 2;
      this.width            = 2 * this.radius;
      this.height           = 2 * this.radius;
      this.use_physics      = this.config.use_physics || 1;
      this.dx               = 0;
      this.dy               = this.max_speed;
      this.was_bad          = false;
      this.is_dead          = false;
    }

    Ball.prototype.update = function(paddle, bricks) {

      var b_y, bottom, bounce_angle, brick, horizontal, is_bad, left, normalized_relative_intersection_x, 
      overlap, overlap2d, relative_intersect_x, right, sx, sy, top, vertical, _i, _len, _ref, _ref1, _results;

      if (this.dx > this.max_speed) this.dx = this.max_speed;
      else if (this.dx < 0 && this.dx < -this.max_speed) this.dx = -this.max_speed;
      if (this.dy > this.max_speed) this.dy = this.max_speed;
      else if (this.dy < 0 && this.dy < -this.max_speed) this.dy = -this.max_speed;
      this.x += this.dx;
      this.y += this.dy;
      is_bad = false;
      if (this.x >= this.canvas.width || this.x <= 0) {
        is_bad = true;
        this.x -= 2 * this.dx;
        this.dx = -this.dx;
      }
      if (this.y <= 0) {
        is_bad = true;
        this.y -= 2 * this.dy;
        this.dy = -this.dy;
      }
      if (this.y >= this.canvas.height) {
        this.is_dead = true;
        return true;
      }
      if (is_bad && this.was_bad) {
        this.x       = this.canvas.width  / 2;
        this.y       = this.canvas.height / 2;
        this.dx      = this.max_speed;
        this.dy      = this.max_speed;
        this.was_bad = false;
        this.is_bad  = false;
      }
      this.was_bad = is_bad;

      overlap = function(ax, aw, bx, bw) { return !((ax + aw) <= bx || ax >= (bx + bw)); };

      overlap2d = function(ax, ay, aw, ah, bx, b_y, bw, bh) { return overlap(ax, aw, bx, bw) && overlap(ay, ah, b_y, bh); };

      overlap = overlap2d(this.x, this.y, this.radius, this.radius, paddle.x - (paddle.width / 2), paddle.y - (paddle.height / 2), paddle.width, paddle.height);

      if (overlap) {
        if (this.use_physics === 1) {
          this.y  = 2 * paddle.y - (this.y + this.radius) - this.height;
          this.dy = -this.dy;
          this.dx = ((this.x + (this.radius * 0.5)) - (paddle.x + (paddle.width / 2))) * 4 / paddle.width;
          if (this.x > paddle.x) this.dx = -this.dx;
        } 
        else if (this.use_physics === 2) {
          relative_intersect_x = (paddle.x + (paddle.width / 2)) - this.x;
          normalized_relative_intersection_x = relative_intersect_x / (paddle.width / 2);
          bounce_angle = normalized_relative_intersection_x * this.max_bounce_angle;
          this.dx = Math.cos(bounce_angle) * this.max_speed;
          this.dy = -1 * Math.sin(bounce_angle) * this.max_speed;
        }
      }
      _results = [];
      for (_i = 0, _len = bricks.length; _i < _len; _i++) {
        brick = bricks[_i];
        if (!brick.dead) {
          sx         = brick.x;
          left       = sx - (brick.width / 2);
          right      = sx + (brick.width / 2);
          horizontal = (left <= (_ref = this.x) && _ref <= right);
          sy         = brick.y;
          top        = sy - (brick.height / 2);
          bottom     = sy + (brick.height / 2);
          vertical   = (top <= (_ref1 = this.y) && _ref1 <= bottom);
          if (horizontal && vertical) {
            brick.dead = true;
            this.dy = -this.dy;
            b_y = Math.floor((this.y + this.radius * 0.5 - (brick.y - (brick.height / 2))) - brick.height);
            if (b_y === 0) {
              if (this.dy < 0) this.dy = -1 * this.max_speed;
              else this.dy = this.max_speed;
            }
            paddle.score += 100;
            if (this.config.use_NLGame) _results.push(NLGame.score("player", paddle.score));
            else _results.push(void 0);
          } 
          else _results.push(void 0);
        } 
        else _results.push(void 0);
      }
      return _results;
    };

    Ball.prototype.draw = function() {
      this.context.fillStyle = "rgba(255, 255, 255, 1)";
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      this.context.closePath();
      return this.context.fill();
    };

    return Ball;

  })();

  Brick = (function() {

    function Brick(config) {
      this.config  = config;
      this.context = this.config.context;
      this.canvas  = this.config.canvas;
      this.width   = this.config.width;
      this.height  = this.config.height;
      this.color   = this.config.color;
      this.x       = this.config.x;
      this.y       = this.config.y;
      this.dead    = false;
    }

    Brick.prototype.update = function() { if (!this.dead) return true; };

    Brick.prototype.draw = function() {
      if (!this.dead) {
        this.context.fillStyle = this.color;
        return this.context.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
      }
    };

    return Brick;

  })();

  Game = (function() {

    function Game(config) {
      this.config = config;
      this.canvas = null;
      this.bricks = [];
      this.ball   = null;
      this.paddle = null;

      this.spacePressed = this.leftPressed = this.upPressed = this.rightPressed = this.downPressed = this.zPressed = this.aPressed = null;
    }

    Game.prototype.main = function() {
      var moveMouse, _this = this;
      this.create_canvas();
      if (!this.config.use_NLGame || !NLGame.gameIsReplay) {
        this.add_key_observers();
        moveMouse = function(event) {
          var x, y;
          if (!event) {
            event = window.event;
            x = event.event.offsetX;
            y = event.event.offsetY;
          } 
          else {
            x = event.pageX - _this.canvas.offsetLeft;
            y = event.pageY - _this.canvas.offsetTop;
          }
          return _this.paddle.x = x;
        };
        document.onmousemove = moveMouse;
      }
      if (this.config.use_NLGame) NLGame.updateMouse = function(x, y) { return _this.paddle.x = x; };
      return this.start_new_game();
    };

    Game.prototype.start_new_game = function() {
      var config;
      delete this.ball;
      delete this.paddle;
      delete this.bricks;
      if (this.config.use_NLGame) {
        NLGame.start();
        NLGame.gameData = {};
        NLGame.gameData.pause = false;
      }
      this.spawn_bricks();
      this.spawn_ball();
      config = { context: this.context, canvas: this.canvas, debug: this.config.debug, use_NLGame: this.config.use_NLGame };
      this.paddle = new Paddle(config);
      return this.update();
    };

    Game.prototype.spawn_bricks = function() {
      var brick, brick_colors, brick_columns, brick_height, brick_rows, brick_start_y, brick_width, config, x, xpos, y, ypos, _i, _results;
      this.bricks   = [];
      brick_start_y = 40;
      brick_width   = 20;
      brick_height  = 20;
      brick_rows    = 5;
      brick_columns = Math.round(this.canvas.width / brick_width);
      brick_colors  = ["hsl(  0, 100%, 50%)", "hsl( 60, 100%, 50%)", "hsl(120, 100%, 50%)", "hsl(180, 100%, 50%)", "hsl(240, 100%, 50%)", "hsl(300, 100%, 50%)"];
      _results      = [];
      for (y = _i = 0; 0 <= brick_rows ? _i <= brick_rows : _i >= brick_rows; y = 0 <= brick_rows ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (x = _j = 0; 0 <= brick_columns ? _j <= brick_columns : _j >= brick_columns; x = 0 <= brick_columns ? ++_j : --_j) {
            xpos = x * brick_width;
            ypos = y * brick_height + brick_start_y;
            config = {
              x: xpos,
              y: ypos,
              width: brick_width,
              height: brick_height,
              color: brick_colors[y],
              context: this.context,
              canvas: this.canvas,
              use_NLGame: this.config.use_NLGame
            };
            brick = new Brick(config);
            _results1.push(this.bricks.push(brick));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Game.prototype.spawn_ball = function() {
      var config;
      config = {
        context: this.context,
        canvas: this.canvas,
        debug: this.config.debug,
        use_NLGame: this.config.use_NLGame,
        radius: 5,
        max_speed: 8,
        dx: 0,
        dy: 0
      };
      return this.ball = new Ball(config);
    };

    Game.prototype.reset = function() {
      this.terminate_run_loop = true;
      return this.clear_screen();
    };

    Game.prototype.update = function() {
      var callback, _this = this;
      callback = (function() { return _this.update(); });
      if (this.paddle.lives === 0) {
        if (this.config.use_NLGame) NLGame.gameData.pause = true;
        this.context.fillStyle = "rgba(255, 255, 255, 1)";
        this.context.font = "bold 70px sans-serif";
        this.context.fillText("GAME OVER", this.canvas.width / 2 - 210, this.canvas.height / 2 + 50);
        this.context.font = "bold 24px sans-serif";
        this.context.fillText("Press 'z' to play again.", this.canvas.width / 2 - 115, this.canvas.height / 2 + 100);
        if (this.zPressed) {
          this.start_new_game();
          return;
        }
        window.setTimeout(callback, 1000 / 30);
        return;
      }
      this.paddle.update(this.leftPressed, this.rightPressed);
      this.ball.update(this.paddle, this.bricks);
      if (this.ball.is_dead) {
        this.paddle.lives -= 1;
        this.ball.is_dead = false;
        if (this.paddle.lives > 0) {
          if (this.config.use_NLGame) NLGame.score("computer", (this.paddle.config.lives || 3) - this.paddle.lives);
          this.spawn_ball();
        }
      }
      this.draw();
      return window.setTimeout(callback, 1000 / 30);
    };

    Game.prototype.draw = function() {
      var brick, living_bricks, _i, _len, _ref;
      this.clear_screen();
      this.context.fillStyle = "rgba(0, 0, 0,1)";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      living_bricks = 0;
      _ref = this.bricks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        brick = _ref[_i];
        if (!brick.dead) {
          living_bricks += 1;
          brick.draw();
        }
      }
      if (living_bricks === 0) this.spawn_bricks();
      this.ball.draw();
      this.paddle.draw();
      this.context.fillStyle = "rgba(255, 0, 0, 1)";
      this.context.font = "bold 12px sans-serif";
      this.context.fillText("score: " + this.paddle.score, 5, 15);
      return this.context.fillText("lives: " + this.paddle.lives, 100, 15);
    };

    Game.prototype.create_canvas = function() {
      this.canvas = document.getElementsByTagName("canvas")[0];
      return this.context = this.canvas.getContext("2d");
    };

    Game.prototype.clear_screen = function() {
      this.context.fillStyle = "rgba(0, 0, 0, 1)";
      return this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    Game.prototype.add_key_observers = function() {
      var _this = this;

      document.addEventListener("keydown", function(e) {
        switch (e.keyCode) {
          case 32: return _this.spacePressed = true;
          case 37: return _this.leftPressed  = true;
          case 38: return _this.upPressed    = true;
          case 39: return _this.rightPressed = true;
          case 40: return _this.downPressed  = true;
          case 90: return _this.zPressed     = true;
          case 65: return _this.aPressed     = true;
        }
      }, false);

      return document.addEventListener("keyup", function(e) {
        switch (e.keyCode) {
          case 27: return _this.reset();
          case 32: return _this.spacePressed = false;
          case 37: return _this.leftPressed  = false;
          case 38: return _this.upPressed    = false;
          case 39: return _this.rightPressed = false;
          case 40: return _this.downPressed  = false;
          case 90: return _this.zPressed     = false;
          case 65: return _this.aPressed     = false;
        }
      }, false);
    };

    return Game;

  })();

  $(document).ready(function() {
    var nl_conf, NullDev_x_Konami;
    nl_conf = { debug: false, use_NLGame: typeof NLGame !== "undefined" && NLGame !== null };
    NullDev_x_Konami = new Game(nl_conf);
    return NullDev_x_Konami.main();
  });

}).call(this);

var radian = Math.PI / 180.0;

var KEY_SPACE = 32;
var KEY_X = 88;
var KEY_Z = 90;
var KEY_Q = 81;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var Game = (function () {
    function Game(element) {
        var _this = this;
        this.element = element;
        this.element.width = 600;
        this.element.height = 400;

        this.own = new Own();
        this.context = this.element.getContext('2d');
        this.keyBuffer = new Array();
        this.canJumpFlag = false;
        this.canJumpFlag = true;
        this.chain = new Array(3);
        this.bulletCount = 0;
        this.bulletNum = 128;
        this.bullet = new Array();
        for (var i = 0; i < this.bulletNum; i++) {
            this.bullet[i] = new Bullet();
        }
        this.wall = new Array(150);
        this.lastWall = 0;
        this.onTwitterButton = 0;

        this.image = new Image();
        this.image.src = "images/image.png";

        this.Init();

        setTimeout(function () {
            _this.Move();
        }, 1000.0 / 60);
    }
    Game.prototype.Init = function () {
        this.gameMode = 0;
        this.counter = 0;
        this.invincibleCounter = 0;
        this.point = 0;
        this.chainCount = 1;
        this.chainNum = 0;
        this.chainNoticeCount = 0;
        this.lastBulletMode = -1;
        this.own.Init(50, 100);
        this.InitWall();
        for (var i = 0; i < this.bulletNum; i++) {
            this.bullet[i].status = false;
        }
        for (var i = 0; i < 3; i++) {
            this.chain[i] = 3;
        }
    };

    Game.prototype.InitWall = function () {
        this.wall[0] = Math.floor(Math.random() * 50 + 60);
        for (var i = 1; i < 150; i++)
            this.SetWall(i);
    };

    Game.prototype.SetWall = function (line) {
        var last = this.wall[line - 1];
        var rand = Math.floor(Math.random() * 10);
        switch (this.lastWall) {
            case -1:
                if (rand < 3)
                    this.lastWall = 1;
                if (rand > 7)
                    this.lastWall = 0;
                break;
            case 0:
                if (rand < 2)
                    this.lastWall = 1;
                if (rand > 7)
                    this.lastWall = -1;
                break;
            case 1:
                if (rand < 3)
                    this.lastWall = -1;
                if (rand > 7)
                    this.lastWall = 0;
                break;
        }
        this.wall[line] = last + this.lastWall;
        if (this.wall[line] < 60)
            this.wall[line] = 60;
        if (this.wall[line] > 89)
            this.wall[line] = 89;
    };

    Game.prototype.Move = function () {
        var _this = this;
        this.counter++;
        this.counter %= 600;

        switch (this.gameMode) {
            case 0:
                if (this.keyBuffer[KEY_SPACE]) {
                    this.gameMode = 1;
                }
                break;

            case 1:
                if (this.keyBuffer[KEY_Q]) {
                    this.gameMode = 0;
                    this.Init();
                }

                if (this.invincibleCounter > 0)
                    this.invincibleCounter--;
                if (this.chainNoticeCount > 0)
                    this.chainNoticeCount--;

                if (this.keyBuffer[KEY_Z] && this.canJumpFlag) {
                    this.own.speed = -20;
                    this.canJumpFlag = false;
                }
                if (!this.keyBuffer[KEY_Z] && this.own.speed < 0) {
                    this.own.speed *= 0.7;
                }
                if (this.own.Move()) {
                    this.canJumpFlag = true;
                }

                if (this.keyBuffer[KEY_X] && this.changeFlag) {
                    this.own.ChangeMode();
                    this.changeFlag = false;
                }
                if (!this.keyBuffer[KEY_X])
                    this.changeFlag = true;
                if (this.keyBuffer[KEY_LEFT])
                    this.own.x -= 4;
                if (this.keyBuffer[KEY_RIGHT])
                    this.own.x += 4;
                if (this.own.x < 40)
                    this.own.x = 40;
                if (this.own.x > 560)
                    this.own.x = 560;

                var interval = 60;
                if (this.point > 10000)
                    interval = 50;
                if (this.point > 100000)
                    interval = 40;
                if (this.point > 1000000)
                    interval = 30;
                if (this.point > 10000000)
                    interval = 20;
                if (this.point > 100000000)
                    interval = 15;

                if (this.counter % interval == 0) {
                    this.shotBullet(Math.floor(Math.random() * 3), 600, Math.floor(Math.random() * 300) + 50, Math.floor(Math.random() * 12 + 3), 180);
                }

                for (var i = 0; i < this.bulletNum; i++) {
                    if (this.bullet[i].status) {
                        this.bullet[i].Move();
                        if (this.invincibleCounter == 0) {
                            if (this.collide(this.own, this.bullet[i])) {
                                this.bullet[i].status = false;
                                this.hit(this.own, this.bullet[i]);
                            }
                        }
                    }
                }

                this.point += this.chainCount;

                break;

            case 2:
                if (this.own.Move()) {
                    this.canJumpFlag = true;
                }

                if (this.keyBuffer[KEY_Q]) {
                    this.gameMode = 0;
                    this.Init();
                }
                break;
        }
        this.Draw();
        setTimeout(function () {
            _this.Move();
        }, 1000.0 / 60);
    };

    Game.prototype.DrawRect = function (x, y, w, h) {
        this.context.fillRect(x - w / 2, y - h / 2, w, h);
    };

    Game.prototype.DrawTitle = function () {
        this.context.drawImage(this.image, 290, 240, 198, 132, 200, 100, 198, 132);
        if (Math.floor(this.counter / 60) % 2 == 0)
            this.context.drawImage(this.image, 234, 372, 168, 20, 215, 250, 168, 20);
    };

    Game.prototype.DrawOwn = function (_x, _y) {
        var x = Math.floor(_x);
        var y = Math.floor(_y);
        switch (this.gameMode) {
            case 1:
                var mode = this.own.mode + 1;
                var frame = Math.floor((this.counter % 60) / 15);
                if (this.own.life == 1)
                    mode = 0;

                this.context.drawImage(this.image, 232, 164 + 6 * this.own.mode, 80, 6, x - 40, 386, 80, 6);
                if (this.invincibleCounter % 2 == 0)
                    this.context.drawImage(this.image, 58 * frame, 100 * mode, 58, 100, x - 29, y - 50, 58, 100);
                break;
            case 2:
                if (this.canJumpFlag) {
                    var frame = Math.floor((this.counter % 120) / 30);
                    this.context.drawImage(this.image, 232, 182, 94, 6, x - 47, 386, 94, 6);
                    this.context.drawImage(this.image, 232, 188, 92, 42, x - 46, y + 6, 92, 42);
                    this.context.drawImage(this.image, 324, 188 + 10 * frame, 12, 10, x, y - 4, 12, 10);
                } else {
                    this.context.drawImage(this.image, 232, 164 + 6 * this.own.mode, 80, 6, x - 40, 386, 80, 6);
                    this.context.drawImage(this.image, 232, 230, 58, 100, x - 29, y - 50, 58, 100);
                }
                break;
        }
    };

    Game.prototype.DrawBullet = function (bullet) {
        var mode = bullet.mode;
        var mode2 = bullet.mode + 2;
        if (mode == 0) {
            mode2--;
            if (bullet.pattern == 0)
                mode2 = 0;
            if (bullet.pattern == 5)
                mode2 = 2;
        }
        var x = Math.floor(bullet.x);
        var y = Math.floor(bullet.y);

        this.context.drawImage(this.image, 232 + 44 * mode2, 120, 44, 44, x - 22, y - 22, 44, 44);
        this.context.drawImage(this.image, 232 + 40 * bullet.pattern, 40 * mode, 40, 40, x - 20, y - 20, 40, 40);
    };

    Game.prototype.DrawLife = function () {
        for (var i = 0; i < this.own.life; i++) {
            this.context.drawImage(this.image, 452, 120, 18, 18, 10 + 20 * i, 40, 18, 18);
        }
    };

    Game.prototype.DrawChainIcon = function () {
        for (var i = 0; i < 3; i++) {
            this.context.drawImage(this.image, 326 + 18 * this.chain[i], 164, 18, 18, 10 + 20 * i, 60, 18, 18);
        }
    };

    Game.prototype.DrawChain = function () {
        if (this.chainNoticeCount != 0) {
            this.context.globalAlpha = 0.01 * this.chainNoticeCount;
            var digit = Math.floor(Math.log(this.chainCount) * Math.LOG10E + 1);
            this.context.drawImage(this.image, 400, 164, 66, 18, 80, 60, 66, 18);
            var temp = this.chainCount;
            for (var i = 0; i < digit; i++) {
                var num = temp % 10;
                temp = Math.floor(temp / 10);
                this.context.drawImage(this.image, 336 + 12 * num, 182, 12, 18, 150 + 12 * (digit - i - 1), 60, 12, 18);
            }
            this.context.globalAlpha = 1;
        }
    };

    Game.prototype.DrawWall = function () {
        var dot = 4;
        var height = this.element.height;
        for (var i = 0; i < 150; i++) {
            this.context.fillStyle = "#87CEFA";
            this.context.fillRect(dot * i, 0, dot, dot * this.wall[i]);
            this.context.fillStyle = "#3CB371";
            this.context.fillRect(dot * i, dot * this.wall[i], dot, height - dot * this.wall[i]);
            this.context.fillStyle = "#00FF7F";
            this.context.fillRect(dot * i, dot * 96, dot, dot * 4);
        }

        this.context.fillStyle = "#000000";
    };

    Game.prototype.ShiftWall = function () {
        this.wall.shift();
        this.SetWall(149);
    };

    Game.prototype.DrawTwitterButton = function () {
        this.context.drawImage(this.image, 336 + 40 * this.onTwitterButton, 200, 40, 40, 550, 10, 40, 40);
    };

    Game.prototype.Draw = function () {
        this.context.clearRect(0, 0, this.element.width, this.element.height);

        switch (this.gameMode) {
            case 0:
                this.DrawWall();
                this.ShiftWall();
                this.context.fillStyle = "rgba(255,255,255,0.4)";
                this.context.fillRect(0, 0, this.element.width, this.element.height);
                this.context.fillStyle = "#000000";
                this.DrawTitle();
                break;

            case 1:
                this.DrawWall();
                this.ShiftWall();
                this.ShiftWall();

                this.DrawOwn(this.own.x, this.own.y);

                for (var i = 0; i < this.bulletNum; i++) {
                    if (this.bullet[i].status) {
                        this.DrawBullet(this.bullet[i]);
                    }
                }
                this.DrawLife();
                this.DrawChainIcon();
                this.DrawChain();
                this.context.font = "24pt 'メイリオ'";
                this.context.fillText(this.point.toString() + "点", 10, 30);
                break;

            case 2:
                this.DrawWall();
                this.DrawOwn(this.own.x, this.own.y);
                this.context.font = "24pt 'メイリオ'";
                this.context.fillText("GAMEOVER", 10, 30);
                this.context.fillText(this.point.toString() + "点", 10, 60);
                this.context.font = "12pt 'メイリオ'";
                this.context.fillText("[Q]でやり直し", 480, 390);
                this.DrawTwitterButton();
                break;
        }
        this.context.font = "6pt 'メイリオ'";
        this.context.fillText("v0.9", 3, 397);
    };

    Game.prototype.shotBullet = function (mode, x, y, speed, rotate) {
        this.bullet[this.bulletCount].Init(mode, x, y, speed, rotate);
        this.bulletCount++;
        this.bulletCount %= this.bulletNum;
    };

    Game.prototype.collide = function (o, b) {
        var hitDistance = o.radius + b.radius;
        var distance = Math.sqrt(Math.pow((o.x - b.x), 2) + Math.pow((o.y - b.y), 2));
        if (distance < hitDistance) {
            return true;
        }
        return false;
    };
    Game.prototype.hit = function (o, b) {
        if (o.mode == b.mode) {
            if (o.life == 1)
                this.point += 1000 * this.chainCount;
            else
                this.point += 100 * this.chainCount;

            var num = this.chainNum;
            var last = 3;
            if (num != 0)
                last = this.chain[num - 1];
            if (last != 3)
                last = (last + 1) % 3;

            if (last == b.mode) {
                if (this.chainNum == 3) {
                    this.chain.shift();
                    this.chain[2] = b.mode;
                } else {
                    this.chain[num] = b.mode;
                    this.chainNum++;
                }
            } else {
                this.chainCount = 1;
                this.chainNum = 1;
                this.chain[0] = b.mode;
                this.chain[1] = this.chain[2] = 3;
            }
            if (this.chainNum == 3) {
                this.chainCount *= 2;
                this.chainNoticeCount = 100;
            }
            this.lastBulletMode = b.mode + 1;
            this.lastBulletMode %= 3;
        } else {
            this.own.life--;
            this.chainCount = 1;
            this.lastBulletMode = -1;
            if (this.own.life == 0) {
                this.gameMode = 2;
            } else {
                this.invincibleCounter = 120;
                this.chain[0] = this.chain[1] = this.chain[2] = 3;
                this.chainNum = 0;
            }
        }
    };

    Game.prototype.onkeydown = function (e) {
        this.keyBuffer[e.keyCode] = true;
    };

    Game.prototype.onkeyup = function (e) {
        this.keyBuffer[e.keyCode] = false;
    };

    Game.prototype.onblur = function () {
        this.keyBuffer.length = 0;
        this.onTwitterButton = 0;
        this.element.style.cursor = "auto";
    };

    Game.prototype.onclick = function (e) {
        var x = e.clientX - this.element.offsetLeft;
        var y = e.clientY - this.element.offsetTop;

        if (this.gameMode == 2 && x >= 550 && x < 590 && y >= 10 && y < 50) {
            var url = "https://twitter.com/share?text=" + encodeURIComponent("[とつげき愛ちゃん]" + this.point + "点だよー！！！ #とつ愛");
            window.open(url);
        }
    };

    Game.prototype.onmousemove = function (e) {
        var x = e.clientX - this.element.offsetLeft;
        var y = e.clientY - this.element.offsetTop;

        if (this.gameMode == 2 && x >= 550 && x < 590 && y >= 10 && y < 50) {
            this.onTwitterButton = 1;
            this.element.style.cursor = "pointer";
        } else {
            this.onTwitterButton = 0;
            this.element.style.cursor = "auto";
        }
    };
    return Game;
})();

var Own = (function () {
    function Own() {
        this.radius = 20;
    }
    Own.prototype.Init = function (x, y) {
        this.mode = 0;
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.life = 2;
    };

    Own.prototype.Move = function () {
        this.y += this.speed++;
        if (this.y > 340) {
            this.y = 340;
            this.speed = 2;
            return true;
        }
        return false;
    };

    Own.prototype.ChangeMode = function () {
        this.mode++;
        this.mode %= 3;
    };
    return Own;
})();

var Bullet = (function () {
    function Bullet() {
        this.status = false;
        this.radius = 20;
    }
    Bullet.prototype.Init = function (mode, x, y, speed, rotate) {
        this.mode = mode;
        this.pattern = Math.floor(Math.random() * 6);
        if (this.mode == 1)
            this.pattern = Math.floor(Math.random() * 2);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.rotate = rotate;
        this.status = true;
    };

    Bullet.prototype.Move = function () {
        var r = this.rotate * radian;
        this.x += Math.cos(r) * this.speed;
        this.y -= Math.sin(r) * this.speed;
        if (this.x < -this.radius || this.x > 600 + this.radius || this.y < -this.radius || this.y > 400 + this.radius) {
            this.status = false;
        }
    };
    return Bullet;
})();

var g;

window.onload = function () {
    var id = document.getElementById('game');
    g = new Game(id);
};

window.onblur = function () {
    g.onblur();
};

window.onkeydown = function (e) {
    g.onkeydown(e);
};

window.onkeyup = function (e) {
    g.onkeyup(e);
};

window.onclick = function (e) {
    g.onclick(e);
};

window.onmousemove = function (e) {
    g.onmousemove(e);
};

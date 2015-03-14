var canvas;
var tx;
var own_y, enemy_y, ball_x, ball_y;
var key_buf = new Array();
var speed;
var ball_xst, ball_yst;
var point;

window.onload = function() {
	canvas = document.getElementById('pon');
	canvas.width = 500;
	canvas.height = 400;
	tx = canvas.getContext('2d');
	tx.font = "14pt メイリオ"
	own_y = 200;
	enemy_y = 200;
	ball_x = 250;
	ball_y = 200;
	speed = 10;
	ball_xst = ball_yst = false;
	st = true;
	point = 0;
	update();
}

function update() {
	tx.clearRect(0, 0, canvas.width, canvas.height);
	
	if(key_buf[38] && own_y>0) own_y-=15;
	if(key_buf[40] && own_y<400) own_y+=15;
	if(ball_xst) ball_x-=speed;
	else ball_x+=speed;
	if(ball_yst) ball_y-=5;
	else ball_y+=5;
	if(ball_x>460){
		ball_xst=true;
		ball_x=470;
	}
	if(ball_x<40){
		if((own_y+50)>ball_y && (own_y-50)<ball_y && st){
				ball_xst=false;
				ball_x=30;
				speed++;
				point++;
		}
		else st=false;
	}
	if(ball_y>400){
		ball_yst=true;
		ball_y=400;
	}
	if(ball_y<0){
		ball_yst=false;
		ball_y=0;
	}
	tx.fillRect(10,own_y-50,20,100);
	tx.fillRect(470,ball_y-50,20,100);
	tx.fillRect(ball_x-5, ball_y-5,10,10);
	if(ball_x>0)setTimeout(update, 1000/30);
	else lose();
}

function lose() {
	var str = point+"点でした。"
	tx.fillText(str,200, 40);
	tx.font = "8pt メイリオ"
	tx.fillText("F5押して再挑戦",220,60);
}

document.onkeydown = function(e) {
	key_buf[e.keyCode] = true;
}

document.onkeyup = function(e) {
	key_buf[e.keyCode] = false;
}

window.onblur = function() {
	key_buf.lenght = 0;
}
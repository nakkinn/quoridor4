let block=new Array(17);
for(let i=0;i<17;i++)   block[i]=new Array(17);
let ts=60,rs=15,px=50,py=50,mode=0,c=6,r=6;
let dir=[[[-1,0],[1,0]],[[0,-1],[0,1]]],col=['#3a57fd','#f14434','#20992a','#000000'];
let pnum=1,mem=0,start=true,skip=false;
let myturn,turn=0;
let wall=5;
let peer,room,id="";

function setup(){
    createCanvas(windowWidth,windowHeight);

    peer=new Peer({
        key: 'cf1155ef-ab9f-41a3-bd4a-b99c30cc0663',
        debug:1
    });
    peer.on('open',()=>{
        id=peer.id;
        room=peer.joinRoom("room",{
            mode:'sfu'
        });
        room.on('open',()=>{
            pnum=room.members.length+1;
            mem=pnum;
            for(let i=2;i<15;i+=2)  block[i][16]=7;
            if(pnum==1) myturn=true;
            turn=(5-pnum)%4;
        });
        room.on('peerJoin',peerId=>{
            console.log(peerId+"参加");
            mem++;
        });
        room.on('peerLeave',peerId=>{
            console.log(peerId+"退出");
        });
        room.on('data',message=>{
            console.log(message.data);
            receive(message.data);
        });
    });

    for(let i=0;i<17;i++)   for(let j=0;j<17;j++)   block[i][j]=0;
}

function draw(){
    background(255);

    let pc=-1,pr=-1;
    for(let i=0;i<9;i++)    for(let j=0;j<9;j++){
        if(mouseX>i*(ts+rs)+px&&mouseX<i*(ts+rs)+ts+px&&mouseY>j*(ts+rs)+py&&mouseY<j*(ts+rs)+ts+py){
            if(block[i*2][j*2]==7){
                pc=i*2;
                pr=j*2;
            }
            break;
        }
    }

    for(let i=0;i<17;i++)   for(let j=0;j<17;j++)   if(block[i][j]==1)  block[i][j]=0;
    if(pc==-1&&myturn&&start==false)    for(let i=0;i<8;i++)   for(let j=0;j<8;j++){
        if(dist(mouseX,mouseY,ts+i*(ts+rs)+rs/2+px,ts+j*(ts+rs)+rs/2+py)<ts/3){
            if(block[i*2+1][j*2+1]==0&&block[i*2+1+dir[mode][0][0]][j*2+1+dir[mode][0][1]]==0
                &&block[i*2+1+dir[mode][1][0]][j*2+1+dir[mode][1][1]]==0&&wall>0){
                block[i*2+1][j*2+1]=1;
                block[i*2+1+dir[mode][0][0]][j*2+1+dir[mode][0][1]]=1;
                block[i*2+1+dir[mode][1][0]][j*2+1+dir[mode][1][1]]=1;
            }
            break;
        }
    }

    noStroke();
    for(let i=0;i<17;i++)   for(let j=0;j<17;j++){
        if(block[i][j]==1)  fill(150);
        else if(block[i][j]>=8&&block[i][j]<=11) fill(col[block[i][j]-8]);
        else    fill(255);
        if(i%2==0&&j%2==0)  fill(200);
        if(block[i][j]==7&&myturn){
            fill("#ffcc88");
            if(i==pc&&j==pr)    fill('#ff7700');
        }
        rect(ts*int((i+1)/2)+rs*int(i/2)+px,ts*int((j+1)/2)+rs*int(j/2)+py,(i%2)*rs+((i+1)%2)*ts,(j%2)*rs+((j+1)%2)*ts);

        if(block[i][j]>=3&&block[i][j]<=6){
            fill(col[block[i][j]-3])
            circle(ts*int((i+1)/2)+rs*int(i/2)+ts/2+px,ts*int((j+1)/2)+rs*int(j/2)+ts/2+py,ts*0.7);
        }
    }

    if(turn==0) strokeWeight(12);    else    strokeWeight(4);
    stroke(col[(-1+pnum)%4]);
    line(px,py+9*ts+8*rs+10,px+9*ts+8*rs,py+9*ts+8*rs+10);
    if(turn==1) strokeWeight(12);    else    strokeWeight(4);
    stroke(col[(0+pnum)%4]);
    if((0+pnum)%4<mem)   line(px+9*ts+8*rs+10,py,px+9*ts+8*rs+10,py+9*ts+8*rs);
    if(turn==2) strokeWeight(12);    else    strokeWeight(4);
    stroke(col[(1+pnum)%4]);
    if((1+pnum)%4<mem)   line(px,py-10,px+9*ts+8*rs,py-10);
    if(turn==3) strokeWeight(12);    else    strokeWeight(4);
    stroke(col[(2+pnum)%4]);
    if((2+pnum)%4<mem)   line(px-10,py,px-10,py+9*ts+8*rs);

    noStroke(),fill(0),textSize(30);
    text(wall,700,760);
}

function mouseClicked(){
    let flag=true;

    if(myturn){
        if(start==true)    start=false;
        for(let i=0;i<9;i++)    for(let j=0;j<9;j++){
            if(mouseX>i*(ts+rs)+px&&mouseX<i*(ts+rs)+ts+px&&mouseY>j*(ts+rs)+py&&mouseY<j*(ts+rs)+ts+py){
                if(block[i*2][j*2]==7){
                    block[i*2][j*2]=pnum+2;
                    block[c][r]=0;
                    room.send(pnum+',m,'+c+','+r+','+i*2+','+j*2);
                    c=i*2;
                    r=j*2;
                    if(r==0)    skip=true;
                    myturn=false;
                    turn=(turn+1)%4;
                    flag=false;
                }
                break;
            }
        }

        if(flag)    for(let i=0;i<8;i++)   for(let j=0;j<8;j++){
            if(dist(mouseX,mouseY,ts+i*(ts+rs)+rs/2+px,ts+j*(ts+rs)+rs/2+py)<ts/3){
                if(block[i*2+1][j*2+1]==1&&block[i*2+1+dir[mode][0][0]][j*2+1+dir[mode][0][1]]==1
                &&block[i*2+1+dir[mode][1][0]][j*2+1+dir[mode][1][1]]==1){
                    block[i*2+1][j*2+1]=pnum+7;
                    block[i*2+1+dir[mode][0][0]][j*2+1+dir[mode][0][1]]=pnum+7;
                    block[i*2+1+dir[mode][1][0]][j*2+1+dir[mode][1][1]]=pnum+7;
                    room.send(pnum+',w,'+mode+','+(i*2+1)+','+(j*2+1));
                    myturn=false;
                    wall--;
                    turn=(turn+1)%4;
                }
                break;
            }
        }
    }
}

function keyPressed(){
    if(key=='r'){
        reset();
        room.send("reset");
    }
    if(key=='s'){
        skip=true;
        room.send(pnum+",3")
        myturn=false;
        turn=(turn+1%4);
    }
    if(key=='c'){
        room.send("close");
    }
    if(keyCode==SHIFT)  mode=(mode+1)%2;
}

function reset(){
    wall=5;
    for(let i=0;i<17;i++)   for(let j=0;j<17;j++){
        block[i][j]=0;
    }
    for(let i=2;i<15;i+=2)  block[i][16]=7;
    pnum++;
    if(pnum==5) pnum=1;
    if(pnum==1) myturn=true;
    else    myturn=false;
    turn=(5-pnum)%4;
    c=6;
    r=6;
    let tem=col[3];
    for(let i=3;i>0;i--)    col[i]=col[i-1];
    col[0]=tem;
    start=true;
    skip=false;
}

function mouseWheel(){
    mode=(mode+1)%2;
}

function enable(){

    if(start==false){
        let d=[[0,-1],[1,0],[0,1],[-1,0]];
        for(let i=0;i<17;i++)   for(let j=0;j<17;j++)   if(block[i][j]==7)  block[i][j]=0;
        for(let i=0;i<4;i++){
            if(ins(c+d[i][0],r+d[i][1])){
                if(block[c+d[i][0]][r+d[i][1]]==0){
                    if(block[c+d[i][0]*2][r+d[i][1]*2]==0)  block[c+d[i][0]*2][r+d[i][1]*2]=7;
                    else{
                        if(ins(c+d[i][0]*3,c+d[i][1]*3)){
                            if(block[c+d[i][0]*3][r+d[i][1]*3]==0&&block[c+d[i][0]*4][r+d[i][1]*4]==0)  block[c+d[i][0]*4][r+d[i][1]*4]=7;
                            else    if(block[c+d[i][0]*3][r+d[i][1]*3]!=0){
                                let cc=c+d[i][0]*2,rr=r+d[i][1]*2;
                                for(let j=0;j<4;j++){
                                    if(ins(cc+d[j][0],rr+d[j][1])){
                                        if(block[cc+d[j][0]][rr+d[j][1]]==0&&block[cc+d[j][0]*2][rr+d[j][1]*2]==0)
                                            block[cc+d[j][0]*2][rr+d[j][1]*2]=7;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function ins(cc,rr){
    if(cc>=0&&cc<17&&rr>=0&&rr<17)  return true;
    else    return false;
}

function receive(s){
    if(s=="reset")  reset();
    else if(s=="close") room.close();
    else    cmd(s);
}

function cmd(s){
    s=s.split(',');
    s[0]=int(s[0]);
    if(s[1]=='m'){
        block[ conc(s[2],s[3],s[0]) ][ conr(s[2],s[3],s[0]) ]=0;
        block[ conc(s[4],s[5],s[0]) ][ conr(s[4],s[5],s[0]) ]=s[0]+2;
        enable();
        turn=(turn+1)%4;
    }
    if(s[1]=='w'){
        for(let i=2;i<5;i++)    s[i]=int(s[i]);
        block[ conc(s[3],s[4],s[0]) ][ conr(s[3],s[4],s[0]) ]=s[0]+7;
        if((pnum+4-s[0])%4!=2) s[2]=(s[2]+1)%2;
        if(s[2]==0){
            block[ conc(s[3],s[4],s[0])-1 ][ conr(s[3],s[4],s[0]) ]=s[0]+7;
            block[ conc(s[3],s[4],s[0])+1 ][ conr(s[3],s[4],s[0]) ]=s[0]+7;
        }else{
            block[ conc(s[3],s[4],s[0]) ][ conr(s[3],s[4],s[0])-1 ]=s[0]+7;
            block[ conc(s[3],s[4],s[0]) ][ conr(s[3],s[4],s[0])+1 ]=s[0]+7;
        }
        enable();
        turn=(turn+1)%4;
    }
    if(s[1]=='s'||s[1]=='3'){
        turn=(turn+1)%4;
    }
    if(s[1]=='3')   wall++;

    if(s[0]%4+1==pnum)    myturn=true;
    if(myturn&&skip){
        room.send(pnum+",s")
        myturn=false;
        turn=(turn+1%4);
    }
    return s;
}

function conc(c,r,n){
    if((pnum+4-n)%4==1) return 16-r;
    if((pnum+4-n)%4==2) return 16-c; 
    if((pnum+4-n)%4==3) return r;
}

function conr(c,r,n){
    if((pnum+4-n)%4==1) return c;
    if((pnum+4-n)%4==2) return 16-r; 
    if((pnum+4-n)%4==3) return 16-c;
}

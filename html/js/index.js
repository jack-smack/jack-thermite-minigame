const gameGrid = document.getElementById('gameGrid');

const fireLayer = document.getElementById('fireLayer');
window.onresize = setupFireLayer;
setupFireLayer();
function setupFireLayer(){
    fireLayer.style.left = `${gameGrid.getBoundingClientRect().left}px`;
    fireLayer.style.top = `${gameGrid.getBoundingClientRect().top}px`;
}


const scoreText = document.getElementById("score");
const targetText = document.getElementById("targetscore");

const timerLine = document.getElementById("timer-line");

const gameGridData = [
    [1,2,1,2,1,2,1],//0
    [1,2,1,2,1,2,1],//1
    [1,2,1,2,1,2,1],//2
    [1,2,1,2,1,2,1],//3
    [1,2,1,1,2,2,2],//4
];

let gameStarted = false;

let DEBUGShowNumbers = false;

//Swapping
let draggedTile = null;
let draggedPosition = null;
let swapping=false;

//Score and time
let timeLeft = 60;
let score = 0;
let matchCombo = 1;


generateRandomGrid();
function generateRandomGrid(){
    for(let i = 0; i<5; i++){
        for(let j=0; j<7;j++){
            gameGridData[i][j] = Math.floor((Math.random() * (6-1)) + 1); //1 is Al 2 is FeO. 0 is EMPTY
        }
    }
}
//1 Al
//2 FeO
//3 Cu
//4 Mg
//5 Ti

setInterval(timer, 1000);
function timer(){
    if(!gameStarted){return;}
    timeLeft-=1;
    let progress = timeLeft/60;
    timerLine.style.width=`${progress*100}%`;
    if(timeLeft<=0){
        setTimeout(()=>{
            gameStarted=false;
            timeLeft=60;
            document.getElementById('frame').style.display='none';
            $.post(`https://${GetParentResourceName()}/finishgame`, JSON.stringify({'score': score}));
        },1500)
        //times up
    }
}
function renderGrid(){
    gameGrid.innerHTML = '';

    for(let i = 0; i<5; i++){
        for(let j=0; j<7;j++){
            const tile = createTile(i, j);
            gameGrid.appendChild(tile);
        }
    }
}
function AnyTilesFalling(){
    return Array.from(gameGrid.children).some(tile=>tile.classList.contains('falling'));
}
function AnyMatches(){
    for(let i = 0; i<5; i++){
        for(let j=0; j<7;j++){
            let val = gameGridData[i][j];
            let rightAdj = null;
            let leftAdj = null;
            let topAdj = null;
            let bottomAdj = null;
            if(j<6){ rightAdj = gameGridData[i][j+1];}
            if(j>0){ leftAdj = gameGridData[i][j-1];}
            if(i<4){ bottomAdj = gameGridData[i+1][j];}
            if(i>0){ topAdj = gameGridData[i-1][j];}
            if(val!=0 &&(val==rightAdj && val==leftAdj)){
                return true;
            }
            if(val!=0 &&(val==topAdj && val==bottomAdj)){
                return true;
            }
        }
    }
    return false;
}
window.requestAnimationFrame(gameLoop);
function gameLoop(){
    if(!gameStarted){ window.requestAnimationFrame(gameLoop); return;}
    //tiles still falling do not execute any logic (until animations are done)
    if(AnyTilesFalling()){
        window.requestAnimationFrame(gameLoop);
        return;
    }

    renderGrid(); //animations done render new positions
    if(timeLeft<=0){return;}
    //only render do not execute match 3 processing if swapping happening
    if(swapping){
        matchCombo=1;
        window.requestAnimationFrame(gameLoop);
        return;
    }
    //show grid after rendering then evaluate matches
    let timeOut = AnyMatches()?250:0;
    setTimeout(()=>{
        //evaluate any match 3s
        for(let i = 0; i<5; i++){
                for(let j=0; j<7;j++){
                    let val = gameGridData[i][j];
                    let rightAdj = null;
                    let leftAdj = null;
                    let topAdj = null;
                    let bottomAdj = null;
                    if(j<6){ rightAdj = gameGridData[i][j+1];}
                    if(j>0){ leftAdj = gameGridData[i][j-1];}
                    if(i<4){ bottomAdj = gameGridData[i+1][j];}
                    if(i>0){ topAdj = gameGridData[i-1][j];}
                    if(val!=0 &&(val==rightAdj && val==leftAdj)){
                        //need to check if theres even more tiles on left and right
                        let matchPos = [
                            {row:i, col:j},
                            {row:i, col:j+1},
                            {row:i, col:j-1}
                        ];
                        //from each tile explore in all directions to find same tile
                        if(j+2<=6){
                            if(gameGridData[i][j+2]==val){
                                matchPos.push({row:i, col:j+2});
                                if(j+3<=6){
                                    if(gameGridData[i][j+3]==val){
                                        matchPos.push({row:i, col:j+3});
                                        if(j+4<=6){
                                            if(gameGridData[i][j+4]==val){
                                                matchPos.push({row:i, col:j+4});
                                                if(j+5<=6){
                                                    if(gameGridData[i][j+5]==val){
                                                        matchPos.push({row:i, col:j+5});
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if(j-2>=0){
                            if(gameGridData[i][j-2]==val){
                                matchPos.push({row:i, col:j-2});
                                if(j-3<=6){
                                    if(gameGridData[i][j-3]==val){
                                        matchPos.push({row:i, col:j-3});
                                        if(j-4<=6){
                                            if(gameGridData[i][j-4]==val){
                                                matchPos.push({row:i, col:j-4});
                                                if(j-5<=6){
                                                    if(gameGridData[i][j-5]==val){
                                                        matchPos.push({row:i, col:j-5});
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        
                        processMatch(matchPos)
                    }
                    if(val!=0 &&(val==topAdj && val==bottomAdj)){
                        let matchPos = [
                            {row:i+1, col:j},
                            {row:i, col:j},
                            {row:i-1, col:j}
                        ];
                        if(i+2<=4){
                            if(gameGridData[i+2][j]==val){
                                matchPos.push({row:i+2, col:j});
                                if(i+3<=4){
                                    if(gameGridData[i+3][j]==val){
                                        matchPos.push({row:i+3, col:j});
                                    }
                                }
                            }
                        }
                        if(i-2>=0){
                            if(gameGridData[i-2][j]==val){
                                matchPos.push({row:i-2, col:j});
                                if(i-3<=4){
                                    if(gameGridData[i-3][j]==val){
                                        matchPos.push({row:i-3, col:j});
                                    }
                                }
                            }
                        }
                        
                        
                        processMatch(matchPos)
                    }
                }
            }
        setTimeout(()=>{
            processFallingTiles();
            window.requestAnimationFrame(gameLoop);
        }, timeOut);
    }, timeOut)

}
function processMatch(positions){
    //drop tiles down
    //what replaces pos1?
    let multiCombo = 1;
    positions.forEach((pos)=>{
        let scoreAdd = 10*matchCombo*multiCombo;
        score+=scoreAdd;
        scoreText.textContent=`Score: ${score} Last combo: ${matchCombo}`;
        gameGridData[pos.row][pos.col] = 0;
        PopupScoreAdd(pos.row, pos.col, scoreAdd);
        createFireSprite(pos.row, pos.col);
        multiCombo+=1;
    });
    matchCombo+=1;
}
function processFallingTiles(){
    for(let i = 4; i>=0; i--){
        for(let j=6; j>=0;j--){
            if (gameGridData[i][j]==0){
              
                //Process the fall data wise then move corresponding tiles into new location
                ProcessDropDown(j);
            }
        }
    }
}
function DropTile(startPos, endPos){
    tilesDropping=true;
    const tile = gameGrid.children[(startPos.row)*7+startPos.col]; //above
    if(!tile.classList.contains('falling')){
        tile.classList.add('falling');
        tile.style.opacity = 1.0;
        tile.style.transition = 'transform 0.4s ease-out';
        tile.style.transform = `translateY(${((endPos.row+1)-(startPos.row+1))*85}px)`;
        tile.offsetHeight;
        tile.addEventListener('transitionend', () => {
            tile.classList.remove('falling');
            tile.style.transform='';
            tile.style.transition='';
            //once it arrives we can process all new matches
        }, { once: true });
    }   
   
}
function ProcessDropDown(col){
    let numberEmptyTiles = 0;
    for(let i=4; i>=0; i--){
        if(gameGridData[i][col]==0){
            numberEmptyTiles+=1;
        }
    }
    //all tiles move down to fill empty positions
    for(let i=4; i>=0; i--){
        if (gameGridData[i][col]!=0){
            //found tile, is there empty space below it?
            for(let j=4; j>=i; j--){
                if(gameGridData[j][col]==0){
                    //move tile to this position
                    DropTile({row:i, col:col}, {row:j, col:col})
                    gameGridData[j][col] = gameGridData[i][col];
                    gameGridData[i][col]=0;
                }
            }
        }
    }
    //Now the column should have numberEmptyTiles of empty space at top of column. Fill from dropping in out of frame
    for(let i=numberEmptyTiles-1; i>=0;i--){
        gameGridData[i][col] = Math.floor((Math.random() * (6-1)) + 1) //generate random
    }

    //at the end of this, the game data should be ready and animations should be playing. Once they all finish: re-render then check for matches again
}

function PopupScoreAdd(row, col, score){
    const fire = document.createElement('div');
    fire.classList.add('fire');
    fire.style.color="white";
    fire.style.fontStyle='bold';
    fire.style.fontSize="26px";
    fire.textContent = score;
    fire.style.zIndex=3;
    

    // Position the fire sprite relative to the tile's location
    const tile = gameGrid.children[row*7+col];
    const { left, top } = tile.getBoundingClientRect();

    // Adjust for container's position
    const gridRect = gameGrid.getBoundingClientRect();
    fire.style.left = `${left - gridRect.left+25}px`;
    fire.style.top = `${top - gridRect.top+25}px`;
    // Append fire to the game grid
    fireLayer.appendChild(fire);

    // Remove fire after 1 second
    setTimeout(() => fire.remove(), 600);
}
function createFireSprite(row, col) {
    const fire = document.createElement('div');
    fire.classList.add('fire');
    const img = document.createElement("img");
    img.src="assets/Fire.png";
    img.draggable=false;
    img.style.width='100%';
    img.style.height='100%';
    fire.appendChild(img);

    // Position the fire sprite relative to the tile's location
    const tile = gameGrid.children[row*7+col];
    const { left, top } = tile.getBoundingClientRect();
    tile.style.opacity=0.0;


    // Adjust for container's position
    const gridRect = gameGrid.getBoundingClientRect();
    fire.style.left = `${left - gridRect.left-10}px`;
    fire.style.top = `${top - gridRect.top-10}px`;
    // Append fire to the game grid
    fireLayer.appendChild(fire);

    // Remove fire after 1 second
    setTimeout(() => fire.remove(), 600);
}
function createTile(row, col){
    let type = parseInt(gameGridData[row][col]);
    const tile = document.createElement('div');
    tile.classList.add('tile');
    
    const img = document.createElement('img');
    if(type==1){
        img.src='assets/Al.png';
    }
    else if(type==2){
        img.src='assets/FeO.png'
    }
    else if(type==3){
        img.src='assets/Cu.png'
    }
    else if(type==4){
        img.src='assets/Mg.png'
    }
    else if(type==5){
        img.src='assets/Ti.png'
    }
    else{
        img.src="assets/Dust.png"
    }
    img.draggable=false;
    if(!DEBUGShowNumbers){tile.appendChild(img);}
    if(DEBUGShowNumbers){tile.textContent=`(${row},${col})=${type}`;}

    tile.dataset.row=row;
    tile.dataset.col=col;
   

    return tile;
}
let startTile = null;
let dragStartPos = {x:0, y:0};
function findNearestTile(mouseX, mouseY) {
    let closestTile = null;
    let minDistance = 51;

    Array.from(gameGrid.children).forEach((tile) => {
        const rect = tile.getBoundingClientRect();
        const tileCenterX = rect.left + rect.width / 2;
        const tileCenterY = rect.top + rect.height / 2;

        const dist = Math.hypot(mouseX - tileCenterX, mouseY - tileCenterY);
        if (dist < minDistance) {
            minDistance = dist;
            closestTile = tile;
        }
    });
    return closestTile;
}
function isNeighbour(pos1, pos2){
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}
let TryingSwap = false;
function TrySwap(startPosition, endPosition){
    if(!TryingSwap){
        if(gameGridData[startPosition.row] && gameGridData[endPosition.row]){
            TryingSwap=true;
            if(isNeighbour(startPosition, endPosition)){
                let temp = gameGridData[startPosition.row][startPosition.col];
                gameGridData[startPosition.row][startPosition.col] = gameGridData[endPosition.row][endPosition.col];
                gameGridData[endPosition.row][endPosition.col] = temp;
                if(!AnyMatches()){
                    setTimeout(() => {
                        //Reset the swap
                        let temp = gameGridData[endPosition.row][endPosition.col];
                        gameGridData[endPosition.row][endPosition.col] = gameGridData[startPosition.row][startPosition.col];
                        gameGridData[startPosition.row][startPosition.col] = temp;
                        setTimeout(()=>{
                            swapping=false;
                            startTile=null;
                            startPosition=null;
                            TryingSwap=false;
                        }, 200);
        
                    }, 200);
                }else{
                    setTimeout(()=>{
                        swapping=false;
                        startTile=null;
                        startPosition=null;
                        TryingSwap=false;
                    }, 25);
                }
            }else{
                setTimeout(()=>{
                    swapping=false;
                    startTile=null;
                    startPosition=null;
                    TryingSwap=false;
                }, 25);
            }
        }else{
            setTimeout(()=>{
                swapping=false;
                startTile=null;
                startPosition=null;
                TryingSwap=false;
            }, 25);
        }
        
    }
}

document.body.onkeyup = function(e) {
    if (e.key == " " ||
        e.code == "Space" ||      
        e.keyCode == 32      
    ) {
        DEBUGShowNumbers=!DEBUGShowNumbers;
    }
    if(e.key=="Escape"){
        gameStarted=false;
        timeLeft=60;
        document.getElementById('frame').style.display='none';
        $.post(`https://${GetParentResourceName()}/finishgame`, JSON.stringify({'score': score}));
    }
}
gameGrid.addEventListener('mousemove', (event)=>{
    //if mouse is held down find the delta between positions. If past a certain point do swap to that loc
    if(swapping && startTile!=null){
        let currentPos = {x:event.clientX, y:event.clientY};
        let dragVec = {x:currentPos.x-dragStartPos.x, y:currentPos.y-dragStartPos.y};
        let dragMagSquared = dragVec.x*dragVec.x + dragVec.y*dragVec.y;
        if(dragMagSquared>=600){
            //try swap in this dir
            //look at angle with x axis
            let angle = Math.acos(dragVec.x/(Math.sqrt(dragMagSquared)));
            angle = angle*180/Math.PI
            let startPosition = {
                row:parseInt(startTile.dataset.row),
                col:parseInt(startTile.dataset.col)
            };
            let endPosition = {
                row:0,
                col:0
            }
            if(angle<=45){
                //right
                endPosition = {row:startPosition.row, col:startPosition.col+1};
            }
            else if(angle>=135){
                //left
                endPosition = {row:startPosition.row, col:startPosition.col-1};
            }  
            else{
                //up or down
                if(dragVec.y>0){
                    //down
                    endPosition = {row:startPosition.row+1, col:startPosition.col};
                }
                else{
                    //up
                    endPosition = {row:startPosition.row-1, col:startPosition.col};
                }
            }
            TrySwap(startPosition, endPosition);
        }
    }


});
gameGrid.addEventListener('mousedown', (event)=>{
    const nearestStartTile = findNearestTile(event.clientX, event.clientY);
    if(AnyTilesFalling()){return;}
    if(nearestStartTile){
        //console.log("swapping active");
        swapping=true;
        dragStartPos = {x:event.clientX, y:event.clientY};
        startTile = nearestStartTile;
        //document.addEventListener('mouseup', onDrop);
    }
});
window.addEventListener('message', (event) => {
    if (event.data.type === 'startgame') {
        document.getElementById('frame').style.display='flex';
        setupFireLayer();
        timeLeft = 60;
        if(event.data.data){
            if(event.data.data.time){
                timeLeft=event.data.data.time;
            }
            if(event.data.data.target){
                console.log("target: ", event.data.data.target);
                targetText.textContent=("Target: "+ event.data.data.target);
            }
        }
        gameStarted=true;
    }
});
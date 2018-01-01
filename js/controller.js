var objectBalls, ballGeometry, spots, stripes, poolBalls;
var camera, controls, scene, renderer, poolTable, holes, white_Ball, speed, clock, mouse, clockDelta, resistance, direction, cuePosition, firstPocket;
var player1, player2, game, turn, firstShot, hit, pocketed, hitStrength, checkBalls;

function init()
{
    speed = new THREE.Vector3();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    cuePosition = new THREE.Vector3(0,0,0);
    hitStrength = 3;

    //Bool to note firstPocket to set the ball group for both players
    firstPocket = false;

    pocketed = false;

    //Bool to check if the break shot hits.
    firstShot = false;

    checkBalls = false;

    poolBalls = [];

    player1 = new Player("Player1");
    player2 = new Player("Player2");
    game = new Game(player1);

    game.startTurn();
    setCamera();
    setScene();
    setControls();
    render();
}

function setCamera()
{
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 25, 35);
}

function setControls()
{
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = 0.49 * Math.PI;
    controls.minDistance = 10;
    controls.maxDistance = 50;

    document.addEventListener('keypress', onKeyPress);

    direction = camera.position.clone().sub(poolBalls[15].ball.position).normalize()

    function onKeyPress()
    {
        if(event.keyCode == 32)
        {
            shoot();
        }
    }
}

function setScene()
{
    scene = new THREE.Scene();

    createBalls();
    resetBalls();
    setTable();

    var roomGeometry = new THREE.BoxGeometry(200, 80, 200);
    var roomMaterial = [
        new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/textures/wall.jpg'), side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('images/textures/bar.jpg'), side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/textures/floor.jpg'), side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/textures/floor.jpg'), side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/textures/wall.jpg'), side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/textures/wall.jpg'), side: THREE.DoubleSide})
    ];

    var room = new THREE.Mesh(roomGeometry, roomMaterial);
    room.position.set(0,20,0);
    scene.add(room);

    var light1 = new THREE.DirectionalLight(0xFFFACD, 1.2);
    light1.position.set(0, 8, 0);

    var ambientLight = new THREE.AmbientLight(0x404040, 0.8);

    scene.add(light1, ambientLight);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );
}

function createBalls()
{
    ballGeometry = new THREE.SphereGeometry( 0.5, 32, 32 );

    objectBalls = new THREE.Group();
    white_Ball = new THREE.Mesh(ballGeometry, new THREE.MeshPhongMaterial({map : THREE.ImageUtils.loadTexture('images/balls/whiteball.png')}));

    for (var i = 1; i < 16; i++)
    {
        var poolBall = new THREE.Mesh(ballGeometry, new THREE.MeshPhongMaterial({ transparent: false, map: THREE.ImageUtils.loadTexture('images/balls/' + i + 'ball.png') }));
        objectBalls.add(poolBall);
    }

    for (var i = 0; i < objectBalls.children.length; i++)
    {
        if( i < 8)
        {
            var ball = new PoolBall(new THREE.Vector3(0, 0, 0), objectBalls.children[i], "spots");
            poolBalls.push(ball);
        }
        else if (i > 8)
        {
            var ball = new PoolBall(new THREE.Vector3(0, 0, 0), objectBalls.children[i], "stripes");
            poolBalls.push(ball);
        }
        else
        {
            var ball = new PoolBall(new THREE.Vector3(0, 0, 0), objectBalls.children[i]);
            poolBalls.push(ball);
        }
    }

    var whitePoolBall = new PoolBall(new THREE.Vector3(0, 0, 0), white_Ball);
    poolBalls.push(whitePoolBall);
}

function resetBalls()
{
    for (var i = 0; i < poolBalls.length; i++)
    {
        poolBalls[i].ball.visible = true;
        poolBalls[i].speedDirection = new THREE.Vector3(0, 0, 0);
        poolBalls[i].ball.position.y = 0;
        poolBalls[i].collision = 0;
    }

    scene.add(objectBalls);
    scene.add(white_Ball);

    white_Ball.position.z = 10;

    var ballsPosX = [0,-0.5,-1,1.5,0,2,-0.5,0,0.5,1,0.5,-1,1,-1.5,-2];
    var ballsPosZ = [-6,-7,-8,-9,-10,-10,-9,-8,-7,-8,-9,-10,-10,-9,-10];

    for (var i = 0; i < objectBalls.children.length; i++)
    {
        objectBalls.children[i].position.z = ballsPosZ[i];
        objectBalls.children[i].position.x = ballsPosX[i];
        objectBalls.children[i].rotation.x = Math.PI / 2;
    }
}

function resetWhiteBall()
{
    white_Ball.position.z = 10;
    white_Ball.position.x = 0;
    white_Ball.position.y = 0;
    poolBalls[15].speedDirection = new THREE.Vector3(0, 0, 0);
    poolBalls[15].ball.position.y = 0;
    poolBalls[15].collision = 0;
}

function setTable()
{
    poolTable = new THREE.Group();

    var clothMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/textures/cloth.jpg')});
    var clothGeometry = new THREE.BoxGeometry(20,1,40);
    var cloth = new THREE.Mesh(clothGeometry, clothMaterial);
    cloth.position.y = -1;
    poolTable.add(cloth);

    var underSideGeometry = new THREE.BoxGeometry(21, 1, 41);
    var tableMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/textures/mahogany.jpg')});
    var underSide = new THREE.Mesh(underSideGeometry, tableMaterial);
    underSide.position.y = -2;
    poolTable.add(underSide);

    //Set the outer walls and legs
    var xWallGeometry = new THREE.BoxGeometry(2,2,40);
    var zWallGeometry = new THREE.BoxGeometry(21,2,2);
    var tableLegGeometry = new THREE.BoxGeometry(2,20,2.5);

    var wall1 = new THREE.Mesh(xWallGeometry, tableMaterial);
    var wall2 = new THREE.Mesh(xWallGeometry, tableMaterial);
    var wall3 = new THREE.Mesh(zWallGeometry, tableMaterial);
    var wall4 = new THREE.Mesh(zWallGeometry, tableMaterial);

    var leg1 = new THREE.Mesh(tableLegGeometry, tableMaterial);
    var leg2 = new THREE.Mesh(tableLegGeometry, tableMaterial);
    var leg3 = new THREE.Mesh(tableLegGeometry, tableMaterial);
    var leg4 = new THREE.Mesh(tableLegGeometry, tableMaterial);

    wall1.position.set(-11.5,-0.5,0);
    wall2.position.set(11.5,-0.5,0);
    wall3.position.set(0,-0.5,-21.5);
    wall4.position.set(0,-0.5,21.5);

    leg1.position.set(-11.5,-9.5,21.25);
    leg2.position.set(11.5,-9.5,21.25);
    leg3.position.set(11.5,-9.5,-21.25);
    leg4.position.set(-11.5,-9.5,-21.25);

    //Set the inner walls
    var xInnerGeometry = new THREE.BoxGeometry(1,2,16.5);
    var zInnerGeometry = new THREE.BoxGeometry(16,2,1);

    var innerWall1 = new THREE.Mesh(xInnerGeometry, clothMaterial);
    var innerWall2 = new THREE.Mesh(xInnerGeometry, clothMaterial);
    var innerWall3 = new THREE.Mesh(xInnerGeometry, clothMaterial);
    var innerWall4 = new THREE.Mesh(xInnerGeometry, clothMaterial);
    var innerWall5 = new THREE.Mesh(zInnerGeometry, clothMaterial);
    var innerWall6 = new THREE.Mesh(zInnerGeometry, clothMaterial);

    innerWall1.position.set(-10,-0.5,9.5);
    innerWall2.position.set(-10,-0.5,-9.5);
    innerWall3.position.set(10,-0.5,9.5);
    innerWall4.position.set(10,-0.5,-9.5);
    innerWall5.position.set(0,-0.5,-20);
    innerWall6.position.set(0,-0.5,20);

    //Create the pockets and put them in the right position.
    var pocket14Geometry = new THREE.CircleBufferGeometry(2, 32);
    var pocket56Geometry = new THREE.CircleBufferGeometry(1.5, 32);
    var blackMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
    var pocket = new THREE.Mesh(pocket14Geometry, blackMaterial);
    pocket.rotation.x = -Math.PI / 2;
    pocket.position.y = -0.4;
    pocket.position.z = -19.7;
    pocket.position.x = -10;

    var pocket2 = pocket.clone();
    pocket2.position.x = 10;

    var pocket3 = pocket.clone();
    pocket3.position.z = 19.7;

    var pocket4 = pocket3.clone();
    pocket4.position.x = 10;

    var pocket5 = new THREE.Mesh(pocket56Geometry, blackMaterial);
    pocket5.rotation.x = -Math.PI / 2;
    pocket5.position.y = -0.4;
    pocket5.position.z = 0;
    pocket5.position.x = -10.5;

    var pocket6 = pocket5.clone();
    pocket6.position.x = 10.5;

    poolTable.add(wall1, wall2, wall3, wall4, leg1, leg2, leg3, leg4, pocket, pocket2, pocket3, pocket4, pocket5, pocket6, innerWall1, innerWall2, innerWall3, innerWall4, innerWall5, innerWall6);
    scene.add(poolTable);
}

function checkSpeed(ball)
{
    return (ball.speedDirection.x > 0.001 && ball.speedDirection.z > 0.001);
}

function shoot()
{
    //Get the direction the camera is looking in.
    direction = camera.position.clone().sub(poolBalls[15].ball.position).normalize()

    //Check if this is the first time shoot is called. If this is the case fire the cue ball straight at the object balls so this shot cant be a foul.
    if(firstShot === false)
    {
        poolBalls[15].speedDirection.z = -hitStrength;
        firstShot = true;
    }

    //If checkSpeed returns false for all balls, move the whiteball in the direction the camera is looking at, else do nothing.
    else if(!poolBalls.some(checkSpeed))
    {
        poolBalls[15].speedDirection.x = -direction.x * hitStrength;
        poolBalls[15].speedDirection.z = -direction.z * hitStrength;
    }

//Deze code bleef bugs geven, ik heb het maar zo gelaten. Helaas mis ik wel een paar game regels hierdoor.
/*        else if(!checkBalls)
        {
            poolBalls[15].speedDirection.x = -direction.x * hitStrength;
            poolBalls[15].speedDirection.z = -direction.z * hitStrength;
            checkBalls = true;
        }*/
}

function checkBallFunc()
{
    var stoppedBalls = 0;
    for (var i = 0; i < poolBalls.length; i++)
    {
        if(poolBalls[i].speedDirection.x < 0.01 && poolBalls[i].speedDirection.z < 0.01)
        {
            poolBalls[i].speedDirection.x = 0;
            poolBalls[i].speedDirection.z = 0;
            stoppedBalls++;
        }
        else
        {
            stoppedBalls = 0;
        }
    }
    if(stoppedBalls === 16)
    {
        console.log("16reached");
        console.log("hit", hit);
        console.log("pocket", pocketed);
        checkBalls = false;

        if(hit === false)
        {
            alert(game.currentPlayer.name + " didn`t hit any object balls! Click for next turn.");
            resetWhiteBall();
            game.nextTurn();
        }
        if (pocketed === false)
        {
            alert(game.currentPlayer.name + " didn`t pocket any balls! Click for next turn.");
            resetWhiteBall();
            game.nextTurn();
        }
        else
        {
            hit = false;
            pocketed = false;
        }
    }
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
}

function  render()
{
    resistance = 0.985;
    clockDelta = clock.getDelta() * 20;

    //Set the position and rotation for each bal
    for (var j = 0; j < poolBalls.length; j++)
    {
        poolBalls[j].speedDirection.y = 0;
        poolBalls[j].ball.position.add(speed.copy(poolBalls[j].speedDirection.multiplyScalar(resistance)).multiplyScalar(clockDelta));
        var rotateMatrix = new THREE.Matrix4();
        rotateMatrix.makeRotationAxis(new THREE.Vector3(0,0,1), -(clockDelta * poolBalls[j].speedDirection.x)/0.5);
        rotateMatrix.multiply(poolBalls[j].ball.matrix);
        poolBalls[j].ball.matrix = rotateMatrix;
        rotateMatrix = new THREE.Matrix4();
        rotateMatrix.makeRotationAxis(new THREE.Vector3(1,0,0), (clockDelta * poolBalls[j].speedDirection.z)/0.5);
        rotateMatrix.multiply(poolBalls[j].ball.matrix);
        poolBalls[j].ball.matrix = rotateMatrix;
        poolBalls[j].ball.rotation.setFromRotationMatrix(poolBalls[j].ball.matrix);
    }

    //Code om the checken of de keu bal wel iets heeft geraakt of gepocket. Ik heb dit niet werkend gekregen.
    if(checkBalls === true)
    {
        checkBallFunc();
        checkBalls = false;
    }

    requestAnimationFrame(render);
    controls.target.copy(white_Ball.position);
    controls.update();
    renderer.render(scene, camera);

    var p1BallsLeft;
    var p2BallsLeft;
    if(player1.ballGroup === "spots" && player2.ballGroup === "stripes")
    {
        p1BallsLeft = game.spots;
        p2BallsLeft = game.stripes;
    }
    else
    {
        p1BallsLeft = game.stripes;
        p2BallsLeft = game.spots;
    }

    document.getElementById("mainInfo").innerHTML = "<b>Current player:</b><br><br><span>" + game.currentPlayer.name + "</span>";
    document.getElementById("p1Info").innerHTML = "<h2 class='customh21'>Player 1:</h2>"+"<br><b>Ball Group:</b><br><span>"+player1.ballGroup+"</span>"+"<br>" + p1BallsLeft +"<b> Balls left </b>";
    document.getElementById("p2Info").innerHTML = "<h2 class='customh2'>Player 2:</h2>"+"<br><b>Ball Group:</b><br><span>"+player2.ballGroup+"</span>"+"<br>" + p2BallsLeft +"<b> Balls left </b>";

    var currentPlayer = game.currentPlayer;

    for (var x = 0; x < poolBalls.length; x++)
    {
        //Check if ball comes close to tablesides and redirect it.
        poolBalls[x].tableInteraction();

        for (var y = x + 1; y < poolBalls.length; y++)
        {
            var distance_x = Math.abs(poolBalls[x].ball.position.x - poolBalls[y].ball.position.x);
            var distance_z = Math.abs(poolBalls[x].ball.position.z - poolBalls[y].ball.position.z);
            var distance = Math.sqrt(distance_x * distance_x + distance_z * distance_z);

            if (distance < 1 && (poolBalls[x].collision == 0 || poolBalls[y].collision == 0))
            {
                poolBalls[x].collision = 1;
                poolBalls[y].collision = 1;

                //If balls are pocketed, skip this iteration
                if (poolBalls[x].pocket === true || poolBalls[y].pocket === true)
                {
                    continue;
                }

                var remainDistance = 1 - distance;
                if (remainDistance > 0)
                {
                    var dir = poolBalls[x].ball.position.clone().sub(poolBalls[y].ball.position).normalize();
                    poolBalls[x].ball.position.add(dir.clone().multiplyScalar(remainDistance));
                }

                poolBalls[x].ballsInteract(poolBalls[y]);

                var group = currentPlayer.ballGroup;
                if(x === 15 || y === 15)
                {
                    hit = true;
/*
                        if(group === "spots")
                        {
                            if(x === 15 && y === 7 && game.spots >= 0)
                            {
                                alert("You hit the black ball! Click for next turn.");
                                resetWhiteBall();
                                game.nextTurn();
                            }
                            if(x === 7 && y === 15 && game.spots >= 0)
                            {
                                alert("You hit the black ball! Click for next turn.");
                                resetWhiteBall();
                                game.nextTurn();
                            }
                        }
                        else
                        {
                            if(x === 15 && y === 7 && game.stripes >= 0)
                            {
                                alert("You hit the black ball! Click for next turn.");
                                resetWhiteBall();
                                game.nextTurn();
                            }
                            if(x === 7 && y === 15 && game.stripes >= 0)
                            {
                                alert("You hit the black ball! Click for next turn.");
                                resetWhiteBall();
                                game.nextTurn();
                            }
                        }
    */

                        if(x === 15 && y !== 7){
                            if(currentPlayer.ballGroup !== poolBalls[x].group && (game.spots < 7 || game.stripes < 7)){
                                alert("You hit your opponents ball! Click for next turn.");
                                resetWhiteBall();
                                game.nextTurn();
                            }
                        }
                        if(y === 15 && x !== 7)
                        {
                            if(currentPlayer.ballGroup !== poolBalls[y].group && (game.spots < 7 || game.stripes < 7)){
                                alert("You hit your opponents ball! Click for next turn.");
                                resetWhiteBall();
                                game.nextTurn();
                            }
                        }
                }
            }
            else if (distance > 1)
            {
                poolBalls[x].collision = 0;
                poolBalls[y].collision = 0;
            }
        }

        for (var i = 0; i < poolBalls.length; i++)
        {
            var position = poolBalls[i].ball.position;

            if ((position.z >= 18.8 || position.z <= -18.8) && (position.x >= 8.8 || position.x <= -8.8) && position.y === 0) {
                if(i !== 15 && i !== 7)
                {
                    if(firstPocket === false)
                    {

                        if (currentPlayer.name === "Player1")
                        {
                            player1.ballGroup = poolBalls[i].group;

                            if(poolBalls[i].group === "spots")
                            {
                                player2.ballGroup = "stripes";
                            }
                            else
                            {
                                player2.ballGroup = "spots";
                            }
                        }
                        else
                        {
                            player2.ballGroup = poolBalls[i].group;

                            if(poolBalls[i].group === "spots")
                            {
                                player1.ballGroup = "stripes";
                            }
                            else
                            {
                                player1.ballGroup = "spots";
                            }
                        }
                        firstPocket = true;
                        pocketed = true;
                    }

                    //check if the pocketed ball was a stripe or a spot, and remove that from the game count
                    if(poolBalls[i].group === "spots")
                    {
                        game.spots -= 1;
                    }
                    else
                    {
                        game.stripes -=1;
                    }

                    poolBalls[i].ballPocketed();
                    pocketed = true;
                    if(currentPlayer.ballGroup !== poolBalls[i].group && currentPlayer.ballGroup !== "")
                    {
                        alert("You hit the wrong ball in the pocket! Click for next turn.");
                        resetWhiteBall();
                        game.nextTurn();
                    }
                }
                else if(i === 15)
                {
                    alert("You hit the cue ball in a pocket! Click for next turn.");
                    resetWhiteBall();
                    game.nextTurn();
                }
                else
                {
                    if(game.spots === 0 && currentPlayer.ballGroup === "spots")
                    {
                        game.finishWin(currentPlayer.name + " successfully pocketed the eight ball!")
                    }
                    else if(game.stripes === 0 && currentPlayer.ballGroup === "stripes")
                    {
                        game.finishWin(currentPlayer.name + " successfully pocketed the eight ball!")
                    }
                    else
                    {
                        game.finishFoul(currentPlayer.name +" illegally pocketed the eight ball!")
                    }
                }
            }

            if (position.x < -9.1 || position.x > 9.1)
            {
                if ((position.z < 1.5 && position.z > -1.5 ) && position.y === 0)
                {
                    if(i !== 15 && i !== 7)
                    {
                        if(firstPocket === false)
                        {
                            var currentPlayer = game.currentPlayer;

                            if (currentPlayer.name === "Player1")
                            {
                                player1.ballGroup = poolBalls[i].group;

                                if(poolBalls[i].group === "spots")
                                {
                                    player2.ballGroup = "stripes";
                                }
                                else
                                {
                                    player2.ballGroup = "spots";
                                }
                            }
                            else
                            {
                                player2.ballGroup = poolBalls[i].group;

                                if(poolBalls[i].group === "spots")
                                {
                                    player1.ballGroup = "stripes";
                                }
                                else
                                {
                                    player1.ballGroup = "spots";
                                }
                            }
                            firstPocket = true;
                            pocketed = true;
                        }

                        //check if the pocketed ball was a stripe or a spot, and remove that from the game count
                        if(poolBalls[i].group === "spots")
                        {
                            game.spots -= 1;
                        }
                        else
                        {
                            game.stripes -=1;
                        }

                        poolBalls[i].ballPocketed();
                        pocketed = true;
                        if(currentPlayer.ballGroup !== poolBalls[i].group && currentPlayer.ballGroup !== "")
                        {
                            alert("You hit the wrong ball in the pocket! Click for next turn.");
                            resetWhiteBall();
                            game.nextTurn();
                        }
                    }
                    else if(i === 15)
                    {
                        alert("You hit the cue ball in a pocket! Click for next turn.");
                        resetWhiteBall();
                        game.nextTurn();
                    }
                    else
                    {
                        if(game.spots === 0 && currentPlayer.ballGroup === "spots")
                        {
                            game.finishWin(currentPlayer.name + " successfully pocketed the eight ball!")
                        }
                        else if(game.stripes === 0 && currentPlayer.ballGroup === "stripes")
                        {
                            game.finishWin(currentPlayer.name + " successfully pocketed the eight ball!")
                        }
                        else
                        {
                            game.finishFoul(currentPlayer.name +" illegally pocketed the eight ball!")
                        }
                    }
                }
            }
        }
    }
}

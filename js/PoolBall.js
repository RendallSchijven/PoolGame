class PoolBall
{
    constructor(speedDirection, ball, group)
    {
        this.speedDirection = speedDirection;
        this.ball = ball;
        this.group = group;
        this.collision = 0;
        this.pocket = false;
        this.mass = 1;
    }

    ballsInteract(victim)
    {
        //Get the mass of both balls
        var massPerpetrator = this.mass;
        var massVictim = victim.mass;

        //Calculate derivative of x and y
        var dx = this.ball.position.x - victim.ball.position.x;
        var dy = this.ball.position.z - victim.ball.position.z;

        //Calculate the angle of the collision in radians using the derivatives.
        var collision_angle = Math.atan2(dy, dx);

        var magnitude_1 = Math.sqrt(this.speedDirection.x * this.speedDirection.x + this.speedDirection.z * this.speedDirection.z);
        var magnitude_2 = Math.sqrt(victim.speedDirection.x * victim.speedDirection.x + victim.speedDirection.z * victim.speedDirection.z);

        //Calculate angle in radians between coordinates and the positive X axis.
        var dir_1 = Math.atan2(this.speedDirection.z, this.speedDirection.x);
        var dir_2 = Math.atan2(victim.speedDirection.z, victim.speedDirection.x);

        //Calculate the new speeds for both axis.
        var new_xspeed_1 = magnitude_1 * Math.cos(dir_1 - collision_angle);
        var new_yspeed_1 = magnitude_1 * Math.sin(dir_1 - collision_angle);
        var new_xspeed_2 = magnitude_2 * Math.cos(dir_2 - collision_angle);
        var new_yspeed_2 = magnitude_2 * Math.sin(dir_2 - collision_angle);

        //Calculate the final speeds of both axis
        var final_xspeed_1 = ((massPerpetrator - massVictim) * new_xspeed_1 + (massPerpetrator + massVictim) * new_xspeed_2) / (massPerpetrator + massVictim);
        var final_xspeed_2 = ((massPerpetrator + massVictim) * new_xspeed_1 + (massPerpetrator - massVictim) * new_xspeed_2) / (massPerpetrator + massVictim);
        var final_yspeed_1 = new_yspeed_1;
        var final_yspeed_2 = new_yspeed_2;

        //Calculate the final directions using the angle and speeds.
        this.speedDirection.x = Math.cos(collision_angle) * final_xspeed_1 + Math.cos(collision_angle + Math.PI / 2) * final_yspeed_1;
        this.speedDirection.z = Math.sin(collision_angle) * final_xspeed_1 + Math.sin(collision_angle + Math.PI / 2) * final_yspeed_1;
        victim.speedDirection.x = Math.cos(collision_angle) * final_xspeed_2 + Math.cos(collision_angle + Math.PI / 2) * final_yspeed_2;
        victim.speedDirection.z = Math.sin(collision_angle) * final_xspeed_2 + Math.sin(collision_angle + Math.PI / 2) * final_yspeed_2;
    }

    tableInteraction()
    {
        var pos_x = this.ball.position.x;
        var pos_z = this.ball.position.z;

        if(pos_x >= 9 || pos_x <= -9)
        {
            this.speedDirection.x = this.speedDirection.x*-1;
        }
        if(pos_z >= 19 || pos_z <= -19)
        {
            this.speedDirection.z = this.speedDirection.z*-1;
        }
    }

    ballPocketed()
    {
        this.speedDirection = new THREE.Vector3(0, 0, 0);
        this.pocket = true;
        this.ball.position.y = -50;
        this.ball.position.x = 0;
        this.ball.position.z = 0;
    }
}


class Game
{
    constructor(player)
    {
        this.turn = 0;
        this.status = "load";
        this.currentPlayer = player;
        this.spots = 7;
        this.stripes = 7;
        this.pocketed = false;
    }

    startTurn()
    {
        if(this.state === "finish")
        {
            return;
        }
        this.currentPlayer.myRound = true;
        this.turn++;
        this.state = "inTurn"
    }

    nextTurn()
    {
        this.turn++;
        if (this.currentPlayer.name == "Player1")
        {
            this.currentPlayer.myRound = false;
            this.currentPlayer = player2;
            this.currentPlayer.myRound = true;
        }
        else
        {
            this.currentPlayer.myRound = false;
            this.currentPlayer = player1;
            this.currentPlayer.myRound = true;
        }

        this.startTurn();
    }

    finishFoul(message)
    {
        this.status = "finish";
        var winner;
        if(this.currentPlayer.name === "Player1")
        {
            winner = "Player 2";
        }
        else
        {
            winner = "Player 1";
        }
        alert(winner +" won! because " + message);
        location.reload();
    }

    finishWin(message)
    {
        this.status = "finish";
        var winner = this.currentPlayer.name;
        alert(winner +" won! because " + message);
        location.reload();
    }
}
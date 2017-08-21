(function () {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');

    var yPos = 0;
    
    var chessGame = function () {
        this.colors = ['#769656', '#eeeed2'];
        this.hoverColor = ['#baca44', '#f6f682'];
        this.audioFiles = ['move-opponent.mp3', 'move-self.mp3'];
        this.tableWidth = 66;

        this.canClick = true;

        this.gameData = {
            whitePos: [],
            blackPos: [],
            white: [{
                img: 'wb.png',
                x: [3, 6],
                y: 0
            },
            {
                img: 'wk.png',
                x: 5,
                y: 0
            },
            {
                img: 'wq.png',
                x: 4,
                y: 0
            },
            {
                img: 'wn.png',
                x: [2, 7],
                y: 0
            },
            {
                img: 'wr.png',
                x: [1, 8],
                y: 0
            }],
            black: [{
                img: 'bb.png',
                x: [3, 6],
                y: 0
            },
            {
                img: 'bk.png',
                x: 5,
                y: 0
            },
            {
                img: 'bq.png',
                x: 4,
                y: 0
            },
            {
                img: 'bn.png',
                x: [2, 7],
                y: 0
            },
            {
                img: 'br.png',
                x: [1, 8],
                y: 0
            }]

        };

        this.whoIam = 'white';

        this.turn = this.whoIam;

        this.startGame();
        this.setEntry('white', 'black');
        this.mouseclick();

        this.drawZone = [];
    }

    chessGame.prototype.mouseclick = function () {
        var self = this;

        var lastPositionX = 0;
        var lastPositionY = 0;
        var lastTouchedObj = null;

        var moveSelfAudio = new Audio('assets/song/' + this.audioFiles[1]);

        var x_el_pos = 0,
            y_el_pos = 0;

        var mouseX = 0,
            mouseY = 0;

        canvas.onmousemove = function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;

            if (lastTouchedObj === null || lastTouchedObj === void 0) {
                if (self.getPawnByMousePosition(mouseX, mouseY) !== null) {
                    canvas.style.cursor = '-webkit-grab';
                } else {
                    canvas.style.cursor = 'default';
                }

                return;
            } else {
                canvas.style.cursor = '-webkit-grabbing';
            }

            lastTouchedObj.x = mouseX - x_el_pos;
            lastTouchedObj.y = mouseY - y_el_pos;
        }

        canvas.onmousedown = function (e) {
            if (e.which !== 1 || !self.canClick)
                return;

            var entry = self.getPawnByMousePosition(e.clientX, e.clientY);

            if (entry === void 0 || entry === null)
                return;

            if (self.turn === 'white' && entry.isEnemy)
                return;

            if (self.turn === 'black' && !entry.isEnemy)
                return;

            lastTouchedObj = entry;

            lastPositionX = lastTouchedObj.x;
            lastPositionY = lastTouchedObj.y;

            x_el_pos = mouseX - lastTouchedObj.x;
            y_el_pos = mouseY - lastTouchedObj.y;

            lastTouchedObj.x = mouseX - (mouseX - lastTouchedObj.x);
            canvas.style.cursor = '-webkit-grabbing';

            lastTouchedObj.zIndex = 10;

            self.showMovementAvailableWays(lastTouchedObj);
        }

        document.onmouseup = function () {
            if (lastTouchedObj === null || lastTouchedObj === void 0)
                return;

            canvas.style.cursor = '-webkit-grab';

            lastTouchedObj.zIndex = 1;


            var returnEntry = function () {
                self.slowReturn(lastTouchedObj, lastPositionX, lastPositionY);

                self.drawZone = [];

                self.canSetPosition = null;
                lastTouchedObj = null;
            }

            if (self.canSetPosition !== null && self.canSetPosition !== void 0) {
                var setEntry = function (getPositionOfCurrentCel) {
                    if (getPositionOfCurrentCel.x + self.tableWidth >= mouseX
                        && getPositionOfCurrentCel.x <= mouseX
                        && getPositionOfCurrentCel.y + self.tableWidth >= mouseY
                        && getPositionOfCurrentCel.y <= mouseY) {

                        var enemy = self.getPawnByMousePositionFromEnemy(
                            lastTouchedObj, 
                            getPositionOfCurrentCel.x, 
                            getPositionOfCurrentCel.y);
                        
                        if (enemy !== null && enemy !== undefined) {
                            self.removeEnemy(enemy);
                        }

                        lastTouchedObj.x = getPositionOfCurrentCel.x;
                        lastTouchedObj.y = getPositionOfCurrentCel.y;

                        self.turn = self.turn === 'white' ? 'black' : 'white';                        

                        moveSelfAudio.play();
                        lastTouchedObj.isFirstMove = false;

                        lastTouchedObj = null;
                        self.drawZone = [];
                        self.canSetPosition = null;
                    }
                }

                if (Array.isArray(self.canSetPosition)) {
                    for (var r = 0; r < self.canSetPosition.length; r++) {
                        var current = self.canSetPosition[r];

                        var getPositionOfCurrentCel = self.getPosition(current.x + 1, current.y + 1);

                        setEntry(getPositionOfCurrentCel);

                        if (self.canSetPosition === null || self.canSetPosition === void 0)
                            break;
                    }

                    returnEntry();
                } else {
                    var getPositionOfCurrentCel = self.getPosition(self.canSetPosition.x + 1, self.canSetPosition.y + 1);
                    setEntry(getPositionOfCurrentCel);
                    returnEntry();
                }
            }
            else {
                returnEntry();
            }
        }
    }

    chessGame.prototype.removeEnemy = function (enemy) {
        var enemyColor = enemy.img.substr(11, 11)[0] === 'w' ? 'white' : 'black';
        var enemyPositions = this.gameData[enemyColor + 'Pos'];
        
        this.gameData[enemyColor + 'Pos'] = enemyPositions.filter(function (el) {
            return !(el.x === enemy.x && el.y === enemy.y);
        });
    }

    chessGame.prototype.showMovementAvailableWays = function (entry) {
        var entryPos = this.getCurrentEntryPos(entry);

        switch (entry.character) {
            case "p":
                var pos = [];

                if (entry.isFirstMove) {
                    if (entry.isEnemy && this.canMovePos(entryPos.x, entryPos.y + 2) && this.canMovePos(entryPos.x, entryPos.y + 1)) {
                        pos = [{
                            x: entryPos.x,
                            y: entryPos.y + 1
                        }, {
                            x: entryPos.x,
                            y: entryPos.y + 2
                        }];
                    } else if (this.canMovePos(entryPos.x, entryPos.y - 2) && !entry.isEnemy) {
                        pos = [{
                            x: entryPos.x,
                            y: entryPos.y - 1
                        }, {
                            x: entryPos.x,
                            y: entryPos.y - 2
                        }];
                    } else if (this.canMovePos(entryPos.x, entryPos.y - 1) && !entry.isEnemy) {
                        pos = [{
                            x: entryPos.x,
                            y: entryPos.y - 1
                        }];
                    } else if (this.canMovePos(entryPos.x, entryPos.y + 1) && entry.isEnemy) {
                        pos = [{
                            x: entryPos.x,
                            y: entryPos.y + 1
                        }];
                    }
                } else {
                    if (entry.isEnemy && this.canMovePos(entryPos.x, entryPos.y + 1)) {
                        pos = [{
                            x: entryPos.x,
                            y: entryPos.y + 1
                        }];
                    } else if (this.canMovePos(entryPos.x, entryPos.y - 1) && !entry.isEnemy) {
                        pos = [{
                            x: entryPos.x,
                            y: entryPos.y - 1
                        }];
                    }
                }

                this.drawZone = pos;
                this.canSetPosition = pos;

                this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y - 1);
                this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y - 1);
                this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y + 1);
                this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y + 1);

                break;
            case "n":
                this.canSetPosition = [];

                if (this.canMovePos(entryPos.x + 1, entryPos.y + 2)) {
                    this.drawZone.push({
                        x: entryPos.x + 1,
                        y: entryPos.y + 2
                    });

                    this.canSetPosition.push({
                        x: entryPos.x + 1,
                        y: entryPos.y + 2
                    });
                }

                if (this.canMovePos(entryPos.x + 1, entryPos.y - 2)) {
                    this.drawZone.push({
                        x: entryPos.x + 1,
                        y: entryPos.y - 2
                    });

                    this.canSetPosition.push({
                        x: entryPos.x + 1,
                        y: entryPos.y - 2
                    });
                }

                if (this.canMovePos(entryPos.x - 1, entryPos.y + 2)) {
                    this.drawZone.push({
                        x: entryPos.x - 1,
                        y: entryPos.y + 2
                    });

                    this.canSetPosition.push({
                        x: entryPos.x - 1,
                        y: entryPos.y + 2
                    });
                }

                if (this.canMovePos(entryPos.x - 1, entryPos.y - 2)) {
                    this.drawZone.push({
                        x: entryPos.x - 1,
                        y: entryPos.y - 2
                    });

                    this.canSetPosition.push({
                        x: entryPos.x - 1,
                        y: entryPos.y - 2
                    });
                }

                if (this.canMovePos(entryPos.x - 2, entryPos.y - 1)) {
                    this.drawZone.push({
                        x: entryPos.x - 2,
                        y: entryPos.y - 1
                    });

                    this.canSetPosition.push({
                        x: entryPos.x - 2,
                        y: entryPos.y - 1
                    });
                }

                if (this.canMovePos(entryPos.x + 2, entryPos.y - 1)) {
                    this.drawZone.push({
                        x: entryPos.x + 2,
                        y: entryPos.y - 1
                    });

                    this.canSetPosition.push({
                        x: entryPos.x + 2,
                        y: entryPos.y - 1
                    });
                }

                if (this.canMovePos(entryPos.x + 2, entryPos.y + 1)) {
                    this.drawZone.push({
                        x: entryPos.x + 2,
                        y: entryPos.y + 1
                    });

                    this.canSetPosition.push({
                        x: entryPos.x + 2,
                        y: entryPos.y + 1
                    });
                }

                if (this.canMovePos(entryPos.x - 2, entryPos.y + 1)) {
                    this.drawZone.push({
                        x: entryPos.x - 2,
                        y: entryPos.y + 1
                    });

                    this.canSetPosition.push({
                        x: entryPos.x - 2,
                        y: entryPos.y + 1
                    });
                }

                this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y + 2);
                this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y - 2);
                this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y + 2);
                this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y - 2);
                this.getNearEnemyEntry(entry, entryPos.x - 2, entryPos.y - 1);
                this.getNearEnemyEntry(entry, entryPos.x + 2, entryPos.y - 1);
                this.getNearEnemyEntry(entry, entryPos.x + 2, entryPos.y + 1);
                this.getNearEnemyEntry(entry, entryPos.x - 2, entryPos.y + 1);
                break;
            case "b":
                this.canSetPosition = [];
                this.positions = [];

                var x = entryPos.x,
                    y = entryPos.y;

                var self = this;

                var setTraits = function (x, y) {
                    if (!self.canMovePos(x, y) && !self.getNearEnemyEntry(entry, x, y)) {
                        return false;
                    }

                    self.drawZone.push({
                        x: x,
                        y: y
                    });

                    self.canSetPosition.push({
                        x: x,
                        y: y
                    });     
                    
                    if (self.getNearEnemyEntry(entry, x, y)) {
                        return false;
                    }

                    return true;
                }

                for (var i = 0; i < 8 - entryPos.x; i++) {
                    x++;
                    y++;

                    if (!setTraits(x, y))
                        break;             
                }

                x = entryPos.x;
                y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x--;
                    y++;

                    if (!setTraits(x, y))
                        break;
                }

                x = entryPos.x;
                y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x++;
                    y--;

                    if (!setTraits(x, y))
                        break;
                }

                x = entryPos.x;
                y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x--;
                    y--;

                    if (!setTraits(x, y))
                        break;
                }

                break;
            case "r":
                var x = entryPos.x,
                    y = entryPos.y;

                this.canSetPosition = [];

                for (var i = 0; i < 8; i++) {
                    y++;

                    if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.drawZone.push({
                        x: x,
                        y: y
                    });

                    if (this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.canSetPosition.push({
                        x: x,
                        y: y
                    });
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    y--;

                    if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.drawZone.push({
                        x: x,
                        y: y
                    });

                    if (this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.canSetPosition.push({
                        x: x,
                        y: y
                    });
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x++;

                    if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.drawZone.push({
                        x: x,
                        y: y
                    });

                    if (this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.canSetPosition.push({
                        x: x,
                        y: y
                    });
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x--;

                    if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.drawZone.push({
                        x: x,
                        y: y
                    });

                    if (this.getNearEnemyEntry(entry, x, y))
                        break;

                    this.canSetPosition.push({
                        x: x,
                        y: y
                    });
                }

                break;
            case "q":
                this.canSetPosition = [];

                var x = entryPos.x,
                    y = entryPos.y;

                var self = this;

                var setTraitor = function (x, y) {
                    if (!self.canMovePos(x, y) && !self.getNearEnemyEntry(entry, x, y))
                        return false;

                    self.drawZone.push({
                        x: x,
                        y: y
                    });

                    self.canSetPosition.push({
                        x: x,
                        y: y
                    });

                    if (self.getNearEnemyEntry(entry, x, y))
                        return false;

                    return true;
                }

                for (var i = 0; i < 8; i++) {
                    x++;

                    if (!setTraitor(x, y))
                        break;
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x--;

                    if (!setTraitor(x, y))
                        break;
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    y++;

                    if (!setTraitor(x, y))
                        break;
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    y--;

                    if (!setTraitor(x, y))
                        break;
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x++;
                    y++;

                    if (!setTraitor(x, y))
                        break;
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x--;
                    y++;

                    if (!setTraitor(x, y))
                        break;
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x--;
                    y--;

                    if (!setTraitor(x, y))
                        break;
                }

                var x = entryPos.x,
                    y = entryPos.y;

                for (var i = 0; i < 8; i++) {
                    x++;
                    y--;

                    if (!setTraitor(x, y))
                        break;
                }

                break;
            case "k":
                this.canSetPosition = [];

                if (this.canMovePos(entryPos.x - 1, entryPos.y)) {
                    var pos = {
                        x: entryPos.x - 1,
                        y: entryPos.y
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }

                if (this.canMovePos(entryPos.x + 1, entryPos.y)) {
                    var pos = {
                        x: entryPos.x + 1,
                        y: entryPos.y
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }

                if (this.canMovePos(entryPos.x, entryPos.y + 1)) {
                    var pos = {
                        x: entryPos.x,
                        y: entryPos.y + 1
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }

                if (this.canMovePos(entryPos.x, entryPos.y - 1)) {
                    var pos = {
                        x: entryPos.x,
                        y: entryPos.y - 1
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }

                if (this.canMovePos(entryPos.x + 1, entryPos.y + 1)) {
                    var pos = {
                        x: entryPos.x + 1,
                        y: entryPos.y + 1
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }

                if (this.canMovePos(entryPos.x - 1, entryPos.y - 1)) {
                    var pos = {
                        x: entryPos.x - 1,
                        y: entryPos.y - 1
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }

                if (this.canMovePos(entryPos.x - 1, entryPos.y + 1)) {
                    var pos = {
                        x: entryPos.x - 1,
                        y: entryPos.y + 1
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }


                if (this.canMovePos(entryPos.x + 1, entryPos.y - 1)) {
                    var pos = {
                        x: entryPos.x + 1,
                        y: entryPos.y - 1
                    };

                    this.drawZone.push(pos);
                    this.canSetPosition.push(pos);
                }

                break;
            default:
                break;
        }
    }

    chessGame.prototype.slowReturn = function (obj, destX, destY) {
        var self = this;

        if (obj === null || obj === void 0)
            return;

        var left = obj.x,
            top = obj.y,
            dx = left - destX,
            dy = top - destY,
            i = 1,
            count = 20,
            delay = 20;

        function loop() {
            if (i >= count) {
                self.canClick = true;

                return;
            }

            i += 1;
            obj.x = (left - (dx * i / count)).toFixed(0);
            obj.y = (top - (dy * i / count)).toFixed(0);
            setTimeout(loop, delay);
            self.canClick = false;
        }

        loop();
    }

    chessGame.prototype.startGame = function () {
        var self = this;

        var gameProcess = function () {
            self.drawTable();
            self.setEntryPositions(self.gameData.whitePos, self.gameData.blackPos);

            window.requestAnimationFrame(gameProcess);
        }

        window.requestAnimationFrame(gameProcess);
    }

    chessGame.prototype.drawTable = function () {
        var currentColorIndex = 0;

        canvas.width = 8 * this.tableWidth;
        canvas.height = 8 * this.tableWidth;

        var self = this;

        var drawRect = function (color, x, y) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.rect(x, y, self.tableWidth, self.tableWidth);
            ctx.fill();
            ctx.closePath();
        }

        var yPos = 0;
        var currentHoverColorIndex = 0;

        for (var y = 0; y <= 8; y++) {
            var xPos = 0;

            for (var x = 0; x <= 8; x++) {
                drawRect(this.colors[currentColorIndex], xPos, yPos);

                if (this.drawZone.length > 0) {
                    for (var j = 0; j < this.drawZone.length; j++) {
                        var current = this.drawZone[j];

                        if (y === current.y && x === current.x) {
                            drawRect(this.hoverColor[currentHoverColorIndex], xPos, yPos);
                        }
                    }
                }

                xPos += this.tableWidth;

                currentHoverColorIndex = currentHoverColorIndex == 0 ? 1 : 0;
                currentColorIndex = currentColorIndex == 0 ? 1 : 0;
            }

            yPos += this.tableWidth;
        }
    }

    chessGame.prototype.setEntryPositions = function (self, enemy) {
        for (var i = 0; i < enemy.length; i++) {
            var item = enemy[i];

            var image = new Image();
            image.src = item.img;

            ctx.drawImage(image, item.x, item.y, item.width, item.height);
        }

        var selfData = self.sort(function (a, b) {
            return a.zIndex - b.zIndex;
        });


        for (var i = 0; i < selfData.length; i++) {
            var item = selfData[i];

            var image = new Image();
            image.src = item.img;

            ctx.drawImage(image, item.x, item.y, item.width, item.height);
        }
    }

    chessGame.prototype.setEntry = function (color1, color2) {
        var self = this;

        this.gameData.whitePos = [];

        var xPosWhite = 0;

        var setEnemyEntry = function (defaultColor) {
            var data = [];

            var color = self.gameData[defaultColor],
                colorPawn = defaultColor === 'white' ? 'wp' : 'bp';

            for (var s = 0; s < color.length; s++) {
                var current = color[s];

                var image = new Image();

                image.src = 'assets/img/' + current.img;

                if (current.x.length >= 1) {
                    for (var i = 0; i < current.x.length; i++) {
                        var xPosition = current.x[i];

                        var width = 65 * self.tableWidth / 65;
                        var height = 65 * self.tableWidth / 65;
                        var xPosEntry = (xPosition - 1) * self.tableWidth;

                        data.push({
                            x: xPosEntry,
                            y: 0,
                            width: width,
                            height: height,
                            img: 'assets/img/' + current.img,
                            character: current.img.substr(1, 1),
                            zIndex: 1,
                            isEnemy: true
                        });

                        ctx.drawImage(image, xPosEntry, 0, width, height);
                    }
                }
                else {
                    var width = 65 * self.tableWidth / 65;
                    var height = 65 * self.tableWidth / 65;

                    var xPosEntry = (current.x - 1) * self.tableWidth;
                    ctx.drawImage(image, xPosEntry, 0, width, height);

                    data.push({
                        x: xPosEntry,
                        y: 0,
                        width: width,
                        height: height,
                        img: 'assets/img/' + current.img,
                        character: current.img.substr(1, 1),
                        zIndex: 1,
                        isEnemy: true
                    });
                }
            }

            // Pawns
            for (var s = 0; s < 8; s++) {
                var image = new Image();
                image.src = 'assets/img/' + colorPawn + '.png';

                var width = 65 * self.tableWidth / 65;
                var height = 65 * self.tableWidth / 65;

                ctx.drawImage(image, s * self.tableWidth, 1 * self.tableWidth, width, height);

                data.push({
                    x: s * self.tableWidth,
                    y: 1 * self.tableWidth,
                    width: width,
                    height: height,
                    img: 'assets/img/' + colorPawn + '.png',
                    character: colorPawn.substr(1, 1),
                    isFirstMove: true,
                    zIndex: 1,
                    isEnemy: true
                });
            }

            return data;
        }

        var setSelfEntry = function (defaultColor) {
            var data = [];

            var color = self.gameData[defaultColor],
                colorPawn = defaultColor === 'white' ? 'wp' : 'bp';

            for (var s = 0; s < color.length; s++) {
                var current = color[s];

                var image = new Image();

                image.src = 'assets/img/' + current.img;

                if (current.x.length >= 1) {
                    for (var i = 0; i < current.x.length; i++) {
                        var xPosition = current.x[i];

                        var width = 65 * self.tableWidth / 65;
                        var height = 65 * self.tableWidth / 65;
                        var xPosEntry = (xPosition - 1) * self.tableWidth;

                        data.push({
                            x: xPosEntry,
                            y: (8 - 1) * self.tableWidth,
                            width: width,
                            height: height,
                            img: 'assets/img/' + current.img,
                            character: current.img.substr(1, 1),
                            zIndex: 1
                        });

                        ctx.drawImage(image, xPosEntry, 0, width, height);
                    }
                }
                else {
                    var width = 65 * self.tableWidth / 65;
                    var height = 65 * self.tableWidth / 65;

                    var xPosEntry = (current.x - 1) * self.tableWidth;
                    ctx.drawImage(image, xPosEntry, 0, width, height);

                    data.push({
                        x: xPosEntry,
                        y: (8 - 1) * self.tableWidth,
                        width: width,
                        height: height,
                        img: 'assets/img/' + current.img,
                        character: current.img.substr(1, 1),
                        zIndex: 1
                    });
                }
            }

            // Pawns
            for (var s = 0; s < 8; s++) {
                var image = new Image();
                image.src = 'assets/img/' + colorPawn + '.png';

                var width = 65 * self.tableWidth / 65;
                var height = 65 * self.tableWidth / 65;

                ctx.drawImage(image, s * self.tableWidth, 1 * self.tableWidth, width, height);

                data.push({
                    x: s * self.tableWidth,
                    y: 6 * self.tableWidth,
                    width: width,
                    height: height,
                    img: 'assets/img/' + colorPawn + '.png',
                    character: colorPawn.substr(1, 1),
                    isFirstMove: true,
                    zIndex: 1
                });
            }

            return data;
        }

        this.gameData.whitePos = setSelfEntry(color1);
        this.gameData.blackPos = setEnemyEntry(color2);
    }

    chessGame.prototype.getPosition = function (x, y) {
        return {
            x: (x - 1) * this.tableWidth,
            y: (y - 1) * this.tableWidth
        };
    }

    chessGame.prototype.getEntryPosition = function (x, y) {
        var entry = null;

        for (var i = 0; i < this.gameData.whitePos.length; i++) {
            var item = this.gameData.whitePos[i];
            var position = this.getCurrentEntryPos(item);
            
            if (position !== null && position.x === x && position.y === y)
                entry = item;
        }

        for (var i = 0; i < this.gameData.blackPos.length; i++) {
            var item = this.gameData.blackPos[i];
            var position = this.getCurrentEntryPos(item);
            
            if (position !== null && position.x === x && position.y === y)
                entry = item;
        }

        return entry;
    }

    chessGame.prototype.getNearEnemyEntry = function (character, x, y) {
        var target = this.getEntryPosition(x, y)

        if (target !== null && !(character.isEnemy === target.isEnemy)) {
            this.drawZone.push({
                x: this.getCurrentEntryPos(target).x,
                y: this.getCurrentEntryPos(target).y
            });

            this.canSetPosition.push({
                x: this.getCurrentEntryPos(target).x,
                y: this.getCurrentEntryPos(target).y
            });

            return target;
        }

        return false;
    }

    chessGame.prototype.getPawnByMousePosition = function (x, y) {
        var obj = null;

        for (var i = 0; i < this.gameData.whitePos.length; i++) {
            var item = this.gameData.whitePos[i];

            if (parseInt(item.x) + item.width >= x
                && x >= parseInt(item.x)
                && parseInt(item.y) + item.height >= y
                && y >= item.y)
                obj = item;
        }

        for (var i = 0; i < this.gameData.blackPos.length; i++) {
            var item = this.gameData.blackPos[i];

            if (parseInt(item.x) + item.width >= x
                && x >= parseInt(item.x)
                && parseInt(item.y) + item.height >= y
                && y >= item.y)
                obj = item;
        }

        return obj;
    }

    chessGame.prototype.getPawnByMousePositionFromEnemy = function (character, x, y) {
        var obj;

        if (character === null || character === undefined)
            return;

        var data = character.isEnemy ? this.gameData.whitePos : this.gameData.blackPos;

        for (var i = 0; i < data.length; i++) {
            var item = data[i];

            if (parseInt(item.x) === x && parseInt(item.y) === y)
                obj = item;
        }

        return obj;
    }

    chessGame.prototype.getCurrentEntryPos = function (obj) {
        if (obj === void 0 || obj === null)
            return null;

        var x = Math.round((obj.x - 1) / this.tableWidth),
            y = Math.round((obj.y - 1) / this.tableWidth);

        return {
            x: x < 0 ? 0 : x,
            y: y < 0 ? 0 : y
        }
    }

    chessGame.prototype.canMovePos = function (x, y) {
        var objectPos = this.getPosition(x + 1, y + 1);

        var element = this.getPawnByMousePosition(objectPos.x + 1, objectPos.y + 1);

        if (element === null)
            return true;

        return false;
    }

    var a = new chessGame();
})();
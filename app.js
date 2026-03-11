document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
    }

    const grid = document.getElementById('grid');
    const scoreDisplay = document.getElementById('score');
    const deadEndMessage = document.getElementById('dead-end-message');
    const retryBtn = document.getElementById('retry-btn');
    
    const width = 6; 
    const squares = [];
    let score = 0;

    const coinImages = [
        'url("assets/blum.jpeg")',
        'url("assets/cati.jpeg")',
        'url("assets/dogs.jpeg")',
        'url("assets/build.webp")',
        'url("assets/notcoin.png")',
        'url("assets/notpixel.jpeg")',
        'url("assets/ton.jpeg")',
        'url("assets/redo.webp")',
    ];

    const colorMap = {
        'url("assets/blum.jpeg")': '#ff007f', 
        'url("assets/cati.jpeg")': '#ffaa00', 
        'url("assets/dogs.jpeg")': '#ffffff', 
        'url("assets/ethena.jpeg")': '#aa00ff', 
        'url("assets/notcoin.png")': '#ffd700', 
        'url("assets/notpixel.jpeg")': '#00e5ff', 
        'url("assets/ton.jpeg")': '#0088cc'   
    };

    const bgMap = {
        'url("assets/blum.jpeg")': '#000000', 
        'url("assets/cati.jpeg")': '#0f0f11', 
        'url("assets/dogs.jpeg")': '#000000', 
        'url("assets/ethena.jpeg")': '#000000', 
        'url("assets/notcoin.png")': 'transparent', 
        'url("assets/notpixel.jpeg")': '#0a101d', 
        'url("assets/ton.jpeg")': '#0088cc'   
    };

    let startX = 0;
    let startY = 0;
    let currentSquare = null;
    let isAnimating = false; 

    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            let randomCoin = Math.floor(Math.random() * coinImages.length);
            let selectedCoin = coinImages[randomCoin];
            
            square.style.backgroundImage = selectedCoin;
            square.style.backgroundColor = bgMap[selectedCoin]; 
            
            square.addEventListener('touchstart', handleTouchStart, {passive: false});
            square.addEventListener('touchend', handleTouchEnd);
            square.addEventListener('mousedown', handleTouchStart);
            square.addEventListener('mouseup', handleTouchEnd);
            
            grid.appendChild(square);
            squares.push(square);
        }
    }

    createBoard();

    grid.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, {passive: false});

    function handleTouchStart(e) {
        if (isAnimating) return;
        
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        currentSquare = this;
    }

    function handleTouchEnd(e) {
        if (!currentSquare || isAnimating) return;
        
        let endX, endY;
        if (e.type === 'touchend') {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
        } else {
            endX = e.clientX;
            endY = e.clientY;
        }
        
        let diffX = endX - startX;
        let diffY = endY - startY;
        
        if (Math.abs(diffX) < 25 && Math.abs(diffY) < 25) {
            currentSquare = null;
            return; 
        }

        let firstId = parseInt(currentSquare.id);
        let targetId = null;
        let swipeDirection = '';

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0 && firstId % width !== width - 1) {
                targetId = firstId + 1; 
                swipeDirection = 'right';
            } else if (diffX < 0 && firstId % width !== 0) {
                targetId = firstId - 1; 
                swipeDirection = 'left';
            }
        } else {
            if (diffY > 0 && firstId < 30) { 
                targetId = firstId + width; 
                swipeDirection = 'down';
            } else if (diffY < 0 && firstId >= width) {
                targetId = firstId - width; 
                swipeDirection = 'up';
            }
        }

        if (targetId !== null) {
            let secondSquare = squares[targetId];
            processSwap(currentSquare, secondSquare, swipeDirection);
        }
        
        currentSquare = null;
    }

    function processSwap(square1, square2, direction) {
        isAnimating = true; 
        
        let class1, class2;
        if (direction === 'right') { class1 = 'slide-right'; class2 = 'slide-left'; }
        else if (direction === 'left') { class1 = 'slide-left'; class2 = 'slide-right'; }
        else if (direction === 'down') { class1 = 'slide-down'; class2 = 'slide-up'; }
        else if (direction === 'up') { class1 = 'slide-up'; class2 = 'slide-down'; }

        square1.classList.add(class1);
        square2.classList.add(class2);

        // SYNCED: Increased from 250ms to 400ms for the deliberate, slower slide
        setTimeout(() => {
            square1.classList.remove(class1);
            square2.classList.remove(class2);

            swap(square1, square2);
            let isValidMove = checkValidMatch();
            
            if (!isValidMove) {
                swap(square1, square2); 
                square1.classList.add('wrong-swap');
                square2.classList.add('wrong-swap');
                
                // SYNCED: Increased from 400ms to 500ms for the slower error shake
                setTimeout(() => {
                    square1.classList.remove('wrong-swap');
                    square2.classList.remove('wrong-swap');
                    isAnimating = false; 
                }, 500); 
            } else {
                checkMatches();
                isAnimating = false; 
            }
        }, 400); 
    }

    function swap(square1, square2) {
        let tempImg = square1.style.backgroundImage;
        let tempColor = square1.style.backgroundColor;

        square1.style.backgroundImage = square2.style.backgroundImage;
        square1.style.backgroundColor = square2.style.backgroundColor;

        square2.style.backgroundImage = tempImg;
        square2.style.backgroundColor = tempColor;
    }

    function checkValidMatch() {
        for (let r = 0; r < width; r++) {
            for (let c = 0; c < width - 2; c++) {
                let i = r * width + c;
                let coin = squares[i].style.backgroundImage;
                if (coin !== '' && squares[i+1].style.backgroundImage === coin && squares[i+2].style.backgroundImage === coin) return true;
            }
        }
        for (let c = 0; c < width; c++) {
            for (let r = 0; r < width - 2; r++) {
                let i = r * width + c;
                let coin = squares[i].style.backgroundImage;
                if (coin !== '' && squares[i+width].style.backgroundImage === coin && squares[i+(width*2)].style.backgroundImage === coin) return true;
            }
        }
        return false;
    }

    function checkMatches() {
        let matchedIndices = new Set(); 
        
        for (let r = 0; r < width; r++) {
            for (let c = 0; c < width - 2; c++) {
                let i = r * width + c;
                let decidedCoin = squares[i].style.backgroundImage;
                if (decidedCoin === '') continue;
                
                let matchLength = 1;
                while (c + matchLength < width && squares[i + matchLength].style.backgroundImage === decidedCoin) {
                    matchLength++;
                }
                
                if (matchLength >= 3) {
                    for (let j = 0; j < matchLength; j++) matchedIndices.add(i + j);
                }
            }
        }

        for (let c = 0; c < width; c++) {
            for (let r = 0; r < width - 2; r++) {
                let i = r * width + c;
                let decidedCoin = squares[i].style.backgroundImage;
                if (decidedCoin === '') continue;
                
                let matchLength = 1;
                while (r + matchLength < width && squares[i + (matchLength * width)].style.backgroundImage === decidedCoin) {
                    matchLength++;
                }
                
                if (matchLength >= 3) {
                    for (let j = 0; j < matchLength; j++) matchedIndices.add(i + (j * width));
                }
            }
        }

        if (matchedIndices.size > 0) {
            let pointsEarned = 0;
            if (matchedIndices.size === 3) pointsEarned = 3;
            else if (matchedIndices.size === 4) pointsEarned = 5; 
            else pointsEarned = 10; 
            
            score += pointsEarned;
            scoreDisplay.innerHTML = score;
            
            scoreDisplay.classList.add('score-pop');
            setTimeout(() => {
                scoreDisplay.classList.remove('score-pop');
            }, 300);

            let firstSquare = squares[Array.from(matchedIndices)[0]];
            let floatText = document.createElement('div');
            floatText.classList.add('floating-text');
            floatText.innerHTML = `+${pointsEarned}`;
            firstSquare.appendChild(floatText);
            
            // SYNCED: Waits 2000ms (2s) for the new calm float animation
            setTimeout(() => {
                if (firstSquare.contains(floatText)) firstSquare.removeChild(floatText);
            }, 2000);
            
            matchedIndices.forEach(index => {
                let square = squares[index];
                let bgImage = square.style.backgroundImage;
                
                square.style.backgroundImage = '';
                square.style.backgroundColor = 'transparent'; 
                
                let pop = document.createElement('div');
                pop.classList.add('pop-effect');
                pop.style.backgroundImage = bgImage;
                
                let glowColor = colorMap[bgImage] || '#ffffff';
                pop.style.setProperty('--pop-color', glowColor);
                
                square.appendChild(pop);
                
                // SYNCED: Waits 600ms for the newly extended explosion animation
                setTimeout(() => {
                    if (square.contains(pop)) {
                        square.removeChild(pop);
                    }
                }, 600); 
            });
            return true;
        }
        return false;
    }

    function moveDown() {
        for (let i = 29; i >= 0; i--) { 
            if (squares[i + width].style.backgroundImage === '') {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i + width].style.backgroundColor = squares[i].style.backgroundColor;
                
                squares[i].style.backgroundImage = '';
                squares[i].style.backgroundColor = 'transparent';
                
                squares[i + width].classList.add('falling');
                let targetSquare = squares[i + width];
                
                // SYNCED: Waits 500ms for the softer gravity drop
                setTimeout(() => targetSquare.classList.remove('falling'), 500);
            }
        }
        for (let i = 0; i < width; i++) {
            if (squares[i].style.backgroundImage === '') {
                let randomCoin = Math.floor(Math.random() * coinImages.length);
                let selectedCoin = coinImages[randomCoin];
                
                squares[i].style.backgroundImage = selectedCoin;
                squares[i].style.backgroundColor = bgMap[selectedCoin];
                
                squares[i].classList.add('falling');
                let targetSquare = squares[i];
                
                // SYNCED: Waits 500ms for the softer gravity drop
                setTimeout(() => targetSquare.classList.remove('falling'), 500);
            }
        }
    }

    function checkAvailableMoves() {
        for (let i = 0; i < 36; i++) { 
            if (squares[i].style.backgroundImage === '') continue; 
            
            if ((i % width) < (width - 1) && squares[i+1].style.backgroundImage !== '') {
                swap(squares[i], squares[i + 1]);
                let isMatch = checkValidMatch();
                swap(squares[i], squares[i + 1]); 
                if (isMatch) return true;
            }
            
            if (i < 30 && squares[i+width].style.backgroundImage !== '') { 
                swap(squares[i], squares[i + width]);
                let isMatch = checkValidMatch();
                swap(squares[i], squares[i + width]); 
                if (isMatch) return true;
            }
        }
        return false;
    }

    function restartGame() {
        score = 0;
        scoreDisplay.innerHTML = score;
        deadEndMessage.style.display = 'none';
        isAnimating = false;

        squares.forEach(square => {
            square.style.backgroundImage = '';
            square.style.backgroundColor = 'transparent';
        });

        for (let i = 0; i < width * width; i++) {
            let randomCoin = Math.floor(Math.random() * coinImages.length);
            let selectedCoin = coinImages[randomCoin];
            
            squares[i].style.backgroundImage = selectedCoin;
            squares[i].style.backgroundColor = bgMap[selectedCoin];
            
            squares[i].classList.add('falling');
            let targetSquare = squares[i];
            
            // SYNCED: Waits 500ms for the softer gravity drop
            setTimeout(() => targetSquare.classList.remove('falling'), 500);
        }
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', restartGame);
        retryBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            restartGame();
        });
    }

    window.setInterval(function() {
        let hasMatch = checkMatches(); 
        moveDown();
        
        let boardIsFull = squares.every(sq => sq.style.backgroundImage !== '');
        
        if (boardIsFull && !hasMatch && !isAnimating) {
            if (!checkAvailableMoves()) {
                deadEndMessage.style.display = 'block';
            } else {
                deadEndMessage.style.display = 'none';
            }
        }
    }, 100);
});
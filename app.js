document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
    }

    const grid = document.getElementById('grid');
    const scoreDisplay = document.getElementById('score');
    const deadEndMessage = document.getElementById('dead-end-message');
    const retryBtn = document.getElementById('retry-btn');
    const highScoreDisplay = document.getElementById('high-score-val');

    const milestoneCard = document.getElementById('milestone-card');
    const milestoneImage = document.getElementById('milestone-image');
    const milestoneScoreVal = document.getElementById('milestone-score-val');
    const milestoneQuote = document.getElementById('milestone-quote');
    const milestoneContinueBtn = document.getElementById('milestone-continue-btn');
    
    // Welcome Card Elements
    const welcomeCard = document.getElementById('welcome-card');
    const startGameBtn = document.getElementById('start-game-btn');
    
    const width = 6; 
    const squares = [];
    let score = 0;

    // Load High Score from local storage
    let highScore = localStorage.getItem('tonCrushHighScore') || 0;
    if (highScoreDisplay) highScoreDisplay.innerHTML = highScore;

    const coinImages = [
        'url("assets/cati.jpeg")',
        'url("assets/dogs.jpeg")',
        'url("assets/build.png")',
        'url("assets/ton.jpeg")',
        'url("assets/redo.webp")'
    ];

    const colorMap = {
        'url("assets/cati.jpeg")': '#ffaa00', 
        'url("assets/dogs.jpeg")': '#ffffff',   
        'url("assets/ton.jpeg")': '#0088cc',
        'url("assets/build.png")': '#cc00cc',
        'url("assets/redo.webp")': '#16ffd0'    
    };

    const bgMap = {
        'url("assets/cati.jpeg")': '#0f0f11', 
        'url("assets/dogs.jpeg")': '#000000', 
        'url("assets/ton.jpeg")': '#0088cc',
        'url("assets/build.png")': 'transparent', 
        'url("assets/redo.webp")': 'transparent'  
    };

    let milestoneTarget = 50; 
    
    const tonStickers = [
        'assets/ton.jpeg', 
        'assets/dogs.jpeg',
        'assets/cati.jpeg'
    ]; 
    
    const tonQuotes = [
        '"Putting Crypto in every pocket."',
        '"The Open Network is unstoppable."',
        '"Build on TON, build for billions."',
        '"Mass adoption starts right here."',
        '"Web3 directly inside Telegram!"'
    ];

    let startX = 0;
    let startY = 0;
    let currentSquare = null;
    
    // LOCK THE BOARD ON LOAD
    let isAnimating = true; 

    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            
            let randomCoin;
            let selectedCoin;
            
            do {
                randomCoin = Math.floor(Math.random() * coinImages.length);
                selectedCoin = coinImages[randomCoin];
            } while (
                (i % width >= 2 && squares[i - 1].style.backgroundImage === selectedCoin && squares[i - 2].style.backgroundImage === selectedCoin) ||
                (i >= width * 2 && squares[i - width].style.backgroundImage === selectedCoin && squares[i - width * 2].style.backgroundImage === selectedCoin)
            );
            
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

        setTimeout(() => {
            square1.classList.remove(class1);
            square2.classList.remove(class2);

            swap(square1, square2);
            let isValidMove = checkValidMatch();
            
            if (!isValidMove) {
                swap(square1, square2); 
                square1.classList.add('wrong-swap');
                square2.classList.add('wrong-swap');
                
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

            // HIGH SCORE LOGIC
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('tonCrushHighScore', highScore);
                if (highScoreDisplay) highScoreDisplay.innerHTML = highScore;
                
                const badge = document.querySelector('.high-score-badge');
                if (badge) {
                    badge.classList.add('record-broken');
                    setTimeout(() => badge.classList.remove('record-broken'), 400);
                }
            }

            // MILESTONE LOGIC
            if (score >= milestoneTarget) {
                let currentMilestoneScore = score; 
                milestoneTarget += 50; 
                
                setTimeout(() => {
                    isAnimating = true; 
                    
                    let randomSticker = tonStickers[Math.floor(Math.random() * tonStickers.length)];
                    let randomQuote = tonQuotes[Math.floor(Math.random() * tonQuotes.length)];
                    
                    milestoneImage.src = randomSticker;
                    milestoneQuote.innerHTML = randomQuote;
                    milestoneScoreVal.innerHTML = currentMilestoneScore;
                    
                    milestoneCard.style.display = 'flex';
                }, 1500);
            }
            
            scoreDisplay.classList.add('score-pop');
            setTimeout(() => {
                scoreDisplay.classList.remove('score-pop');
            }, 300);

            let firstSquare = squares[Array.from(matchedIndices)[0]];
            let floatText = document.createElement('div');
            floatText.classList.add('floating-text');
            floatText.innerHTML = `+${pointsEarned}`;
            firstSquare.appendChild(floatText);
            
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
        milestoneTarget = 50; 
        scoreDisplay.innerHTML = score;
        deadEndMessage.style.display = 'none';
        isAnimating = false;

        squares.forEach(square => {
            square.style.backgroundImage = '';
            square.style.backgroundColor = 'transparent';
        });

        for (let i = 0; i < width * width; i++) {
            let randomCoin;
            let selectedCoin;
            
            do {
                randomCoin = Math.floor(Math.random() * coinImages.length);
                selectedCoin = coinImages[randomCoin];
            } while (
                (i % width >= 2 && squares[i - 1].style.backgroundImage === selectedCoin && squares[i - 2].style.backgroundImage === selectedCoin) ||
                (i >= width * 2 && squares[i - width].style.backgroundImage === selectedCoin && squares[i - width * 2].style.backgroundImage === selectedCoin)
            );
            
            squares[i].style.backgroundImage = selectedCoin;
            squares[i].style.backgroundColor = bgMap[selectedCoin];
            
            squares[i].classList.add('falling');
            let targetSquare = squares[i];
            
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

    function shuffleBoard() {
        isAnimating = true; 

        const deadEndP = deadEndMessage.querySelector('p');
        deadEndP.innerHTML = "No moves! Shuffling...";
        retryBtn.style.display = 'none'; 
        deadEndMessage.style.display = 'block';

        setTimeout(() => {
            deadEndMessage.style.display = 'none';
            retryBtn.style.display = 'inline-block'; 

            for (let i = 0; i < width * width; i++) {
                let randomCoin;
                let selectedCoin;
                
                do {
                    randomCoin = Math.floor(Math.random() * coinImages.length);
                    selectedCoin = coinImages[randomCoin];
                } while (
                    (i % width >= 2 && squares[i - 1].style.backgroundImage === selectedCoin && squares[i - 2].style.backgroundImage === selectedCoin) ||
                    (i >= width * 2 && squares[i - width].style.backgroundImage === selectedCoin && squares[i - width * 2].style.backgroundImage === selectedCoin)
                );
                
                squares[i].style.backgroundImage = selectedCoin;
                squares[i].style.backgroundColor = bgMap[selectedCoin];
                
                squares[i].classList.add('falling');
                let targetSquare = squares[i];
                setTimeout(() => targetSquare.classList.remove('falling'), 500);
            }
            
            isAnimating = false; 
        }, 1500); 
    }

    // BUTTON EVENT LISTENERS
    function closeMilestoneCard() {
        milestoneCard.style.display = 'none';
        isAnimating = false; 
    }

    if (milestoneContinueBtn) {
        milestoneContinueBtn.addEventListener('click', closeMilestoneCard);
        milestoneContinueBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            closeMilestoneCard();
        }, { passive: false });
    }

    if (startGameBtn) {
        let startGame = (e) => {
            e.preventDefault();
            welcomeCard.style.display = 'none';
            isAnimating = false; // UNLOCKS THE BOARD!
        };
        startGameBtn.addEventListener('click', startGame);
        startGameBtn.addEventListener('touchstart', startGame, { passive: false });
    }

    // GAME LOOP
    window.setInterval(function() {
        let hasMatch = checkMatches(); 
        moveDown();
        
        let boardIsFull = squares.every(sq => sq.style.backgroundImage !== '');
        
        if (boardIsFull && !hasMatch && !isAnimating) {
            if (!checkAvailableMoves()) {
                shuffleBoard();
            } else {
                deadEndMessage.style.display = 'none';
            }
        }
    }, 100);
});
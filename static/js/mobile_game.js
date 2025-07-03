
// New Mobile Game JS with B64 Level Data Handling
let activeDrag = null;
let startPositions = {};
let lastSafeTile = {};
let prevDragTile = {};
let gridOffset = { x: 0, y: 0 };
let touchStartPos = { x: 0, y: 0 };
const tileSize = 85;
let playerIds = [];
let enemyIds = [];
let playerDataMap = {};
let enemyDataMap = {};
let playerHP = {};
let abilityDataMap = {};
let equipmentDataMap = {};
let characterDataMap = {};
let terrainMap = {};
let timerInterval;
let timerRunning = false;
const timerDuration = 4000;
let currentPlayer = null;
let turnEnded = false;
let lastLoggedTile = {};

// Game state management
let currentGameState = null;
let levelId = null;
let gameIsPaused = false;
let gameCompleted = false;

// Load game level from API endpoint
async function loadGameLevel() {
    try {
        // Get level from URL parameter or default to level 1
        const urlParams = new URLSearchParams(window.location.search);
        levelId = urlParams.get('level') || '1';
        
        console.log(`🎮 Loading level ${levelId}...`);
        
        // Load level data from backend
        const response = await fetch(`/api/level/${levelId}`);
        if (response.ok) {
            const levelData = await response.json();
            currentGameState = decodeLevelState(levelData.state_data);
            
            // Set background image
            if (currentGameState.background) {
                const grid = document.getElementById('grid');
                if (grid) {
                    grid.style.backgroundImage = `url(${currentGameState.background})`;
                    grid.style.backgroundSize = 'cover';
                    grid.style.backgroundPosition = 'center';
                }
            }
            
            // Load background music
            if (currentGameState.music) {
                loadBackgroundMusic(currentGameState.music);
            }
            
            console.log('🎮 Level state loaded:', currentGameState);
            return true;
        } else {
            console.warn('⚠️ Failed to load level from API, using default state');
            currentGameState = getDefaultGameState();
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading level:', error);
        currentGameState = getDefaultGameState();
        return false;
    }
}

// Decode B64 level state
function decodeLevelState(base64Data) {
    try {
        const decodedData = atob(base64Data);
        return JSON.parse(decodedData);
    } catch (error) {
        console.error('❌ Failed to decode level state:', error);
        return getDefaultGameState();
    }
}

// Encode current game state to B64
function encodeLevelState(gameState) {
    try {
        const jsonString = JSON.stringify(gameState);
        return btoa(jsonString);
    } catch (error) {
        console.error('❌ Failed to encode level state:', error);
        return null;
    }
}

// Get default game state
function getDefaultGameState() {
    return {
        level: 1,
        background: '/static/maps/example.png',
        music: '/static/audio/background/1.mp3',
        players: [
            { id: 'player1', name: 'Hero', hp: 100, maxHp: 100, row: 6, col: 1, type: 'player', img: '/static/players/arin.png' },
            { id: 'player2', name: 'Mage', hp: 80, maxHp: 100, row: 6, col: 3, type: 'player', img: '/static/players/almarai.png' },
            { id: 'player3', name: 'Archer', hp: 90, maxHp: 100, row: 5, col: 2, type: 'player', img: '/static/players/dante.png' }
        ],
        enemies: [
            { id: 'enemy1', name: 'Goblin', hp: 50, maxHp: 60, row: 0, col: 1, type: 'enemy', img: '/static/enemies/ember/ember_alcolyte.png' },
            { id: 'enemy2', name: 'Orc', hp: 70, maxHp: 80, row: 0, col: 3, type: 'enemy', img: '/static/enemies/ember/ember_alcolyte.png' }
        ],
        bosses: [],
        terrain: [],
        turn: 1,
        round: 1,
        status: 'active'
    };
}

// Update game state based on current unit positions
function updateGameState() {
    if (!currentGameState) return;
    
    // Update player positions and HP
    currentGameState.players.forEach(player => {
        const $playerEl = $(`#${player.id}`);
        if ($playerEl.length > 0) {
            const pos = getGridPosition($playerEl);
            player.row = pos.row;
            player.col = pos.col;
            player.hp = playerHP[player.id] || player.hp;
        }
    });
    
    // Update enemy positions and HP
    currentGameState.enemies.forEach(enemy => {
        const $enemyEl = $(`#${enemy.id}`);
        if ($enemyEl.length > 0) {
            const pos = getGridPosition($enemyEl);
            enemy.row = pos.row;
            enemy.col = pos.col;
            enemy.hp = enemyDataMap[enemy.id]?.hp || enemy.hp;
        }
    });
    
    // Update turn and round counters
    currentGameState.turn = currentGameState.turn || 1;
    currentGameState.round = currentGameState.round || 1;
    
    console.log('🔄 Game state updated:', currentGameState);
}

// Send level completion data to backend
async function sendLevelPassed() {
    try {
        updateGameState();
        
        const encodedState = encodeLevelState(currentGameState);
        if (!encodedState) {
            console.error('❌ Failed to encode game state');
            return false;
        }
        
        const payload = {
            level_id: levelId,
            state_data: encodedState,
            completed: true,
            timestamp: new Date().toISOString()
        };
        
        console.log('📤 Sending level completion data:', payload);
        
        const response = await fetch('/api/level-passed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Level completion sent successfully:', result);
            return true;
        } else {
            console.error('❌ Failed to send level completion:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending level completion:', error);
        return false;
    }
}

// Check if level is completed
function checkLevelCompletion() {
    if (!currentGameState) return false;
    
    // Check if all enemies are defeated
    const aliveEnemies = currentGameState.enemies.filter(enemy => enemy.hp > 0);
    const aliveBosses = currentGameState.bosses.filter(boss => boss.hp > 0);
    
    if (aliveEnemies.length === 0 && aliveBosses.length === 0) {
        gameCompleted = true;
        console.log('🎉 Level completed!');
        
        // Send completion data to backend
        sendLevelPassed();
        
        // Show completion modal or redirect
        showLevelCompletionModal();
        return true;
    }
    
    return false;
}

// Show level completion modal
function showLevelCompletionModal() {
    // Create and show completion modal
    const modal = document.createElement('div');
    modal.className = 'level-completion-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Level ${levelId} Complete!</h2>
            <p>Congratulations! You've successfully completed this level.</p>
            <div class="modal-buttons">
                <button onclick="nextLevel()">Next Level</button>
                <button onclick="returnToMap()">Return to Map</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Navigate to next level
function nextLevel() {
    const nextLevelId = parseInt(levelId) + 1;
    window.location.href = `/mobile_game?level=${nextLevelId}`;
}

// Return to map
function returnToMap() {
    window.location.href = '/map';
}

// Load background music
function loadBackgroundMusic(musicPath) {
    try {
        const audio = document.getElementById('background-music');
        if (audio) {
            audio.src = musicPath;
            audio.loop = true;
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio autoplay prevented:', e));
        }
    } catch (error) {
        console.warn('⚠️ Could not load background music:', error);
    }
}

// Initialize mobile controls
function initializeMobileControls() {
    $(document).ready(function() {
        const grid = document.querySelector('#grid');

        if (!grid) {
            console.warn('Grid not found, retrying in 100ms');
            setTimeout(initializeMobileControls, 100);
            return;
        }

        function updateGridOffset() {
            const rect = grid.getBoundingClientRect();
            gridOffset = {
                x: rect.left,
                y: rect.top
            };
        }

        updateGridOffset();
        window.addEventListener('resize', updateGridOffset);

        // Touch event handlers
        grid.addEventListener('touchstart', handleTouchStart, { passive: false });
        grid.addEventListener('touchmove', handleTouchMove, { passive: false });
        grid.addEventListener('touchend', handleTouchEnd, { passive: false });
        grid.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    });
}

// Touch event handlers
function handleTouchStart(e) {
    if (turnEnded || gameIsPaused || gameCompleted) return;
    
    const unit = e.target.closest('.draggable-unit');
    if (!unit) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    activeDrag = $(unit);
    currentPlayer = unit.id;
    touchStartPos = { x: touch.clientX, y: touch.clientY };

    const pos = getGridPosition(activeDrag);
    startPositions[currentPlayer] = pos;
    prevDragTile[currentPlayer] = pos;
    lastLoggedTile[currentPlayer] = pos;

    startTimer();
}

function handleTouchMove(e) {
    if (!activeDrag || turnEnded || gameIsPaused || gameCompleted) return;
    e.preventDefault();

    const touch = e.touches[0];
    const x = touch.clientX - gridOffset.x;
    const y = touch.clientY - gridOffset.y;

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    if (row >= 0 && row < 8 && col >= 0 && col < 6) {
        const newPos = { row, col };
        const currentPos = getGridPosition(activeDrag);

        if (!isSamePosition(newPos, currentPos)) {
            setGridPosition(activeDrag, row, col);
            prevDragTile[currentPlayer] = currentPos;

            const conflict = isTileOccupied(newPos, currentPlayer);
            if (!conflict) {
                lastSafeTile[currentPlayer] = newPos;
            }
        }
    }
}

function handleTouchEnd(e) {
    if (!activeDrag) return;
    e.preventDefault();

    const pos = getGridPosition(activeDrag);
    const conflict = isTileOccupied(pos, currentPlayer);

    if (conflict) {
        const fallback = lastSafeTile[currentPlayer] || prevDragTile[currentPlayer];
        setGridPosition(activeDrag, fallback.row, fallback.col);
    }

    stopTimer();
    activeDrag = null;
    turnEnded = true;
    $("#next-round").show();
    
    // Update game state after move
    updateGameState();
    
    // Check for level completion
    checkLevelCompletion();
}

// Game utility functions
function getGridPosition($el) {
    if (!$el || $el.length === 0) {
        return { row: -1, col: -1 };
    }
    const offset = $el.position();
    return {
        col: Math.round(offset.left / tileSize),
        row: Math.round(offset.top / tileSize)
    };
}

function setGridPosition($el, row, col) {
    row = Math.max(0, Math.min(row, 7));
    col = Math.max(0, Math.min(col, 5));
    $el.css({
        top: row * tileSize + 7 + 'px',
        left: col * tileSize + 7 + 'px'
    });
}

function isTileOccupied(to, selfId = null) {
    for (const eid of enemyIds) {
        const $enemy = $("#" + eid);
        const pos = getGridPosition($enemy);
        if (isSamePosition(pos, to)) {
            return { type: "enemy", id: eid };
        }
    }

    for (const pid of playerIds) {
        if (pid === selfId) continue;
        const $player = $("#" + pid);
        const pos = getGridPosition($player);
        if (isSamePosition(pos, to)) {
            return { type: "player", id: pid };
        }
    }
    return null;
}

function isSamePosition(pos1, pos2) {
    return pos1.row === pos2.row && pos1.col === pos2.col;
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    let remaining = timerDuration;
    $('#timer').text((remaining / 1000).toFixed(3));

    timerInterval = setInterval(() => {
        remaining -= 10;
        if (remaining <= 0) {
            clearInterval(timerInterval);
            $('#timer').text('0.000');
            timerRunning = false;
            turnEnded = true;
            $("#next-round").show();
        } else {
            $('#timer').text((remaining / 1000).toFixed(3));
        }
    }, 10);
}

function stopTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
    }
}

function unlockAllPlayers() {
    $(".draggable-unit").css("cursor", "grab");
    $("#next-round").hide();
    turnEnded = false;
    currentPlayer = null;
    
    // Increment turn counter
    if (currentGameState) {
        currentGameState.turn++;
    }
}

// Render game units from state
function renderGameUnits() {
    if (!currentGameState) return;
    
    const grid = $('#grid');
    $('.draggable-unit, .enemy-unit').remove();
    
    playerIds = [];
    enemyIds = [];
    
    // Render players
    currentGameState.players.forEach(player => {
        if (player.hp > 0) {
            playerIds.push(player.id);
            playerHP[player.id] = player.hp;
            
            const playerDiv = $(`
                <div id="${player.id}" class="draggable-unit" style="
                    top: ${player.row * tileSize + 7}px; 
                    left: ${player.col * tileSize + 7}px;
                    width: ${tileSize - 14}px;
                    height: ${tileSize - 14}px;
                    background-image: url(${player.img});
                    background-size: cover;
                    background-position: center;
                    border: 2px solid #4CAF50;
                    border-radius: 8px;
                    cursor: grab;
                    position: absolute;
                    z-index: 10;
                ">
                    <div class="hp-label" style="
                        position: absolute;
                        bottom: -20px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        color: white;
                        font-size: 10px;
                        background: rgba(0,0,0,0.7);
                        border-radius: 3px;
                        padding: 2px;
                    ">HP: ${player.hp}</div>
                </div>
            `);
            grid.append(playerDiv);
        }
    });
    
    // Render enemies
    currentGameState.enemies.forEach(enemy => {
        if (enemy.hp > 0) {
            enemyIds.push(enemy.id);
            enemyDataMap[enemy.id] = enemy;
            
            const enemyDiv = $(`
                <div id="${enemy.id}" class="enemy-unit" style="
                    top: ${enemy.row * tileSize + 7}px; 
                    left: ${enemy.col * tileSize + 7}px;
                    width: ${tileSize - 14}px;
                    height: ${tileSize - 14}px;
                    background-image: url(${enemy.img});
                    background-size: cover;
                    background-position: center;
                    border: 2px solid #f44336;
                    border-radius: 8px;
                    position: absolute;
                    z-index: 10;
                ">
                    <div class="hp-label" style="
                        position: absolute;
                        bottom: -20px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        color: white;
                        font-size: 10px;
                        background: rgba(0,0,0,0.7);
                        border-radius: 3px;
                        padding: 2px;
                    ">HP: ${enemy.hp}</div>
                </div>
            `);
            grid.append(enemyDiv);
        }
    });
}

// Initialize game
async function initGame() {
    console.log('🎮 Initializing mobile game...');
    
    // Load level data first
    const levelLoaded = await loadGameLevel();
    
    if (levelLoaded && currentGameState) {
        // Render units from game state
        renderGameUnits();
    } else {
        // Fallback to default state
        console.log('🎮 Using default game state');
        renderGameUnits();
    }
    
    // Initialize mobile controls
    setTimeout(initializeMobileControls, 100);
    
    // Set up game controls
    $("#next-round").on("click", function() {
        unlockAllPlayers();
    });
}

// Initialize on page load
$(function() {
    initGame();
});

// === Curseur ===
const customCursor = document.createElement('div');
customCursor.id = 'customCursor';
document.body.appendChild(customCursor);

let mouseX = 0, mouseY = 0;
let curX = 0, curY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // interpolation fluide pour effet flottant
    curX += (mouseX - curX) * 0.1;
    curY += (mouseY - curY) * 0.1;

    // léger mouvement vertical oscillant
    const floatY = Math.sin(Date.now() * 0.005) * 4;

    customCursor.style.left = curX + 'px';
    customCursor.style.top = (curY + floatY) + 'px';

    requestAnimationFrame(animateCursor);
}

animateCursor();

// === Animation du titre ===
const title = document.getElementById('gameTitle');
const text = title.textContent;
title.textContent = '';
[...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char; // <-- garde les espaces visibles
    span.style.animationDelay = `${i * 0.08}s`;
    title.appendChild(span);
});

// === Jeu de Memory ===
const cards = [
    'img/bluestriped.jpg',
    'img/clownfish.jpg',
    'img/seahorse.jpg',
    'img/cuttle.jpg',
    'img/nero.jpg',
    'img/star.jpg',
    'img/turtle.jpg',
    'img/urchins.jpg'
];

const gameBoard = document.getElementById('game-board');
const aquarium = document.getElementById('aquarium');
let selectedCards = [];

function createCard(CardUrl, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = CardUrl;

    const side = index % 2 === 0 ? '-120vw' : '120vw';
    card.style.setProperty('--from-x', side);
    card.style.setProperty('--from-y', (Math.random() * 100 - 50) + 'px');
    card.style.animationDelay = (index * 0.1) + 's';

    const inner = document.createElement('div');
    inner.classList.add('card-inner');
    const front = document.createElement('div');
    front.classList.add('card-front');
    const back = document.createElement('div');
    back.classList.add('card-back');
    const img = document.createElement('img');
    img.src = CardUrl;
    back.appendChild(img);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    card.addEventListener('click', onCardClick);
    return card;
}

function duplicateArray(arr) { return [...arr, ...arr]; }
function shuffleArray(arr) { return arr.sort(() => Math.random() - 0.5); }

function initGame() {
    aquarium.classList.remove("blurred");
    const msg = document.getElementById("winMessage");
    const btn = document.getElementById("restartButton");
    if (msg) msg.remove();
    if (btn) btn.remove();
    gameBoard.innerHTML = '';
    selectedCards = [];

    const allCards = shuffleArray(duplicateArray(cards));
    allCards.forEach((card, i) => gameBoard.appendChild(createCard(card, i)));

    // --- CENTRER LA DERNIÈRE CARTE SI NOMBRE IMPAIR ---
    const cardsInBoard = gameBoard.children;
    if (cardsInBoard.length % 2 !== 0) {
        const lastCard = cardsInBoard[cardsInBoard.length - 1];
        lastCard.style.gridColumn = '1 / -1';
        lastCard.style.justifySelf = 'center';
    }
}

function onCardClick(e) {
    const card = e.currentTarget;
    if (card.classList.contains('flip') || card.classList.contains('matched') || selectedCards.length >= 2) return;
    card.classList.add('flip');
    selectedCards.push(card);

    if (selectedCards.length === 2) {
        const [first, second] = selectedCards;
        setTimeout(() => {
            if (first.dataset.value === second.dataset.value) {
                first.classList.add('matched');
                second.classList.add('matched');
            } else {
                first.classList.remove('flip');
                second.classList.remove('flip');
            }
            selectedCards = [];
            checkWin();
        }, 800);
    }
}

function checkWin() {
    const allMatched = document.querySelectorAll('.card.matched');
    if (allMatched.length === cards.length * 2) {
        setTimeout(() => {
            showWinMessage();
            launchConfetti();
            showRestartButton();
        }, 500);
    }
}
initGame();

// === Nouveau poisson 3D (poisson stylisé, fluide) ===
const canvas = document.getElementById('aquariumCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1);
scene.add(light);

// Corps principal du poisson
const fishMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
    metalness: 0.5,
    emissive: 0x0088ff,
    emissiveIntensity: 0.4
});

const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const fishBody = new THREE.Mesh(bodyGeometry, fishMaterial);
scene.add(fishBody);

// Nageoires latérales
const finGeometry = new THREE.PlaneGeometry(0.8, 0.3);
const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x00bfff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5
});

const leftFin = new THREE.Mesh(finGeometry, finMaterial);
leftFin.position.set(-0.5, 0, 0);
leftFin.rotation.y = Math.PI / 3;
scene.add(leftFin);

const rightFin = new THREE.Mesh(finGeometry, finMaterial);
rightFin.position.set(0.5, 0, 0);
rightFin.rotation.y = -Math.PI / 3;
scene.add(rightFin);

// Queue (en triangle)
const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 3);
const tail = new THREE.Mesh(tailGeometry, fishMaterial);
tail.rotation.x = Math.PI;
tail.position.z = -0.9;
scene.add(tail);

let fishX = 0, fishY = 0, targetX = 0, targetY = 0;
document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 10;
    targetY = -(e.clientY / window.innerHeight - 0.5) * 6;
});

function animate() {
    requestAnimationFrame(animate);
    fishX += (targetX - fishX) * 0.07;
    fishY += (targetY - fishY) * 0.07;

    [fishBody, leftFin, rightFin, tail].forEach(p => p.position.set(fishX, fishY, p.position.z));

    const angle = Math.atan2(targetY - fishY, targetX - fishX);
    [fishBody, leftFin, rightFin, tail].forEach(p => p.rotation.z = -angle + Math.PI / 2);

    tail.rotation.y = Math.sin(Date.now() * 0.008) * 0.6;
    leftFin.rotation.z = Math.sin(Date.now() * 0.01) * 0.5;
    rightFin.rotation.z = -Math.sin(Date.now() * 0.01) * 0.5;

    renderer.render(scene, camera);
}
animate();

// === Victoire ===
function showWinMessage() {
    const message = document.createElement('div');
    message.id = 'winMessage';
    message.textContent = '🏆 Bravo, tu as gagné !';
    document.body.appendChild(message);
    message.classList.add('show');
}

function showRestartButton() {
    const btn = document.createElement('button');
    btn.id = 'restartButton';
    btn.textContent = '🔁 Recommencer';
    document.body.appendChild(btn);
    aquarium.classList.add("blurred");
    setTimeout(() => btn.classList.add('show'), 400);
    btn.onclick = () => { aquarium.classList.remove("blurred"); btn.remove(); initGame(); };
}

function launchConfetti() {
    const colors = ['#00ffff', '#00eaff', '#ffffff', '#0077ff'];
    const confettiCount = 200;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = 2 + Math.random() * 2 + 's';
        confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
        confetti.style.width = confetti.style.height = Math.random() * 6 + 4 + 'px';

        document.body.appendChild(confetti);

        // Supprimer après animation
        setTimeout(() => confetti.remove(), 4000);
    }
}

function centerLastCard() {
    const cardsInBoard = gameBoard.children;
    if (cardsInBoard.length % 2 !== 0) { // si impair
        const lastCard = cardsInBoard[cardsInBoard.length - 1];
        lastCard.style.gridColumn = '1 / -1'; // occupe toute la ligne
        lastCard.style.justifySelf = 'center'; // centre la carte
    }
}

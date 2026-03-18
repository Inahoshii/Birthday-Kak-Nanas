document.addEventListener("DOMContentLoaded", () => {
    const bgm = document.getElementById('bgm');
    const sfxType = document.getElementById('sfx-type');
    const sfxSlash = document.getElementById('sfx-slash');
    const sfxChime = document.getElementById('sfx-chime');
    const sfxError = document.getElementById('sfx-error');
    bgm.volume = 0.4; sfxType.volume = 0.5;

    const emberContainer = document.getElementById('embers-container');
    for (let i = 0; i < 40; i++) {
        let ember = document.createElement('div');
        ember.classList.add('ember');
        ember.style.left = Math.random() * 100 + 'vw';
        ember.style.animationDuration = (Math.random() * 3 + 2) + 's';
        ember.style.animationDelay = Math.random() * 5 + 's';
        emberContainer.appendChild(ember);
    }

    function goToChamber(hideId, showId) {
        document.getElementById(hideId).classList.remove('active-chamber');
        document.getElementById(hideId).classList.add('hidden');
        document.getElementById(showId).classList.remove('hidden');
        setTimeout(() => document.getElementById(showId).classList.add('active-chamber'), 50);
    }

    // --- 0. TITLE SCREEN LOGIC (BARU) ---
    const chamberStart = document.getElementById('chamber-start');
    
    chamberStart.addEventListener('click', () => {
        // Mainkan musik BGM dan suara tebasan saat layar diklik pertama kali
        bgm.play().catch(e=>console.log("Audio blocked"));
        sfxSlash.play();
        
        // Pindah ke Intro Hades
        goToChamber('chamber-start', 'chamber-intro');
        
        // Mulai ketikan Hades setelah transisi selesai
        setTimeout(typeWriterHades, 1000);
    });

    // --- 1. HADES DIALOGUE ---
    const hadesTextStr = "\"Anas... you think you can escape the grasp of aging? Take a blessing from Olympus, and try to break the Seal of Tartarus if you dare.\"";
    const hadesTextElement = document.getElementById('hades-text');
    const nextBtn = document.getElementById('next-btn');
    let typeIndex1 = 0;

    function typeWriterHades() {
        if (typeIndex1 < hadesTextStr.length) {
            hadesTextElement.innerHTML += hadesTextStr.charAt(typeIndex1);
            if (typeIndex1 % 3 === 0) {
                sfxType.currentTime = 0;
                sfxType.play().catch(e=>console.log("Audio blocked"));
            }
            typeIndex1++;
            setTimeout(typeWriterHades, 40);
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    nextBtn.addEventListener('click', () => {
        sfxSlash.play();
        goToChamber('chamber-intro', 'chamber-boons');
    });

    // --- 2. BOON SELECTION ---
    const boonCards = document.querySelectorAll('.boon-card');
    const flashScreen = document.getElementById('screen-flash');

    boonCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15;
            const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 15;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`);

        card.addEventListener('click', () => {
            sfxSlash.currentTime = 0; sfxSlash.play();
            flashScreen.style.backgroundColor = card.getAttribute('data-god') === 'zeus' ? '#fff' : '#ffb3d9';
            flashScreen.style.opacity = '1';
            setTimeout(() => {
                flashScreen.style.opacity = '0';
                goToChamber('chamber-boons', 'chamber-minigame');
            }, 500);
        });
    });

    // --- 3. GLYPH MEMORY ---
    const glyphBtns = document.querySelectorAll('.glyph-btn');
    const startBtn = document.getElementById('start-memory-btn');
    const statusText = document.getElementById('minigame-status');
    const speedlines = document.getElementById('anime-speedlines');
    
    let sequence = [];
    let playerStep = 0;
    const sequenceLength = 4; 

    startBtn.addEventListener('click', () => {
        startBtn.classList.add('hidden');
        generateSequence();
        playSequence();
    });

    function generateSequence() {
        sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            sequence.push(Math.floor(Math.random() * 3));
        }
    }

    function playSequence() {
        statusText.innerText = "Observe the sequence...";
        statusText.style.color = "#ffd700";
        glyphBtns.forEach(btn => btn.classList.remove('interactive'));
        
        let i = 0;
        const interval = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(interval);
                statusText.innerText = "Your turn! Replicate the seal.";
                glyphBtns.forEach(btn => btn.classList.add('interactive'));
                playerStep = 0;
                return;
            }
            const targetBtn = document.querySelector(`.glyph-btn[data-id="${sequence[i]}"]`);
            sfxChime.currentTime = 0; sfxChime.play();
            targetBtn.classList.add('active');
            setTimeout(() => targetBtn.classList.remove('active'), 500);
            i++;
        }, 1000); 
    }

    glyphBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!btn.classList.contains('interactive')) return;

            const clickedId = parseInt(e.target.getAttribute('data-id'));
            
            if (clickedId === sequence[playerStep]) {
                sfxSlash.currentTime = 0; sfxSlash.play();
                btn.classList.add('active');
                setTimeout(() => btn.classList.remove('active'), 200);
                playerStep++;

                if (playerStep === sequence.length) {
                    statusText.innerText = "SEAL BREACHED!";
                    statusText.style.color = "#00ff00";
                    glyphBtns.forEach(b => b.classList.remove('interactive'));
                    
                    speedlines.classList.add('show-speedlines');
                    sfxChime.play();

                    flashScreen.style.backgroundColor = '#fff';
                    setTimeout(() => {
                        flashScreen.style.opacity = '1';
                        setTimeout(() => {
                            flashScreen.style.opacity = '0';
                            speedlines.classList.remove('show-speedlines');
                            goToChamber('chamber-minigame', 'chamber-zagreus');
                            setTimeout(typeWriterZagreus, 1000);
                        }, 500);
                    }, 1500);
                }
            } else {
                sfxError.play();
                btn.classList.add('error');
                statusText.innerText = "Incorrect! Resetting the seal...";
                statusText.style.color = "#ff3333";
                glyphBtns.forEach(b => b.classList.remove('interactive'));
                setTimeout(() => {
                    btn.classList.remove('error');
                    playSequence(); 
                }, 1500);
            }
        });
    });

    // --- 4. ZAGREUS DIALOGUE ---
    const zagreusTextStr = "\"Whew... Made it. Hey, Anas. Escaping the Underworld is no joke, but you pulled it off. Happy Level Up! The surface is all yours now. Go celebrate!\"";
    const zagreusTextElement = document.getElementById('zagreus-text');
    const zagreusNextBtn = document.getElementById('zagreus-next-btn');
    let typeIndex2 = 0;

    function typeWriterZagreus() {
        if (typeIndex2 < zagreusTextStr.length) {
            zagreusTextElement.innerHTML += zagreusTextStr.charAt(typeIndex2);
            if (typeIndex2 % 3 === 0) {
                sfxType.currentTime = 0;
                sfxType.play().catch(e=>console.log("Audio blocked"));
            }
            typeIndex2++;
            setTimeout(typeWriterZagreus, 40);
        } else {
            zagreusNextBtn.classList.remove('hidden');
        }
    }

    zagreusNextBtn.addEventListener('click', () => {
        sfxSlash.play();
        goToChamber('chamber-zagreus', 'chamber-victory');
    });
});

zagreusNextBtn.addEventListener('click', () => {
        sfxSlash.play();
        
        // 1. Matikan lagu utama (Hades BGM) perlahan atau langsung
        bgm.pause();
        
        // 2. Putar lagu khusus closing
        const bgmClosing = document.getElementById('bgm-closing');
        bgmClosing.volume = 0.5; // Sesuaikan volume (0.0 sampai 1.0)
        bgmClosing.play().catch(e=>console.log("Audio closing blocked"));

        // 3. Pindah ke layar kemenangan (Victory)
        goToChamber('chamber-zagreus', 'chamber-victory');
    });
/* ══════════════════════════════════════════════════════════
   A LITTLE GIFT FOR YOU — Gift Opening & Loading Screen
   Smooth first page fadeout + Grid-based rotating flower loading
   animation from interactive_gift_website (6).html on #FFF5E8 background.
   ══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ════════════════════════════════════════════════════════
    //  Supabase Client Setup & Real-time Response Tracker
    // ════════════════════════════════════════════════════════
    let supabaseClient = null;
    const cfg = window.SUPABASE_CONFIG || {};
    const sbUrl = cfg.url || window.SUPABASE_URL || '';
    const sbKey = cfg.anonKey || window.SUPABASE_ANON_KEY || '';

    try {
        if (window.supabase && sbUrl && sbKey && !sbUrl.includes('YOUR_SUPABASE_URL')) {
            supabaseClient = window.supabase.createClient(sbUrl, sbKey);
            console.log('✅ [Supabase] Client initialized successfully for responses');
        } else {
            console.info('ℹ️ [Supabase] Setup ready. Paste your project URL & Anon Key into supabase-config.js');
        }
    } catch (err) {
        console.warn('⚠️ [Supabase] Client init exception:', err);
    }

    /**
     * Saves user (Akka) response and exact timestamp to Supabase 'responses' table.
     * Executes smoothly in real-time without blocking animations.
     */
    async function saveSupabaseResponse(question, answer) {
        const timestamp = new Date().toISOString();
        const formattedText = `[${question}] ${answer}`;
        console.log(`🌸 [Response Clicked] ${formattedText} | Time: ${timestamp}`);

        if (!supabaseClient) {
            try {
                const pending = JSON.parse(localStorage.getItem('pending_responses') || '[]');
                pending.push({ question, answer, timestamp });
                localStorage.setItem('pending_responses', JSON.stringify(pending));
            } catch (_) {}
            return;
        }

        try {
            // Priority 1: Matches your Supabase table schema ('text', 'created_at')
            const { data, error } = await supabaseClient.from('responses').insert([
                {
                    text: formattedText,
                    created_at: timestamp
                }
            ]);

            if (error) {
                console.warn('[Supabase] Insert notice:', error.message);

                // Check for RLS policy notice
                if (error.code === '42501' || (error.message && error.message.includes('row-level security'))) {
                    console.error('⚠️ [Supabase RLS Notice] Table "responses" has Row Level Security enabled. Please allow anon insert or disable RLS in Supabase SQL editor: ALTER TABLE responses DISABLE ROW LEVEL SECURITY;');
                }

                // Fallback attempt: if columns 'question' and 'answer' exist
                await supabaseClient.from('responses').insert([
                    { question: question, answer: answer, created_at: timestamp }
                ]);
            } else {
                console.log('✅ [Supabase] Saved response successfully to responses table:', formattedText);
            }
        } catch (err) {
            console.warn('[Supabase] Failed to save response:', err);
        }
    }

    // ─── DOM Elements ───
    const firstPageContent = document.getElementById('first-page-content');
    const giftWrapper      = document.getElementById('gift-wrapper');
    const giftHint         = document.getElementById('gift-hint');
    const flowerContainer  = document.getElementById('flower-container');
    const particlesBox     = document.getElementById('particles-container');

    // ─── State ───
    let isOpened = false;

    // ─── Particle Emojis ───
    const particleSymbols = ['✨', '🤍', '💫', '♡', '✧', '🤍', '🌸', '🌷'];

    // ─── Transparent PNG Flower Images (from uploaded file) ───
    const images = [
        'assets/flowers/Gemini_Generated_Image_v1xz1dv1xz1dv1xz-removebg-preview.png', // Pink Rose
        'assets/flowers/Gemini_Generated_Image_831frq831frq831f-removebg-preview.png'  // White Rose
    ];

    // ════════════════════════════════════════════════════════
    //  openGift()
    //  Triggered on gift box click:
    //  1. Smoothly fades out gift box and heading/hint
    //  2. Immediately triggers rotating flower loading animation
    //  3. After 4.5 seconds, parts flowers to left & right
    //  4. Leaves clean #FFF5E8 creamy ivory background
    // ════════════════════════════════════════════════════════
    function openGift() {
        if (isOpened) return;
        isOpened = true;

        // Start background music automatically on gift click and loop continuously
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.play().catch(function (err) {
                console.log('Background music play error:', err);
            });
        }

        // 1. Gentle initial bounce & sparkle burst
        giftWrapper.classList.add('gift-clicked');
        spawnBurstParticles(14);

        // 2. Smoothly fade out the entire first page (gift box & text)
        if (firstPageContent) {
            firstPageContent.classList.add('content-fade-out');
        }

        // 3. Immediately trigger the rotating flower loading animation
        startRotatingFlowerLoading();
    }

    // ════════════════════════════════════════════════════════
    //  startRotatingFlowerLoading()
    //  From interactive_gift_website (6).html:
    //  Grid-based organic flower curtain that falls and rotates,
    //  covering the screen, then parts cleanly in the middle at 4.5s.
    // ════════════════════════════════════════════════════════
    function startRotatingFlowerLoading() {
        if (!flowerContainer) return;

        const fragment = document.createDocumentFragment();
        const flowerData = [];

        // Grid loop to cover the entire screen organically
        for (let vw = -10; vw <= 110; vw += 8) {
            for (let vh = -10; vh <= 110; vh += 10) {
                const img = document.createElement('img');
                img.src = images[Math.floor(Math.random() * images.length)];
                img.classList.add('flower');

                // Flower size between 80px and 150px
                const size = Math.random() * 70 + 80;
                img.style.width = `${size}px`;
                img.style.height = 'auto';

                // Organic jitter so flowers are not in rigid lines
                const jitterX = Math.random() * 6 - 3;
                const jitterY = Math.random() * 8 - 4;

                const finalLeft = vw + jitterX;
                const finalTop  = vh + jitterY;
                const baseRotation = Math.random() * 360;

                // Position flower
                img.style.left = `${finalLeft}vw`;
                img.style.top  = `${finalTop}vh`;

                // Start far above screen with rotation
                img.style.transform = `translateY(-150vh) rotate(${baseRotation}deg)`;

                // Save parting side (left vs right) and initial rotation
                img.dataset.side = finalLeft < 50 ? 'left' : 'right';
                img.dataset.rotation = baseRotation;

                fragment.appendChild(img);

                flowerData.push({
                    element: img,
                    baseRotation: baseRotation,
                    fallDelay: Math.random() * 500,
                    fallDuration: Math.random() * 1.5 + 1.5
                });
            }
        }

        flowerContainer.appendChild(fragment);

        // 1. Fall down and rotate animation
        requestAnimationFrame(function () {
            flowerData.forEach(function (item) {
                setTimeout(function () {
                    item.element.style.transition = `transform ${item.fallDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                    item.element.style.transform = `translateY(0) rotate(${item.baseRotation + 45}deg)`;
                }, item.fallDelay);
            });
        });

        // 2. Part flowers in the middle after 4.5 seconds & reveal 'From me to you' section
        setTimeout(function () {
            // Smoothly reveal the "From me to you" section behind parting flowers
            const fromMeSection = document.getElementById('from-me-to-you');
            if (fromMeSection) {
                fromMeSection.classList.add('active');
            }

            const flowers = flowerContainer.querySelectorAll('.flower');
            flowers.forEach(function (flower) {
                const side = flower.dataset.side;
                const currentRotation = parseFloat(flower.dataset.rotation || 0) + 45;

                const moveX = side === 'left' ? '-150vw' : '150vw';
                const moveY = `${Math.random() * 40 - 20}vh`;

                flower.style.transition = 'transform 2.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 2.5s ease-in-out';
                flower.style.transform = `translate(${moveX}, ${moveY}) rotate(${currentRotation + 90}deg)`;
                flower.style.opacity = '0';
            });

            // 3. Clean up container after parting animation finishes
            setTimeout(function () {
                flowerContainer.innerHTML = '';
            }, 2700);

        }, 4500);
    }

    // ════════════════════════════════════════════════════════
    //  spawnBurstParticles(count)
    //  Sparkle burst on gift tap
    // ════════════════════════════════════════════════════════
    function spawnBurstParticles(count) {
        if (!particlesBox || !giftWrapper) return;
        const rect = giftWrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('span');
            particle.classList.add('particle');
            particle.textContent = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];

            const angle    = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const distance = 70 + Math.random() * 90;
            const dx       = Math.cos(angle) * distance;
            const dy       = Math.sin(angle) * distance - 25;

            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            particle.style.left = centerX + 'px';
            particle.style.top  = centerY + 'px';
            particle.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
            particle.style.animationDelay = (i * 0.03) + 's';

            particlesBox.appendChild(particle);

            setTimeout(function () {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    }

    // ─── Event Listeners ───

    if (giftWrapper) {
        giftWrapper.addEventListener('click', function (e) {
            e.preventDefault();
            openGift();
        });

        giftWrapper.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openGift();
            }
        });
    }

    if (giftHint) {
        giftHint.addEventListener('click', function (e) {
            e.preventDefault();
            openGift();
        });
    }

    // Smooth scroll down to quote card on clicking the scroll prompt
    const scrollPrompt = document.querySelector('.scroll-prompt');
    const quoteSection = document.querySelector('.quote-card-section');
    if (scrollPrompt && quoteSection) {
        scrollPrompt.addEventListener('click', function () {
            quoteSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ════════════════════════════════════════════════════════
    //  Section 4 — Padlock & Numeric Keypad Logic
    // ════════════════════════════════════════════════════════
    const padlockTrigger   = document.getElementById('padlock-trigger');
    const keypadCard       = document.getElementById('keypad-card');
    const indicatorCircles = document.querySelectorAll('.indicator-circle');
    const indicatorsWrap   = document.querySelector('.passkey-indicators-wrap');
    const keypadButtons    = document.querySelectorAll('.keypad-btn');

    let enteredPasskey = '';
    const CORRECT_PASSKEY = '0911';
    let isLockedInput = false;

    // Open keypad in-place when padlock is clicked (stays on exact same page, no reloading)
    if (padlockTrigger && keypadCard) {
        function revealKeypad(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            // Smoothly fade out padlock and reveal keypad in place
            padlockTrigger.classList.add('hidden');
            keypadCard.classList.add('visible');
            keypadCard.setAttribute('aria-hidden', 'false');
        }

        padlockTrigger.addEventListener('click', revealKeypad);
        padlockTrigger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                revealKeypad(e);
            }
        });
    }

    // Update indicator dots according to entered digits
    function updateIndicators() {
        indicatorCircles.forEach(function (circle, index) {
            if (index < enteredPasskey.length) {
                circle.classList.add('filled');
            } else {
                circle.classList.remove('filled');
            }
        });
    }

    // Handle digit input
    function handleDigit(digit) {
        if (isLockedInput) return;
        if (enteredPasskey.length >= 4) return;

        enteredPasskey += digit;
        updateIndicators();

        if (enteredPasskey.length === 4) {
            if (enteredPasskey === CORRECT_PASSKEY) {
                isLockedInput = true;

                // When user enters correct passkey '0911':
                // Smoothly fade out keypad and display rotating rose wreath loading screen
                setTimeout(function () {
                    if (keypadCard) {
                        keypadCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        keypadCard.style.opacity = '0';
                        keypadCard.style.transform = 'scale(0.92)';
                    }

                    const loader = document.getElementById('rose-wreath-loader');
                    const emptyPage = document.getElementById('fresh-empty-page');
                    const pookieSection = document.getElementById('pookie-question-section');

                    if (loader) {
                        loader.classList.add('active');
                        loader.setAttribute('aria-hidden', 'false');

                        // After rotating rose wreath animation finishes, transition to fresh empty page,
                        // and then smoothly reveal the romantic "Would you like to be my Pookie?" section
                        setTimeout(function () {
                            if (emptyPage) {
                                emptyPage.classList.add('active');
                                emptyPage.setAttribute('aria-hidden', 'false');
                            }
                            loader.classList.remove('active');
                            loader.setAttribute('aria-hidden', 'true');

                            // After a gentle moment on the empty creamy page, reveal the interactive Pookie question
                            setTimeout(function () {
                                if (pookieSection) {
                                    pookieSection.classList.add('active');
                                    pookieSection.setAttribute('aria-hidden', 'false');
                                }
                            }, 1200);

                        }, 3800);
                    }
                }, 350);
            } else {
                // Incorrect passkey: shake indicators and reset for retry
                isLockedInput = true;
                if (indicatorsWrap) {
                    indicatorsWrap.classList.add('shake');
                }
                setTimeout(function () {
                    if (indicatorsWrap) {
                        indicatorsWrap.classList.remove('shake');
                    }
                    enteredPasskey = '';
                    updateIndicators();
                    isLockedInput = false;
                }, 550);
            }
        }
    }

    // Handle clear action
    function handleClear() {
        if (isLockedInput && enteredPasskey === CORRECT_PASSKEY) {
            // Already solved, but if user wants to clear:
            isLockedInput = false;
        }
        enteredPasskey = '';
        updateIndicators();
    }

    // Attach click listeners to keypad buttons
    keypadButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const action = btn.dataset.action;
            const key = btn.dataset.key;

            if (action === 'clear') {
                handleClear();
            } else if (key !== undefined) {
                handleDigit(key);
            }
        });
    });

    // Keyboard support when keypad is visible
    window.addEventListener('keydown', function (e) {
        if (!keypadCard || !keypadCard.classList.contains('visible')) return;

        if (e.key >= '0' && e.key <= '9') {
            handleDigit(e.key);
        } else if (e.key === 'Backspace' || e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            handleClear();
        }
    });

    // ════════════════════════════════════════════════════════
    //  Section 6 — Romantic "Be my Pookie?" Interactive Logic
    // ════════════════════════════════════════════════════════
    const pookieYesBtn  = document.getElementById('pookie-btn-yes');
    const pookieNoBtn   = document.getElementById('pookie-btn-no');
    const pookieSectionElem = document.getElementById('pookie-question-section');
    const pookieYesPage = document.getElementById('pookie-yes-page');

    let noClickCount = 0;
    const noMessages = [
        'Oh no? 🥺',
        'You have to say yes! 😠',
        'Are you sure?? 💔',
        'Pleeease? 😭',
        'Oops, no choice now! 🙈'
    ];

    if (pookieNoBtn && pookieYesBtn) {
        pookieNoBtn.addEventListener('click', function (e) {
            e.preventDefault();
            noClickCount++;

            // Save response in real-time
            const currentNoText = pookieNoBtn.textContent.trim();
            saveSupabaseResponse('Oya math ekka yalui nedaaa ? 🥺👉👈', 'No (' + currentNoText + ')');

            // Grow the 'Yes' button with each 'No' attempt
            const yesScale = Math.min(1 + noClickCount * 0.16, 2.0);
            pookieYesBtn.style.transform = `scale(${yesScale})`;

            if (noClickCount === 1) {
                pookieNoBtn.textContent = noMessages[0];
            } else if (noClickCount === 2) {
                pookieNoBtn.textContent = noMessages[1];
            } else if (noClickCount === 3) {
                pookieNoBtn.textContent = noMessages[2];
                pookieNoBtn.style.position = 'relative';
                pookieNoBtn.style.transform = 'translate(-45px, -25px)';
            } else if (noClickCount === 4) {
                pookieNoBtn.textContent = noMessages[3];
                pookieNoBtn.style.position = 'relative';
                pookieNoBtn.style.transform = 'translate(65px, 25px)';
            } else if (noClickCount >= 5) {
                pookieNoBtn.textContent = noMessages[4];
                pookieNoBtn.classList.add('disappearing');

                setTimeout(function () {
                    pookieNoBtn.style.display = 'none';
                }, 400);
            }
        });
    }

    // ════════════════════════════════════════════════════════
    //  Section 7, 8, 9 — GIF -> Wants Question -> Love Message
    // ════════════════════════════════════════════════════════
    const gifScreen       = document.getElementById('gif-transition-screen');
    const wantsSection    = document.getElementById('wants-question-section');
    const wantsButtons    = document.querySelectorAll('.wants-btn');
    const finalLoveSec    = document.getElementById('final-love-section');
    const finalLoveTitle  = document.getElementById('final-love-title');
    const finalLoveText   = document.getElementById('final-love-text');

    // Messages mapped to choices
    const choiceMessages = {
        hug: {
            title: "Hamadama thurul karagana innam man! 🫂🤍",
            text: "Godak adarei mage pookie.. oya langinma innawa onema welawaka, hamadama thurul karagena! 🥺💖✨"
        },
        kiss: {
            title: "Mage sudu mikata umma godaaaak! 💋😘",
            text: "Godak godak umma godaaaaak dennam mage Chuti nonahh, hamadama adarein! 💋🥰❤️"
        },
        both: {
            title: "Thurul karagena umma godaaaak dennam! 🫂💋",
            text: "Godak adarei mage pookie.. godaaak thurul karagena umma godaaaaak dennam hamadama! 🫂💋🥰❤️✨"
        }
    };

    // When user clicks 'Yes' on the Pookie question:
    if (pookieYesBtn) {
        pookieYesBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Save response in real-time
            saveSupabaseResponse('Oya math ekka yalui nedaaa ? 🥺👉👈', 'Yes 💖');

            // 1. Fade out the Pookie question section smoothly
            if (pookieSectionElem) {
                pookieSectionElem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                pookieSectionElem.style.opacity = '0';
                pookieSectionElem.style.transform = 'scale(0.96)';
            }

            setTimeout(function () {
                if (pookieSectionElem) {
                    pookieSectionElem.classList.remove('active');
                    pookieSectionElem.setAttribute('aria-hidden', 'true');
                }

                // 2. Display centered animated GIF ('gigitin.gif') and play once smoothly
                if (gifScreen) {
                    const gifImg = gifScreen.querySelector('.animated-transition-gif');
                    if (gifImg) {
                        // Reset source so the GIF starts fresh from frame 0
                        gifImg.src = 'assets/gigitin.gif?t=' + Date.now();
                    }
                    gifScreen.style.transition = 'opacity 0.4s ease';
                    gifScreen.style.opacity = '1';
                    gifScreen.classList.add('active');
                    gifScreen.setAttribute('aria-hidden', 'false');

                    // gigitin.gif duration is ~1900ms (plays once cleanly)
                    setTimeout(function () {
                        gifScreen.style.transition = 'opacity 0.5s ease';
                        gifScreen.style.opacity = '0';

                        setTimeout(function () {
                            gifScreen.classList.remove('active');
                            gifScreen.setAttribute('aria-hidden', 'true');

                            // 3. Right after, display 'Oyata mokadda one?' question section
                            if (wantsSection) {
                                wantsSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                                wantsSection.classList.add('active');
                                wantsSection.setAttribute('aria-hidden', 'false');
                            }
                        }, 500);

                    }, 1950);
                }
            }, 500);
        });
    }

    // ════════════════════════════════════════════════════════
    //  Section 10 & 11 — Letter Section & Final Video View
    // ════════════════════════════════════════════════════════
    const toLetterBtn    = document.getElementById('to-letter-btn');
    const letterSection  = document.getElementById('letter-section');
    const lastOneBtn     = document.getElementById('last-one-btn');
    const videoSection   = document.getElementById('video-section');
    const finalVideo     = document.getElementById('final-video');
    const videoReplayBtn = document.getElementById('video-replay-btn');

    let letterTransitionTimeout = null;

    function transitionToLetter() {
        if (letterTransitionTimeout) {
            clearTimeout(letterTransitionTimeout);
            letterTransitionTimeout = null;
        }

        if (finalLoveSec) {
            finalLoveSec.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            finalLoveSec.style.opacity = '0';
            finalLoveSec.style.transform = 'scale(0.96)';
        }

        setTimeout(function () {
            if (finalLoveSec) {
                finalLoveSec.classList.remove('active');
                finalLoveSec.setAttribute('aria-hidden', 'true');
            }

            if (letterSection) {
                letterSection.style.opacity = '1';
                letterSection.classList.add('active');
                letterSection.setAttribute('aria-hidden', 'false');
            }
        }, 600);
    }

    if (toLetterBtn) {
        toLetterBtn.addEventListener('click', function (e) {
            e.preventDefault();
            transitionToLetter();
        });
    }

    // When user clicks any of the 3 wants options:
    wantsButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const choice = btn.dataset.choice || 'both';
            const msgData = choiceMessages[choice] || choiceMessages.both;
            const selectedText = btn.textContent.trim();

            // Save response in real-time
            saveSupabaseResponse('Oyata mokadda one? 🥺💖', selectedText);

            if (finalLoveTitle) finalLoveTitle.textContent = msgData.title;
            if (finalLoveText) finalLoveText.textContent = msgData.text;

            // Fade out wants question section
            if (wantsSection) {
                wantsSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                wantsSection.style.opacity = '0';
                wantsSection.style.transform = 'scale(0.96)';
            }

            setTimeout(function () {
                if (wantsSection) {
                    wantsSection.classList.remove('active');
                }

                // Show sweet love message with shy cat sticker
                if (finalLoveSec) {
                    finalLoveSec.classList.add('active');
                    finalLoveSec.setAttribute('aria-hidden', 'false');

                    // Auto-advance to letter section smoothly after 4.5 seconds or on button click
                    if (letterTransitionTimeout) clearTimeout(letterTransitionTimeout);
                    letterTransitionTimeout = setTimeout(function () {
                        transitionToLetter();
                    }, 4500);
                }
            }, 600);
        });
    });

    // When user clicks 'Last one' at the bottom of the letter:
    if (lastOneBtn) {
        lastOneBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Pre-start video play inside user gesture so browsers never block it
            if (finalVideo) {
                finalVideo.currentTime = 0;
                finalVideo.muted = false;
                finalVideo.volume = 1.0;
                const p = finalVideo.play();
                if (p !== undefined) {
                    p.catch(function () {
                        // Fallback: if browser blocks unmuted sound, mute and play
                        finalVideo.muted = true;
                        finalVideo.play().catch(function () {});
                    });
                }
            }

            // Smoothly fade out background music so only the video sound plays
            const bgMusic = document.getElementById('bg-music');
            if (bgMusic && !bgMusic.paused) {
                const fadeStep = bgMusic.volume / 10;
                const fadeInterval = setInterval(function () {
                    if (bgMusic.volume > fadeStep) {
                        bgMusic.volume = Math.max(0, bgMusic.volume - fadeStep);
                    } else {
                        clearInterval(fadeInterval);
                        bgMusic.pause();
                        bgMusic.volume = 1.0;
                    }
                }, 45);
            }

            // Smoothly fade out letter section
            if (letterSection) {
                letterSection.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
                letterSection.style.opacity = '0';
                letterSection.style.transform = 'scale(0.96)';
            }

            setTimeout(function () {
                if (letterSection) {
                    letterSection.classList.remove('active');
                    letterSection.setAttribute('aria-hidden', 'true');
                }

                // Smoothly show full-view video overlay and play video with original sound
                if (videoSection) {
                    videoSection.classList.add('active');
                    videoSection.setAttribute('aria-hidden', 'false');

                    if (finalVideo && finalVideo.paused) {
                        finalVideo.play().catch(function () {
                            finalVideo.muted = true;
                            finalVideo.play().catch(function () {});
                        });
                    }
                }
            }, 600);
        });
    }

    // Video tap-to-toggle play/pause
    if (finalVideo) {
        finalVideo.addEventListener('click', function () {
            if (finalVideo.paused) {
                finalVideo.play();
            } else {
                finalVideo.pause();
            }
        });
    }

    // Video replay button
    if (videoReplayBtn && finalVideo) {
        videoReplayBtn.addEventListener('click', function (e) {
            e.preventDefault();
            finalVideo.muted = false;
            finalVideo.currentTime = 0;
            finalVideo.play();
        });
    }

})();

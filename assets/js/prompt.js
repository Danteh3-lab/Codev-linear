class Prompt {
    constructor(target, options = {}) {
        this.playground = document.querySelector(target);
        this.promptWindow = this.playground ? this.playground.querySelector('.prompt-container') : null;
        this.promptForm = this.playground ? this.playground.querySelector('#prompt-form') : null;
        this.promptInput = this.promptForm ? this.promptForm.querySelector('input[name="prompt"]') : null;
        this.sendButton = this.promptForm ? this.promptForm.querySelector('button[type="submit"]') : null;

        this.promptList = [];
        this.chatModel = 'website build';

        this.typingSpeed = options.typingSpeed ?? 18;
        this.typingSpeedInput = options.typingSpeedInput ?? 20;
        this.sendPressDurationMs = options.sendPressDurationMs ?? 140;
        this.turnPauseMs = options.turnPauseMs ?? 320;
        this.variantEndPauseMs = options.variantEndPauseMs ?? 1500;
        this.lineClearStepMs = options.lineClearStepMs ?? 95;

        this.variantIndex = 0;
        this.timers = new Set();
        this.autoplayEnabled = options.autoplay ?? true;
        this.autoplayStopped = false;
        this.isVariantRunning = false;
        this.isAutoplayComposing = false;

        this.variants = options.variants || [
            {
                model: 'website build',
                messages: [
                    { speaker: 'client', text: 'We need a clean site that feels premium, but we still need to update it ourselves after launch.' },
                    { speaker: 'codev', text: 'Makes sense. We can ship the core pages first and leave room for phase two updates.' },
                    { speaker: 'client', text: 'Can we keep the enquiry flow short? We lose leads when forms get long.' },
                    { speaker: 'codev', text: 'Yes. We will keep it tight and test the flow before we start building.' }
                ]
            },
            {
                model: 'web app',
                messages: [
                    { speaker: 'client', text: 'We need a web app for operations, but the current process is all over the place.' },
                    { speaker: 'codev', text: 'Then let us map the real workflow first and build release one around daily tasks.' },
                    { speaker: 'client', text: 'We also need roles and permissions from day one.' },
                    { speaker: 'codev', text: 'Agreed. We will define access levels early and lock handoff checkpoints before delivery.' }
                ]
            },
            {
                model: 'internal business tool',
                messages: [
                    { speaker: 'client', text: 'Our team is still copying data between spreadsheets and it is slowing everything down.' },
                    { speaker: 'codev', text: 'We can replace that with an internal tool that targets the worst bottlenecks first.' },
                    { speaker: 'client', text: 'Can we roll it out team by team without disrupting everyone at once?' },
                    { speaker: 'codev', text: 'Yes. We will phase rollout in small steps and support each team through the switch.' }
                ]
            }
        ];

        if (this.canAutoplay() && this.autoplayEnabled) {
            this.startAutoplay();
        }

        this.emitState();
    }

    canAutoplay() {
        return Boolean(this.promptWindow && this.promptForm && this.promptInput && this.sendButton);
    }

    setAIModel(model) {
        if (!model) {
            return;
        }

        this.chatModel = model.toLowerCase();
        this.emitState();
    }

    emitState() {
        if (!this.playground) {
            return;
        }

        this.playground.dispatchEvent(new CustomEvent('prompt:model-change', {
            detail: {
                model: this.chatModel
            }
        }));
    }

    stopAutoplay() {
        this.autoplayStopped = true;
        this.isVariantRunning = false;
        this.isAutoplayComposing = false;
        this.clearTimers();
        this.clearVisualState();
        if (this.promptWindow) {
            this.promptWindow.querySelectorAll('.typing-cursor').forEach((cursor) => cursor.remove());
        }
    }

    clearVisualState() {
        if (this.promptInput) {
            this.promptInput.classList.remove('input-typing');
            this.promptInput.removeAttribute('data-actor');
        }
        if (this.sendButton) {
            this.sendButton.classList.remove('send-press');
        }
    }

    startAutoplay() {
        if (!this.canAutoplay() || this.autoplayStopped || this.isVariantRunning) {
            return;
        }

        this.playVariant(this.variantIndex);
    }

    playVariant(index) {
        if (!this.canAutoplay() || this.autoplayStopped) {
            return;
        }

        const variant = this.variants[index];
        if (!variant) {
            this.variantIndex = 0;
            this.playVariant(0);
            return;
        }

        this.isVariantRunning = true;
        this.chatModel = variant.model;
        this.emitState();
        this.preparePromptWindow();
        this.promptWindow.replaceChildren();
        this.clearInputSurface();

        const runTurn = (turnIndex) => {
            if (this.autoplayStopped) {
                this.isVariantRunning = false;
                this.clearVisualState();
                return;
            }

            const turn = variant.messages[turnIndex];
            if (!turn) {
                this.schedule(() => {
                    this.clearVariantLineByLine(() => {
                        this.isVariantRunning = false;
                        if (this.autoplayStopped) {
                            return;
                        }
                        this.variantIndex = (this.variantIndex + 1) % this.variants.length;
                        this.playVariant(this.variantIndex);
                    });
                }, this.variantEndPauseMs);
                return;
            }

            this.playTurn(
                turn,
                () => this.schedule(() => runTurn(turnIndex + 1), this.turnPauseMs),
                () => this.autoplayStopped
            );
        };

        runTurn(0);
    }

    playTurn(turn, onComplete, shouldAbort = () => false) {
        if (turn.speaker === 'codev') {
            this.clearInputSurface();
            this.schedule(() => {
                if (shouldAbort()) {
                    return;
                }

                this.commitTurnToBubble('codev', turn.text);
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }, 180);
            return;
        }

        this.typeIntoInput(turn.text, turn.speaker, () => {
            if (shouldAbort()) {
                return;
            }

            this.schedule(() => {
                this.animateSendPress(() => {
                    if (shouldAbort()) {
                        return;
                    }

                    this.commitTurnToBubble(turn.speaker, turn.text);
                    this.clearInputSurface();
                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }, shouldAbort);
            }, 180);
        }, shouldAbort);
    }

    typeIntoInput(text, actor, onComplete, shouldAbort = () => false) {
        if (!this.promptInput) {
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        this.isAutoplayComposing = true;
        this.promptInput.classList.add('input-typing');
        this.promptInput.setAttribute('data-actor', actor);
        this.promptInput.value = '';
        this.promptInput.focus({ preventScroll: true });

        const characters = Array.from(text || '');
        let index = 0;

        const tick = () => {
            if (shouldAbort()) {
                this.isAutoplayComposing = false;
                return;
            }

            this.promptInput.value += characters[index];
            index += 1;
            const end = this.promptInput.value.length;
            this.promptInput.setSelectionRange(end, end);

            if (index < characters.length) {
                this.schedule(tick, this.typingSpeedInput);
                return;
            }

            this.isAutoplayComposing = false;
            if (typeof onComplete === 'function') {
                onComplete();
            }
        };

        if (characters.length === 0) {
            this.isAutoplayComposing = false;
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        this.schedule(tick, this.typingSpeedInput);
    }

    animateSendPress(onComplete, shouldAbort = () => false) {
        if (!this.sendButton) {
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        if (shouldAbort()) {
            return;
        }

        this.sendButton.classList.add('send-press');
        this.schedule(() => {
            this.sendButton.classList.remove('send-press');
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }, this.sendPressDurationMs);
    }

    clearInputSurface() {
        if (!this.promptInput) {
            return;
        }

        this.promptInput.value = '';
        this.promptInput.classList.remove('input-typing');
        this.promptInput.removeAttribute('data-actor');
    }

    commitTurnToBubble(speaker, text) {
        this.appendMessage(speaker, text);
    }

    clearVariantLineByLine(onComplete) {
        if (!this.promptWindow) {
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        const lines = Array.from(this.promptWindow.querySelectorAll('.chat-line'));
        if (lines.length === 0) {
            this.promptWindow.replaceChildren();
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        lines.forEach((line, lineIndex) => {
            this.schedule(() => {
                line.classList.add('chat-line-exit');
            }, lineIndex * this.lineClearStepMs);
        });

        this.schedule(() => {
            this.promptWindow.replaceChildren();
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }, lines.length * this.lineClearStepMs + 240);
    }

    preparePromptWindow() {
        if (!this.promptWindow) {
            return;
        }

        this.promptWindow.classList.remove('items-center', 'justify-center');
        this.promptWindow.classList.add('p-4', 'gap-4');
    }

    appendMessage(speaker, text = '') {
        if (!this.promptWindow) {
            return null;
        }

        const isClient = speaker === 'client';
        const container = document.createElement('div');
        container.className = 'w-full flex mb-2 chat-line';

        const bubble = document.createElement('div');
        bubble.className = `${isClient ? 'chat-user-bubble' : 'chat-team-bubble'} animate-[fadeIn_0.3s_ease-out]`;
        bubble.textContent = text;

        container.appendChild(bubble);
        this.promptWindow.appendChild(container);
        this.promptWindow.scrollTop = this.promptWindow.scrollHeight;
        return bubble;
    }

    typeMessage(speaker, text, onComplete, shouldAbort = () => false) {
        const bubble = this.appendMessage(speaker, '');
        if (!bubble) {
            return;
        }

        const textNode = document.createElement('span');
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '|';

        bubble.appendChild(textNode);
        bubble.appendChild(cursor);

        let index = 0;
        const characters = Array.from(text);

        const tick = () => {
            if (shouldAbort()) {
                cursor.remove();
                return;
            }

            textNode.textContent += characters[index];
            index += 1;
            this.promptWindow.scrollTop = this.promptWindow.scrollHeight;

            if (index < characters.length) {
                this.schedule(tick, this.typingSpeed);
                return;
            }

            cursor.remove();
            if (typeof onComplete === 'function') {
                onComplete();
            }
        };

        if (characters.length === 0) {
            cursor.remove();
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        this.schedule(tick, this.typingSpeed);
    }

    schedule(callback, delayMs) {
        const timerId = window.setTimeout(() => {
            this.timers.delete(timerId);
            callback();
        }, delayMs);

        this.timers.add(timerId);
        return timerId;
    }

    clearTimers() {
        this.timers.forEach((timerId) => window.clearTimeout(timerId));
        this.timers.clear();
    }

    addPrompt(message) {
        if (!this.promptWindow || !message || !message.trim()) {
            return;
        }

        this.stopAutoplay();
        this.preparePromptWindow();
        this.promptWindow.replaceChildren();

        this.promptList.push(message);
        this.appendMessage('client', message.trim());

        window.setTimeout(() => this.answer(), 600);
    }

    answer() {
        if (!this.promptWindow) {
            return;
        }

        const responses = {
            'website build': 'Good fit. We will scope the site, set clear milestones, and build it in phases so launch stays predictable.',
            'web app': 'Great use case. We will map the workflow, define the architecture, and ship the first release around core daily work.',
            'mobile app': 'Works well for mobile. We will lock core features first, plan the release cadence, and support updates after launch.',
            'internal business tool': 'Perfect for an internal tool. We will design around your team workflow and roll it out in phases with support.'
        };

        const message = responses[this.chatModel] || responses['website build'];
        this.appendMessage('codev', message);
    }
}

window.Prompt = Prompt;

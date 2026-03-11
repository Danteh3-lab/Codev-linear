(function () {
    class LaserFlowBridge {
        constructor(container) {
            this.container = container;
            this.shell = container ? container.closest('.laser-flow-bridge-shell') : null;
            this.target = document.getElementById('project-starter-playground');
            this.promptWindow = this.target ? this.target.querySelector('.prompt-container') : null;
            this.revealZone = document.getElementById('laser-reveal-zone');
            this.revealLayer = document.getElementById('laser-flow-reveal');
            this.video = container ? container.querySelector('video') : null;
            this.pointerFineQuery = window.matchMedia('(pointer: fine)');
            this.reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.resizeFrame = null;
            this.handleResize = this.handleResize.bind(this);
            this.handlePointerMove = this.handlePointerMove.bind(this);
            this.resetReveal = this.resetReveal.bind(this);
            this.handlePreferenceChange = this.handlePreferenceChange.bind(this);
        }

        init() {
            if (!this.container || !this.shell || !this.target || this.container.dataset.laserReady === 'true') {
                return;
            }

            this.container.dataset.laserReady = 'true';
            this.bindEvents();
            this.handleResize();
            this.playVideo();
            this.resetReveal();
        }

        bindEvents() {
            window.addEventListener('resize', this.handleResize);
            document.addEventListener('pointermove', this.handlePointerMove, { passive: true });
            document.addEventListener('pointerleave', this.resetReveal);
            document.addEventListener('visibilitychange', () => {
                this.playVideo();
            });

            if (typeof this.pointerFineQuery.addEventListener === 'function') {
                this.pointerFineQuery.addEventListener('change', this.handlePreferenceChange);
                this.reduceMotionQuery.addEventListener('change', this.handlePreferenceChange);
            } else if (typeof this.pointerFineQuery.addListener === 'function') {
                this.pointerFineQuery.addListener(this.handlePreferenceChange);
                this.reduceMotionQuery.addListener(this.handlePreferenceChange);
            }
        }

        playVideo() {
            if (!this.video) {
                return;
            }

            const playPromise = this.video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => { });
            }
        }

        handlePreferenceChange() {
            this.resetReveal();
        }

        updateAlignment() {
            const alignmentTarget = this.promptWindow || this.target;
            if (!alignmentTarget) {
                return;
            }

            const shellRect = this.shell.getBoundingClientRect();
            const targetRect = alignmentTarget.getBoundingClientRect();
            const center = targetRect.left + (targetRect.width / 2) - shellRect.left;
            this.shell.style.setProperty('--laser-bridge-center', `${center}px`);
        }

        handleResize() {
            if (this.resizeFrame) {
                window.cancelAnimationFrame(this.resizeFrame);
            }

            this.resizeFrame = window.requestAnimationFrame(() => {
                this.updateAlignment();
                this.resetReveal();
            });
        }

        handlePointerMove(event) {
            if (!this.revealLayer || !this.revealZone) {
                return;
            }

            if (!this.pointerFineQuery.matches || this.reduceMotionQuery.matches || window.innerWidth <= 767) {
                this.resetReveal();
                return;
            }

            const zoneRect = this.revealZone.getBoundingClientRect();
            const withinZone =
                event.clientX >= zoneRect.left &&
                event.clientX <= zoneRect.right &&
                event.clientY >= zoneRect.top &&
                event.clientY <= zoneRect.bottom;

            if (!withinZone) {
                this.resetReveal();
                return;
            }

            this.revealLayer.dataset.active = 'true';
            this.revealLayer.style.setProperty('--mx', `${event.clientX - zoneRect.left}px`);
            this.revealLayer.style.setProperty('--my', `${event.clientY - zoneRect.top}px`);
        }

        resetReveal() {
            if (!this.revealLayer) {
                return;
            }

            this.revealLayer.dataset.active = 'false';
            this.revealLayer.style.setProperty('--mx', '-9999px');
            this.revealLayer.style.setProperty('--my', '-9999px');
        }
    }

    window.initLaserFlowBridge = function initLaserFlowBridge() {
        const container = document.getElementById('laser-flow-bridge');
        if (!container) {
            return null;
        }

        if (window.__laserFlowBridge) {
            return window.__laserFlowBridge;
        }

        const bridge = new LaserFlowBridge(container);
        bridge.init();
        window.__laserFlowBridge = bridge;
        return bridge;
    };
})();

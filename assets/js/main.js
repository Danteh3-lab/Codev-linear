document.addEventListener('DOMContentLoaded', () => {
    const initLaserFlowBridge = window.initLaserFlowBridge;
    const PromptCtor = window.Prompt;
    const TypedCtor = window.Typed;
    const body = document.body;
    const serviceLabel = document.getElementById('mobile-service-label');
    const phaseLabel = document.getElementById('mobile-phase-label');
    const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = prefersReducedMotionQuery.matches;
    const serviceIcons = {
        'website build': 'solar:laptop-minimalistic-linear',
        'web app': 'solar:smartphone-linear',
        'mobile app': 'solar:cloud-linear',
        'internal business tool': 'solar:shield-check-linear'
    };

    const initSecurityRadar = () => {
        const host = document.querySelector('[data-security-radar]');
        if (!host) {
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const mouse = { x: 0.5, y: 0.5 };
        const targetMouse = { x: 0.5, y: 0.5 };
        let frameId = 0;
        let width = 0;
        let height = 0;
        let deviceScale = 1;

        canvas.setAttribute('aria-hidden', 'true');
        host.appendChild(canvas);

        const resize = () => {
            width = Math.max(host.clientWidth, 1);
            height = Math.max(host.clientHeight, 1);
            deviceScale = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * deviceScale);
            canvas.height = Math.round(height * deviceScale);
            context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
        };

        const drawRadar = (time) => {
            context.clearRect(0, 0, width, height);

            const radius = Math.min(width, height) * 0.36;
            const centerX = width * (prefersReducedMotion ? 0.74 : 0.72) + (mouse.x - 0.5) * 16;
            const centerY = height * 0.42 + (mouse.y - 0.5) * 16;
            const ringCount = 10;
            const spokeCount = 10;
            const sweepAngle = prefersReducedMotion ? Math.PI * 1.55 : time * 0.001;

            const background = context.createRadialGradient(centerX, centerY, radius * 0.08, centerX, centerY, radius * 1.35);
            background.addColorStop(0, 'rgba(149, 160, 183, 0.1)');
            background.addColorStop(0.55, 'rgba(59, 64, 73, 0.08)');
            background.addColorStop(1, 'rgba(8, 9, 10, 0)');
            context.fillStyle = background;
            context.beginPath();
            context.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = 'rgba(131, 138, 151, 0.22)';
            context.lineWidth = 1;
            for (let ringIndex = 1; ringIndex <= ringCount; ringIndex += 1) {
                const ringRadius = (radius / ringCount) * ringIndex;
                context.beginPath();
                context.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
                context.stroke();
            }

            for (let spokeIndex = 0; spokeIndex < spokeCount; spokeIndex += 1) {
                const angle = (Math.PI * 2 * spokeIndex) / spokeCount;
                context.strokeStyle = 'rgba(113, 121, 134, 0.16)';
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
                context.stroke();
            }

            const sweepGradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            sweepGradient.addColorStop(0, 'rgba(201, 211, 229, 0.22)');
            sweepGradient.addColorStop(0.68, 'rgba(122, 131, 147, 0.09)');
            sweepGradient.addColorStop(1, 'rgba(8, 9, 10, 0)');
            context.fillStyle = sweepGradient;
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.arc(centerX, centerY, radius, sweepAngle - 0.22, sweepAngle + 0.22);
            context.closePath();
            context.fill();

            context.strokeStyle = 'rgba(214, 223, 238, 0.8)';
            context.lineWidth = 1.5;
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(centerX + Math.cos(sweepAngle) * radius, centerY + Math.sin(sweepAngle) * radius);
            context.stroke();

            const pulseRadius = radius * 0.58;
            const pulseX = centerX + Math.cos(sweepAngle * 1.2) * pulseRadius;
            const pulseY = centerY + Math.sin(sweepAngle * 1.2) * pulseRadius;
            const pulse = context.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, radius * 0.12);
            pulse.addColorStop(0, 'rgba(245, 247, 250, 0.95)');
            pulse.addColorStop(0.35, 'rgba(179, 188, 206, 0.7)');
            pulse.addColorStop(1, 'rgba(179, 188, 206, 0)');
            context.fillStyle = pulse;
            context.beginPath();
            context.arc(pulseX, pulseY, radius * 0.12, 0, Math.PI * 2);
            context.fill();

            const markerAngles = [0.42, 1.08, 1.74];
            markerAngles.forEach((marker, index) => {
                const markerRadius = radius * (0.32 + index * 0.18);
                const markerX = centerX + Math.cos(marker * Math.PI) * markerRadius;
                const markerY = centerY + Math.sin(marker * Math.PI) * markerRadius;
                context.fillStyle = 'rgba(197, 205, 218, 0.6)';
                context.beginPath();
                context.arc(markerX, markerY, 2.5, 0, Math.PI * 2);
                context.fill();
            });
        };

        const animate = (time) => {
            if (!prefersReducedMotion) {
                mouse.x += (targetMouse.x - mouse.x) * 0.05;
                mouse.y += (targetMouse.y - mouse.y) * 0.05;
            }

            drawRadar(time);

            if (!prefersReducedMotion) {
                frameId = window.requestAnimationFrame(animate);
            }
        };

        const handlePointerMove = (event) => {
            const rect = host.getBoundingClientRect();
            targetMouse.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
            targetMouse.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        };

        const handlePointerLeave = () => {
            targetMouse.x = 0.5;
            targetMouse.y = 0.5;
        };

        resize();
        if (prefersReducedMotion) {
            drawRadar(0);
        } else {
            host.addEventListener('pointermove', handlePointerMove);
            host.addEventListener('pointerleave', handlePointerLeave);
            frameId = window.requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
    };

    const initMobileNav = () => {
        const toggle = document.getElementById('mobile-nav-toggle');
        const panel = document.getElementById('mobile-nav-panel');
        const backdrop = document.getElementById('mobile-nav-backdrop');
        const links = panel ? panel.querySelectorAll('[data-mobile-nav-link]') : [];

        if (!toggle || !panel || !backdrop || !body) {
            return;
        }

        let closeTimer = null;

        const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

        const finishClose = () => {
            panel.hidden = true;
            backdrop.hidden = true;
        };

        const closeNav = () => {
            if (!isOpen()) {
                return;
            }

            toggle.setAttribute('aria-expanded', 'false');
            panel.classList.remove('is-open');
            backdrop.classList.remove('is-open');
            body.classList.remove('mobile-nav-open');

            window.clearTimeout(closeTimer);
            closeTimer = window.setTimeout(finishClose, 180);
        };

        const openNav = () => {
            if (isOpen()) {
                return;
            }

            window.clearTimeout(closeTimer);
            panel.hidden = false;
            backdrop.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('mobile-nav-open');

            window.requestAnimationFrame(() => {
                panel.classList.add('is-open');
                backdrop.classList.add('is-open');
            });
        };

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isOpen()) {
                closeNav();
                return;
            }

            openNav();
        });

        backdrop.addEventListener('click', closeNav);

        links.forEach((link) => {
            link.addEventListener('click', closeNav);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNav();
            }
        });

        document.addEventListener('click', (event) => {
            if (!isOpen()) {
                return;
            }

            const target = event.target;
            if (panel.contains(target) || toggle.contains(target)) {
                return;
            }

            closeNav();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                closeNav();
            }
        });
    };

    const syncMobileSheet = (value) => {
        if (!value) {
            return;
        }

        const normalized = value.toLowerCase();
        if (serviceLabel) {
            serviceLabel.textContent = value;
        }

        const serviceIcon = document.querySelector('.mobile-chat-sheet__icon iconify-icon');
        if (serviceIcon && serviceIcons[normalized]) {
            serviceIcon.setAttribute('icon', serviceIcons[normalized]);
        }

        if (phaseLabel) {
            phaseLabel.textContent = normalized === 'internal business tool' ? 'Ops Workflow Ready' : 'Discovery Ready';
        }
    };

    initMobileNav();

    document.querySelectorAll('a[data-coming-soon="true"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
        });
    });

    if (typeof initLaserFlowBridge === 'function') {
        initLaserFlowBridge();
    }

    initSecurityRadar();

    const typedTarget = document.getElementById('prompts-sample');
    if (typedTarget) {
        if (prefersReducedMotion) {
            typedTarget.textContent = 'Need a business website that feels solid?';
        } else if (typeof TypedCtor === 'function') {
            new TypedCtor('#prompts-sample', {
                strings: [
                    'Need a business website that feels solid?',
                    'Need a web app built around how your users actually work?',
                    'Thinking about a mobile app for your customers?',
                    'Need an internal tool that saves your team time?'
                ],
                typeSpeed: 40,
                backSpeed: 20,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }
    }

    const playground = document.getElementById('project-starter-playground');
    const form = document.getElementById('prompt-form');
    const input = form ? form.querySelector('input[name="prompt"]') : null;
    const serviceSelect = document.getElementById('service-select');
    const promptSystem = (playground && typeof PromptCtor === 'function')
        ? new PromptCtor('#project-starter-playground', { autoplay: !prefersReducedMotion })
        : null;

    if (playground) {
        playground.addEventListener('prompt:model-change', (event) => {
            const model = event.detail && event.detail.model ? event.detail.model : '';
            if (!model) {
                return;
            }

            syncMobileSheet(model.replace(/\b\w/g, (character) => character.toUpperCase()));
        });
    }

    if (serviceSelect) {
        syncMobileSheet(serviceSelect.value);

        serviceSelect.addEventListener('change', (event) => {
            const value = event.target.value;

            if (promptSystem) {
                promptSystem.stopAutoplay();
                promptSystem.setAIModel(value);
            }

            syncMobileSheet(value);
        });
    }

    if (!form || !input || !promptSystem) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        promptSystem.addPrompt(input.value);
        input.value = '';
    });
});
